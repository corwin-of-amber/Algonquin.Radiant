import Vue from 'vue'


abstract class DragBuddy<V extends Vue & {dragState: {c: string}} = Vue & {dragState: {c: string}}, A={}> {
    o: V
    _dragGesture: {origin: A, from: any}
    _moveh: (ev: MouseEvent) => void;

    constructor(o: V) { this.o = o; }

    abstract origin(): A

    start(ev: MouseEvent) {
        this.o.dragState = {c: 'move'};
        this._dragGesture = {origin: this.origin(), from: {x: ev.x, y: ev.y}};
        this._moveh = (ev: MouseEvent) => this.move(ev);
        document.addEventListener('mousemove', this._moveh);
        document.addEventListener('mouseup', ev => this.end(ev), {once: true});
    }

    move(ev: MouseEvent) {
        var g = this._dragGesture;
        this.o.$emit('action', {
            type: 'move',
            ...g.origin,
            gesture: {from: g.from, to: {x: ev.x, y: ev.y}}
        });
    }

    end(ev: MouseEvent) {
        this.o.dragState = undefined;
        document.removeEventListener('mousemove', this._moveh);
    }

    static classes(dragState?: {c: string}) {
        return {[`drag-${dragState?.c}`]: !!dragState};
    }
}


export { DragBuddy }
