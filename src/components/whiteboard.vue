<template>
    <div class="whiteboard" @contextmenu.stop.prevent>
        <svg xmlns="http://www.w3.org/2000/svg" @mousedown="onMouseDown">
            <circle r="400" cx="150" cy="0"/>
            <circle r="400" cx="500" cy="500"/>
            <obj v-for="elem in model.elements" :key="elem.id" :elem="elem"
                @action="elemAction(elem, $event)">
                <conj :tex="elem.tex"/>
            </obj>
        </svg>
        <whiteboard-context-menu ref="contextMenu" @action="menuAction"/>
    </div>
</template>

<style lang="css" scoped>
svg {
    width: 100%;
    height: 100%;
}
circle {
    stroke: #eee;
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
import WhiteboardContextMenu from './whiteboard-context-menu.vue';
import { DocumentModel as M, DocumentActions as A, Point2D } from '../model';


export default Vue.extend({
    props: ['model'],
    components: {conj, obj, WhiteboardContextMenu},
    methods: {
        elemAction(elem: M.Element, action: A.Action) {
            switch (action.type) {
            case 'select':  this.elemSelect(elem, action);   break;
            case 'menu':    this.elemMenu(elem, action);     break;
            }
            this.$emit('action', {doc: this.model, elem}, action);
        },
        elemSelect(elem: M.Element, action: A.SelectAction) {
            console.log('select', elem);
        },
        elemMenu(elem: M.Element, action: A.MenuAction) {
            setTimeout(() =>
                this.$refs.contextMenu.open(action.ev, {elem}), 0);
        },

        menuAction(ev: {type: string, for: MenuContext}) {
            switch (ev.type) {
            case 'new-conj':  this.menuNewConj(ev.for);  break;
            case 'cut':
            case 'delete':    this.menuDelete(ev.for);   break;
            }
        },
        menuNewConj(ctx: MenuContext) {
            var newElem: M.Element = {
                id: M.mkId(this.model), 
                at: ctx.at, tex: "xyz"
            } as M.Element;
            this.$emit('action', {doc: this.model}, {type: 'create', newElem});
        },
        menuDelete(ctx: MenuContext) {
            this.$emit('action', {doc: this.model, elem: ctx.elem}, {type: 'delete'});
        },

        onMouseDown(ev: MouseEvent) {
            if (ev.button == 2) {
                setTimeout(() =>
                    this.$refs.contextMenu.open(ev, {}), 0);
            }
        }
    }
});

type MenuContext = {elem?: M.Element, at?: Point2D};
</script>