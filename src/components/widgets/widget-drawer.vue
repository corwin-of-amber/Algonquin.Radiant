<template>
    <g>
        <knob :elem="elem" @action="$emit('action', $event)" @click="toggle"/>
        <value v-if="elem.expand" 
              :elem="subelem" @action="$emit('action', adjust(subelem, $event))"/>
    </g>
</template>

<script lang="ts">
import { Vue, Component, Prop, toNative } from 'vue-facing-decorator';
import { DocumentModel as M, DocumentActions as A } from '../../model';
import { Point2D } from '../../geom';

import knob from './widget-knob.vue'
import value, { Props as ValueProps } from '../elements/element-value.vue';

interface Props {
    content: ValueProps
    expand: boolean
}

@Component({
    components: { knob, value },
    emits: ['action']
})
class IDrawerWidget extends Vue {
    @Prop elem: M.Element & Props
    offset: Point2D = {x: -10, y: +10}

    toggle() {
        this.elem.expand = !this.elem.expand;
    }

    get subelem(): M.Element & ValueProps {
        let at = this.elem.at;
        return {
            id: `${this.elem.id}[1]`,
            type: 'block',
            at: Point2D.add(this.elem.at, this.offset),
            ...this.elem.content
        };
    }

    adjust(elem: M.Element, action: A.MoveAction) {
        action.origin =
            Point2D.add(action.origin, Point2D.sub(this.elem.at, elem.at));
        return action;
    }
}

export { IDrawerWidget, Props }
export default toNative(IDrawerWidget);
</script>