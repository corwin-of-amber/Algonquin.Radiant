<template>
    <svg class="whiteboard" xmlns="http://www.w3.org/2000/svg">
        <circle r="50" cx="100" cy="100"/>
        <obj v-for="elem in model.elements" :key="elem.id" :elem="elem"
             @action="elemAction(elem, $event)">
            <conj :tex="elem.tex"/>
        </obj>
    </svg>
</template>

<style lang="css" scoped>
circle {
    stroke: #ddd;
    stroke-width: 2px;
    fill: none;
}
.drag-move > * {
    background: #6f00ff20;
}
</style>

<script lang="ts">
import Vue from 'vue';
import conj from './conjecture-katex.vue';
import obj from './element-obj.vue';
import { DocumentModel, DocumentActions } from '../model';

import Element = DocumentModel.Element;
import Action = DocumentActions.Action;
import MoveAction = DocumentActions.MoveAction;
import SelectAction = DocumentActions.SelectAction;


export default Vue.extend({
    props: ['model'],
    components: {conj, obj},
    methods: {
        elemAction(elem: Element, action: Action) {
            switch (action.type) {
            case 'select':  this.elemSelect(elem, action); break;
            case 'move':    this.elemMove(elem, action); break;
            }
        },
        elemSelect(elem: Element, action: SelectAction) {
            console.log('select', elem);
        },
        elemMove(elem: Element, action: MoveAction) {
            var o = action.origin, g = action.gesture;
            elem.at = {x: o.x + g.to.x - g.from.x,
                       y: o.y + g.to.y - g.from.y};
        }
    }
})
</script>