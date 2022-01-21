<template>
    <div class="whiteboard" @contextmenu.stop.prevent>
        <svg xmlns="http://www.w3.org/2000/svg" @mousedown="onMouseDown">
            <circle r="400" cx="150" cy="0"/>
            <circle r="400" cx="500" cy="500"/>
            <template v-for="elem in model.elements">
                <connector v-if="elem.type == 'connector'"
                    :key="elem.id" :elem="elem"
                    @action="elemAction(elem, $event)"/>
                <obj v-else :key="elem.id" :elem="elem"
                    @action="elemAction(elem, $event)">
                    <conj :tex="elem.tex"/>
                </obj>
            </template>
            <obj v-for="widget in model.widgets" :key="widget.id" :elem="widget"
                @action="elemAction(widget, $event)">
                <widget-inspector :widget="widget"
                    :elem="findElement(widget.for)" :attrs="['tex']"
                    @action="onWidgetAction"/>
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
svg .drag-move > line.hover {
    stroke: #6f00ff20;
}
</style>

<script lang="ts">
import Vue from 'vue';
import WhiteboardContextMenu from './whiteboard-context-menu.vue';
import { DocumentModel as M, DocumentActions as A } from '../model';
import { Point2D } from '../geom';

import obj from './element-obj.vue';
import conj from './conjecture-katex.vue';
import connector from './element-connector.vue';
import WidgetInspector from './widgets/inspector.vue';


export default {
    data: () => ({model: {}}),
    components: {conj, obj, connector, WhiteboardContextMenu, WidgetInspector},
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

        findElement(id: M.Id) {
            return this.model.findId(id);
        },

        menuAction(ev: {type: string, for: MenuContext}) {
            switch (ev.type) {
            case 'new-conj':  this.menuNewConj(ev.for);  break;
            case 'new-conn':  this.menuNewConn(ev.for);  break;
            case 'cut':
            case 'delete':    this.menuDelete(ev.for);   break;
            case 'duplicate': this.menuDuplicate(ev.for); break;
            case 'inspect':   this.menuInspect(ev.for);  break;
            }
        },
        menuNewConj(ctx: MenuContext) {
            var newElem = {
                type: 'conjecture',
                id: this.model.mkId(),
                at: ctx.at, tex: "xyz"
            } as M.Element;
            this.$emit('action', {doc: this.model},
                                 {type: 'create', newElem});
        },
        menuNewConn(ctx: MenuContext) {
            var newElem = {
                type: 'connector',
                id: this.model.mkId(),
                at: [ctx.at, Point2D.add(ctx.at, CONNECTOR_INIT_VEC)]
            } as M.Element;
            this.$emit('action', {doc: this.model},
                                 {type: 'create', newElem});
        },
        menuDelete(ctx: MenuContext) {
            this.$emit('action', {doc: this.model, elem: ctx.elem},
                                 {type: 'delete'});
        },
        menuDuplicate(ctx: MenuContext) {
            var shift = (p: Point2D) => Point2D.add(p, DUPLICATE_OFFSET),
                at = ctx.elem.at;
            at = Array.isArray(at) ? at.map(shift) : shift(at);
            var newElem = {...ctx.elem,
                id: this.model.mkId(), at
            } as M.Element;
            this.$emit('action', {doc: this.model},
                                 {type: 'create', newElem});
        },
        menuInspect(ctx: MenuContext) {
            var at = ctx.at || ctx.elem.at as Point2D;
            var newElem = {
                id: this.model.mkId(),
                at: Point2D.add(at, INSPECTOR_OFFSET), for: ctx.elem.id
            };
            this.$emit('action', {doc: this.model}, {type: 'create', newElem})
        },

        onMouseDown(ev: MouseEvent) {
            if (ev.button == 2) {
                setTimeout(() =>
                    this.$refs.contextMenu.open(ev, {}), 0);
            }
        },
        onWidgetAction(elem: M.Element, action: A.Action) {
            this.elemAction(elem, action);
        }
    }
}

type MenuContext = {elem?: M.Element, at?: Point2D};

const CONNECTOR_INIT_VEC = {x: 30, y: 30},
      INSPECTOR_OFFSET = {x: 40, y: -20},
      DUPLICATE_OFFSET = {x: -30, y: 30};
</script>