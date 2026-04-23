import { ComputedRef, computed, ref, reactive, ComponentPublicInstance } from 'vue';
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
                throw new Error(`invalid operation '${op}' (in: )`);

            try {
                args = args.map(a => a.$ ? this.getElement(a.$) :
                                    a['@'] ? this.func(a['@']) : a);
                o = o[op](...args);
            }
            catch (e) {
                throw new Error(`${e.message} (in: ${JSON.stringify(instructions)})`);
            }
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

    getElement(id: M.Id) {
        let e = this.view.model.findId(id);
        if (!e) throw new Error(`stale element '${id}'`);
        return e;
    }

    getUI(element: M.Element) {
        return this.view.uiMap?.get(element.id);
    }
}

class ControlPlane extends ControlCommon {
    attach: Attach
    compute: Compute

    options: {
        scope?: object
        deferred?: boolean
    }

    constructor(view: IWhiteboardApp, options: ControlPlane['options'] = {}) {
        super(view);
        this.attach = new Attach(view).withQualifiedPath(['attach']);
        this.compute = new Compute(view).withQualifiedPath(['compute']);

        if (options.scope) this.compute.scope = options.scope;
        if (!options.deferred && this.view.model) this.initiate();
    }

    initiate(scope?: object) {
        if (scope) this.compute.scope = scope;

        for (let [category, ...spec] of this.view.model.dataflow ?? []) {
            try {
                switch (category) {
                    case 'attach': this.attach.apply(spec); break;
                    case 'compute': this.compute.apply(spec); break;
                    default:
                        console.warn(`invalid dataflow category '${category}'`);
                }
            }
            catch (e) { console.warn('[dataflow] in', category, spec, e); }
        }
    }

    commit(instruction: [string, ...Instruction[]]) {
        this.view.model.dataflow.push(instruction);
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
            fromValue: (from: M.Element & ValueSource, func: (input: any, ui?: ComponentPublicInstance) => any) => {
                let get = this.source(from), getUI = () => this.getUI(from);
                put(as(computed(() => this.eval(() => func(get().value, getUI())))));
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


type Instruction = [string, ...any[]]

// `content` is somewhat of a wrinkle
type ValueSource = Value & {content?: Value}
type ValueSink = ValueSource


function as<T>(c: ComputedRef<T>): T {
    return c as any;
}


export { ControlPlane, Attach, Compute, Instruction }