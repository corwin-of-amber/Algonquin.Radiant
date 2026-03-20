import { ComputedRef, computed, ref } from 'vue';
import { Polyline } from 'sketchvg/src/shape';

import { DocumentModel as M } from '../model';
import { Point2D } from '../geom';
import { IWhiteboardApp } from '../components/whiteboard.vue';
import { ShapeComponentBase } from 'sketchvg/src/components/shape';


/**
 * Used to associate elements in a way that moving one of them
 * immediately affects the other.
 */
class Attach {
    view: IWhiteboardApp

    constructor(view: IWhiteboardApp) {
        this.view = view;
    }

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

    apply(instructions: Instruction[]) {
        let o: object = this;
        for (let [op, ...args] of instructions) {
            if (typeof o[op] !== 'function')
                throw new Error(`invalid operation '${op}' (in: ${JSON.stringify(instructions)})`);
            args = args.map(a => a.$ ? this.view.model.findId(a.$) : a);
            o = o[op](...args);
        }
        return o;
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


type Instruction = [string, ...any]


function as<T>(c: ComputedRef<T>): T {
    return c as any;
}


export { Attach, Instruction }