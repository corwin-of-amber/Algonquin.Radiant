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
import { ElementDragBuddy } from './elements/drag';


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