<template>
    <g>
        <knob :elem="elem" @action="$emit('action', $event)" @click="toggle"/>
        <value v-if="elem.expand" :ref="associate"
              :elem="subelem" @action="$emit('action', adjust(subelem, $event))"/>
    </g>
</template>

<script lang="ts">
import { Vue, Component, Prop, Ref, toNative } from 'vue-facing-decorator';
import { DocumentModel as M, DocumentActions as A } from '../../model';
import { Point2D } from '../../geom';
import { StableObj } from '../../infra/reactivity';

import knob from './widget-knob.vue'
import value, { IElementValue, Props as ValueProps } from '../elements/element-value.vue';
import { ITabular } from 'vue-tabular';


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
    @Prop({default: {x: -10, y: +10}}) offset: Point2D

    _subelem = new StableObj<M.Element & ValueProps>()

    /** @todo this should allow a variety of interactions, not just ITabular */
    interaction: ITabular = undefined

    toggle() {
        this.elem.expand = !this.elem.expand;
    }

    get subelem(): M.Element & ValueProps {
        return this._subelem.set({
            id: `${this.elem.id}[1]`,
            type: 'block',
            at: Point2D.add(this.elem.at, this.offset),
            ...this.elem.content
        });
    }

    adjust(elem: M.Element, action: A.MoveAction) {
        if (action.origin)
            action.origin = Point2D.add(action.origin,
                    Point2D.sub(this.elem.at, elem.at));
        return action;
    }

    async associate(pane: IElementValue) {
        await Promise.resolve();
        this.interaction = pane?.tabular.inner;
    }
}

export { IDrawerWidget, Props }
export default toNative(IDrawerWidget);
</script>