<template>
    <foreignObject :x="elem.at.x" :y="elem.at.y"
        :class="dragClasses"
        @mousedown.stop="onMouseDown" @mouseup="dragEnd" @contextmenu.prevent.stop>
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
import Vue from 'vue'

export default Vue.extend({
    props: ['elem'],
    data: () => ({dragState: undefined}),
    computed: {
        dragClasses() {
            return {[`drag-${this.dragState?.c}`]: !!this.dragState};
        }
    },
    methods: {
        onMouseDown(ev: MouseEvent) {
            if (ev.button == 2) this.$emit('action', {type: 'menu', ev});
            else this.dragStart(ev);
        },
        dragStart(ev: MouseEvent) {
            this.dragState = {c: 'move'};
            document.addEventListener('mouseup', ev => this.dragEnd(ev), {once: true});
            this._dragGesture = {origin: this.elem.at, from: {x: ev.x, y: ev.y}};
            this._moveh = (ev: MouseEvent) => this.dragMove(ev);
            document.addEventListener('mousemove', this._moveh);
        },
        dragMove(ev: MouseEvent) {
            var g = this._dragGesture;
            this.$emit('action', {
                type: 'move',
                origin: g.origin,
                gesture: {from: g.from, to: {x: ev.x, y: ev.y}}
            });
        },
        dragEnd() {
            this.dragState = undefined;
            document.removeEventListener('mousemove', this._moveh);
        }
    }
})
</script>