<template>
    <circle class="widget--knob" :cx="widget.at.x" :cy="widget.at.y"
        :class="dragClasses"
        @mousedown.stop="onMouseDown" @contextmenu.prevent.stop/>
</template>

<style scoped>
circle.widget--knob {
    r: 4px;
    stroke: black;
    stroke-width: 1;
    fill: beige;
}
</style>

<script lang="ts">
import { WidgetDragBuddy } from './drag';


export default {
    props: ['widget', 'elem'],
    data: () => ({dragState: undefined}),
    computed: {
        dragClasses() { return WidgetDragBuddy.classes(this.dragState); }
    },
    mounted() {
        this._drag = new WidgetDragBuddy(this);
    },
    methods: {
        onMouseDown(ev: MouseEvent) {
            if (ev.button == 2) this.$emit('action', {type: 'menu', ev});
            else this._drag.start(ev);
        }
    }
}
</script>