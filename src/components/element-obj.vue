<template>
    <foreignObject :x="elem.at.x" :y="elem.at.y"
        :class="dragClasses"
        @mousedown.stop="onMouseDown" @contextmenu.prevent.stop>
        <slot/>
    </foreignObject>
</template>

<style scoped>
foreignObject {
    overflow: visible;
    white-space: nowrap;
    user-select: none;
}
</style>

<script lang="ts">
import Vue from 'vue';
import { Point2D } from '../geom';
import { DragBuddy } from './drag';


class ElementDragBuddy<V extends Vue & {dragState: {c: string}, elem: {at: Point2D}} = Vue & {dragState: {c: string}, elem: {at: Point2D}}> extends DragBuddy<V> {
    origin() {
        return {origin: this.o.elem.at};
    }
}


export default Vue.extend({
    props: ['elem'],
    data: () => ({dragState: undefined}),
    computed: {
        dragClasses() { return DragBuddy.classes(this.dragState); }
    },
    mounted() {
        this._drag = new ElementDragBuddy(this);
    },
    methods: {
        onMouseDown(ev: MouseEvent) {
            if (ev.button == 2) this.$emit('action', {type: 'menu', ev});
            else this._drag.start(ev);
        }
    }
})
</script>