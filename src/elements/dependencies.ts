import { ComputedRef, computed, ref, reactive } from 'vue';
import { Polyline } from 'sketchvg/src/shape';
import { ShapeComponentBase } from 'sketchvg/src/components/shape';

import { DocumentModel as M } from '../model';
import { Point2D } from '../geom';
import { IWhiteboardApp } from '../components/whiteboard.vue';
import { Value } from './values';

/**
 * Control objects perform data-flow computations in a way that can be
 * configured dynamically, and such that the configuration can be
 * serialized to allow storing it and retrieving it later.
 */
class ControlCommon {
    view: IWhiteboardApp
    qualifiedPath: string[] = []

    constructor(view: IWhiteboardApp) {
        this.view = view;
    }

    /**
     * The qualified path is a prefix added to instruction chunks emanating
     * from this control object.
     * 
     * e.g. `[['value', {$:'id87'}]]` becomes `['compute', ['value', {$:'id87'}]]`
     *   (when path = `['compute']`)
     */
    withQualifiedPath(path: string[]) {
        this.qualifiedPath = path;
        return this;
    }

    apply(instructions: Instruction[]) {
        let o: object = this;
        for (let [op, ...args] of instructions) {
            if (typeof o[op] !== 'function')
                throw new Error(`invalid operation '${op}' (in: ${JSON.stringify(instructions)})`);
            args = args.map(a => a.$ ? this.view.model.findId(a.$) :
                                 a['@'] ? this.func(a['@']) : a);
            o = o[op](...args);
        }
        return o;
    }

    qualify(instructions: Instruction[]) {
        return [...this.qualifiedPath, ...instructions];
    }

    func(code: string) {
        /* unsafe */
        return new Function(`return (${code})`)();
    }
}

/**
 * Used to associate elements in a way that moving one of them
 * immediately affects the other.
 */
class Attach extends ControlCommon {

    /**
     * Attach an element's `at` coordinate
     */
    element(slave: M.Element) {
        return {
            toElement: (master: M.Element) => {
                slave.at = this.viaOffset(() => master.at, slave.at);
                return [['element', {$:slave.id}], ['toElement', {$:master.id}]];
            }
        }
    }

    /**
     * Attach a vertex in a polyline
     */
    vertex(slave: M.Element & {shape: Polyline}, idx = 0) {
        let u = slave.shape.vertices[idx >= 0 ? idx : slave.shape.vertices.length + idx];
        return {
            toElement: (master: M.Element) => {
                u.at = this.viaOffset(() => master.at, u.at,
                    () => this.pokeShape(slave));
                return [['vertex', {$:slave.id}, idx], ['toElement', {$:master.id}]];
            }
        }
    }

    /* helper functions */

    viaOffset(from: () => Point2D, to: Point2D, poke = () => {}) {
        let ofs = ref(Point2D.sub(to, from()));
        return as(computed({
            get: () => (poke(), Point2D.add(from(), ofs.value)),
            set: (pt) => ofs.value = Point2D.sub(pt, from())
        }));
    }

    pokeShape(e: M.Element) {
        let shape = this.view.sketchSync.get(e);
        if (shape instanceof ShapeComponentBase)
            requestAnimationFrame(() => { shape.deselect(); shape.update(); });
    }
}

class Compute extends ControlCommon {
    scope = reactive<object>({})

    value(of: M.Element & ValueSink) {
        let put = this.sink(of), pfx = this.qualify([['value', {$:of.id}]]);
        return {
            fromValue: (from: M.Element & ValueSource, func: (input: any) => any) => {
                let get = this.source(from);
                put(as(computed(() => this.eval(() => func(get().value)))));
                return [...pfx, ['fromValue', {$:from.id}, {'@':func.toString()}]];
            },
            fromFuncValue: (func: M.Element & ValueSource, ...args: (M.Element & ValueSource)[]) => {
                let getf = this.source(func), geta = args.map(a => this.source(a));
                put(as(computed(() => this.eval(() =>
                    getf().value(...geta.map(f => f().value))))));
                return [...pfx, ['fromFuncValue', {$:func.id}, ...args.map(a => ({$:a.id}))]];
            },
            fromScope: (func: (input: object) => any) => {
                put(as(computed(() => this.eval(() => func(this.scope)))));
                return [...pfx, ['fromScope', {'@':func.toString()}]];
            }
        }
    }

    /* helper functions */

    source(source: M.Element & ValueSource) {
        return source.content ? () => source.content : () => source;
    }

    sink(target: M.Element & ValueSink) {
        return target.content ? (v: Value) => { target.content = v; }
            : (v: Value) => { target.value = v.value; target.err = v.err; };
    }

    eval(func: () => any) {
        try {
            return {value: func()};
        }
        catch (e) {
            return {err: `${e}`};
        }
    }
}


type Instruction = [string, ...any]

// `content` is somewhat of a wrinkle
type ValueSource = Value & {content?: Value}
type ValueSink = ValueSource


function as<T>(c: ComputedRef<T>): T {
    return c as any;
}


export { Attach, Compute, Instruction }