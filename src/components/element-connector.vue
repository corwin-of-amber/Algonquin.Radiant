<template>
    <g class="connector" :class="dragClasses">
        <line class="shape" :x1="p[0].x" :y1="p[0].y" :x2="p[1].x" :y2="p[1].y"/>
        <line class="hover" :x1="p[0].x" :y1="p[0].y" :x2="p[1].x" :y2="p[1].y"/>
        <circle v-for="(at, $i) in elem.at" :key="$i" class="endpoint"
                :cx="at.x" :cy="at.y" @mousedown="epMouseDown($i, $event)"/>
    </g>
</template>

<script lang="ts">
import Vue from 'vue'
import { Point2D } from '../model';

abstract class DragBuddy<V extends Vue & {dragState: {c: string}} = Vue & {dragState: {c: string}}, A={}> {
    o: V
    _dragGesture: {origin: A, from: any}
    _moveh: (ev: MouseEvent) => void;

    constructor(o: V) { this.o = o; }

    abstract origin(): A

    start(ev: MouseEvent) {
        this.o.dragState = {c: 'move'};
        document.addEventListener('mouseup', ev => this.end(ev), {once: true});
        this._dragGesture = {origin: this.origin(), from: {x: ev.x, y: ev.y}};
        this._moveh = (ev: MouseEvent) => this.move(ev);
        document.addEventListener('mousemove', this._moveh);
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


class EndpointDragBuddy<V extends Vue & {dragState: {c: string}, elem: {at: Point2D[]}} = Vue & {dragState: {c: string}, elem: {at: Point2D[]}}> extends DragBuddy<V> {
    idx: number

    constructor(o: V, idx: number) { super(o); this.idx = idx; }

    origin() {
        return {origin: {...this.o.elem.at[this.idx]}, ep: this.idx};
    }
}

export default Vue.extend({
    props: ["elem"],
    data: () => ({dragState: undefined}),
    computed: {
        p() { return this.elem.at; },
        dragClasses() { return DragBuddy.classes(this.dragState); }
    },
    mounted() {
        this._drag = [0, 1].map(i => new EndpointDragBuddy(this, i));
    },
    methods: {
        epMouseDown(ep: number, ev: MouseEvent) {
            this._drag[ep].start(ev);
        }
    }
});
</script>