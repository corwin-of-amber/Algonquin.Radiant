<template>
    <foreignObject :x="elem.at.x" :y="elem.at.y"
        class="element--obj" :class="dragClasses"
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
import { Vue, Component, Prop, toNative } from 'vue-facing-decorator';
import { ElementDragBuddy } from './elements/drag';

@Component({
    emits: ['action']
})
class ElementObj extends Vue {
    @Prop elem = undefined
    dragState = undefined
    _drag: any

    get dragClasses() { return ElementDragBuddy.classes(this.dragState); }
    
    mounted() {
        this._drag = new ElementDragBuddy(this);
    }

    onMouseDown(ev: MouseEvent) {
        if (ev.button == 2) this.$emit('action', {type: 'menu', ev});
        else this._drag.start(ev);
    }
}

export default toNative(ElementObj)
</script>