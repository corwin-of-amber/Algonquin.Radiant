<template>
    <g class="connector" :class="dragClasses">
        <line class="shape" :x1="p[0].x" :y1="p[0].y" :x2="p[1].x" :y2="p[1].y"/>
        <line class="hover" :x1="p[0].x" :y1="p[0].y" :x2="p[1].x" :y2="p[1].y"/>
        <circle v-for="(at, $i) in elem.at" :key="$i" class="endpoint"
                :cx="at.x" :cy="at.y" @mousedown="epMouseDown($i, $event)"/>
    </g>
</template>

<script lang="ts">
import { ComponentPublicInstance } from 'vue';
import { Vue, Component, Prop, toNative } from 'vue-facing-decorator';
import { Point2D } from '../geom';
import { DragBuddy } from './drag';


class EndpointDragBuddy<V extends ComponentPublicInstance & {dragState: {c: string}, elem: {at: Point2D[]}} = ComponentPublicInstance & {dragState: {c: string}, elem: {at: Point2D[]}}> extends DragBuddy<V> {
    idx: number

    constructor(o: V, idx: number) { super(o); this.idx = idx; }

    origin() {
        return {origin: {...this.o.elem.at[this.idx]}, ep: this.idx};
    }
}

@Component({
    emits: ['action']
})
class ElementConnector extends Vue {
    @Prop
    elem: {at: Point2D[]} = undefined
    dragState = undefined
    _drag: any

    get p() { return this.elem.at; }
    get dragClasses() { return DragBuddy.classes(this.dragState); }

    mounted() {
        this._drag = [0, 1].map(i => new EndpointDragBuddy(this, i));
    }

    epMouseDown(ep: number, ev: MouseEvent) {
        this._drag[ep].start(ev);
    }
}

export default toNative(ElementConnector)
</script>