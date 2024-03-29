<template>
    <div class="whiteboard" @contextmenu.stop.prevent>
        <svg xmlns="http://www.w3.org/2000/svg" @mousedown="onMouseDown">
            <circle r="400" cx="150" cy="0"/>
            <circle r="400" cx="500" cy="500"/>
            <template v-for="elem in model.elements" :key="elem.id">
                <component :is="elemType(elem)" :elem="elem"
                    @action="elemAction(elem, $event)"/>
            </template>
            <template v-for="widget in model.widgets" :key="widget.id" :elem="widget">
                <component :is="widgetType(widget)" :widget="widget"
                    :elem="findElement(widget.for)" :props="propsFor(findElement(widget.for))"
                    @action="onWidgetAction(widget, $event)"/>
            </template>
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
import assert from 'assert';
import { Vue, Component } from 'vue-facing-decorator';

import WhiteboardContextMenu from './whiteboard-context-menu.vue';
import { DocumentModel as M, DocumentActions as A } from '../model';
import { Point2D } from '../geom';

import { CATALOG, ConjectureElement, Connector } from '../elements';
import obj from './element-obj.vue';
import conjecture from './elements/element-conjecture.vue';
import connector from './element-connector.vue';
import atable from './elements/element-table.vue';
import computation from './elements/element-computation.vue';
import WidgetInspector from './widgets/inspector.vue';
import knob from './widgets/widget-knob.vue';

@Component({
    components: {
        WhiteboardContextMenu,
        /* element types */
        obj, conjecture, connector, atable, computation,
        /* widget types */
        WidgetInspector, knob
    }
})
export default class WhiteboardApp extends Vue {
    model: M.Document = {} as M.Document
    $refs: any

    elemAction(elem: M.Element, action: A.Action) {
        switch (action.type) {
        case 'select':  this.elemSelect(elem, action as A.SelectAction);   break;
        case 'menu':    this.elemMenu(elem, action as A.MenuAction);       break;
        }
        this.$emit('action', {doc: this.model, elem}, action);
    }
    elemSelect(elem: M.Element, action: A.SelectAction) {
        console.log('select', elem);
    }
    elemMenu(elem: M.Element, action: A.MenuAction) {
        setTimeout(() =>
            this.$refs.contextMenu.open(action.ev, {elem}), 0);
    }
    elemType(elem: M.Element) {
        return elem.type ?? 'conjecture';
    }
    widgetType(widget: M.Widget) {
        return widget.type ?? 'widget-inspector';
    }

    findElement(id: M.Id) {
        return this.model.findId(id);
    }
    propsFor(elem: M.Element) {
        var cat = CATALOG[elem.type];
        return cat?.props ?? {'value': {format: 'json'}};
    }

    menuAction(ev: {type: string, for: MenuContext}) {
        switch (ev.type) {
        case 'new-conj':  this.menuNewConj(ev.for);  break;
        case 'new-conn':  this.menuNewConn(ev.for);  break;
        case 'cut':
        case 'delete':    this.menuDelete(ev.for);   break;
        case 'duplicate': this.menuDuplicate(ev.for); break;
        case 'inspect':   this.menuInspect(ev.for);  break;
        }
    }
    menuNewConj(ctx: MenuContext) {
        assert(ctx.at);
        (<HACK>this)._mkNewE<ConjectureElement>({
            type: 'conjecture',
            id: this.model.mkId(),
            at: ctx.at, tex: "xyz"
        });
    }
    menuNewConn(ctx: MenuContext) {
        assert (ctx.at);
        (<HACK>this)._mkNewE<Connector>({
            type: 'connector',
            id: this.model.mkId(),
            at: [ctx.at, Point2D.add(ctx.at, CONNECTOR_INIT_VEC)]
        });
    }
    menuDelete(ctx: MenuContext) {
        this.$emit('action', {doc: this.model, elem: ctx.elem},
                                {type: 'delete'});
    }
    menuDuplicate(ctx: MenuContext) {
        var shift = (p: Point2D) => Point2D.add(p, DUPLICATE_OFFSET),
            at = ctx.elem.at;
        at = Array.isArray(at) ? at.map(shift) : shift(at);
        var newElem = {...ctx.elem,
            id: this.model.mkId(), at
        } as M.Element;
        this.$emit('action', {doc: this.model},
                                {type: 'create', newElem});
    }
    menuInspect(ctx: MenuContext) {
        var at = ctx.at || ctx.elem.at as Point2D;
        var newElem = {
            id: this.model.mkId(),
            at: Point2D.add(at, INSPECTOR_OFFSET), for: ctx.elem.id
        };
        this.$emit('action', {doc: this.model},
                                {type: 'create', newElem})
    }

    onMouseDown(ev: MouseEvent) {
        if (ev.button == 2) {
            setTimeout(() =>
                this.$refs.contextMenu.open(ev, {}), 0);
        }
    }
    onWidgetAction(elem: M.Element, action: A.Action) {
        this.elemAction(elem, action);
    }

    _mkNewE<E extends M.Element>(newElem: E) {
        this.$emit('action', {doc: this.model},
                                {type: 'create', newElem});
    }
}

/**
 * `defineComponent` should induce correct type inference in methods.
 * But this only works in strict mode, and most files fail with strict mode,
 * and per-file strict mode setting is not available yet in the IDE.
 * https://github.com/microsoft/TypeScript/issues/28306
 */
interface HACK {
    _mkNewE<E extends M.Element>(newElem: E): void
}

type MenuContext = {elem?: M.Element, at?: Point2D};

const CONNECTOR_INIT_VEC = {x: 30, y: 30},
      INSPECTOR_OFFSET = {x: 40, y: -20},
      DUPLICATE_OFFSET = {x: -30, y: 30};
</script>