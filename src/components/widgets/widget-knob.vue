<template>
    <circle class="widget--knob" :cx="elem.at.x" :cy="elem.at.y"
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
import { ElementDragBuddy } from '../elements/drag';


export default {
    props: ['elem'],
    data: () => ({dragState: undefined}),
    computed: {
        dragClasses() { return ElementDragBuddy.classes(this.dragState); }
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
}
</script>