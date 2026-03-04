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
                    @action="onWidgetAction($event.elem ?? widget, $event)"/>
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
import { Vue, Component, toNative } from 'vue-facing-decorator';

import WhiteboardContextMenu from './whiteboard-context-menu.vue';
import { DocumentModel as M, DocumentActions as A } from '../model';
import { Point2D } from '../geom';

import { CATALOG, CatalogEntry, ConjectureElement, Connector } from '../elements';
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
    },
    emits: ['action']
})
class IWhiteboardApp extends Vue {
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
        if (!elem) return {};

        var cat = CATALOG[elem.type];
        return cat?.props ?? {'value': {format: 'json'}};
    }

    menuAction(ev: {type: string, for: MenuContext}) {
        switch (ev.type) {
        case 'new-conj':  this.menuNew(CATALOG.conjecture, ev.for);   break;
        case 'new-comp':  this.menuNew(CATALOG.computation, ev.for);  break;
        case 'new-tabl':  this.menuNew(CATALOG.atable, ev.for);       break;
        case 'cut':
        case 'delete':    this.menuDelete(ev.for);   break;
        case 'duplicate': this.menuDuplicate(ev.for); break;
        case 'inspect':   this.menuInspect(ev.for);  break;
        case 'copy-id':   this.menuCopyId(ev.for);  break;
        }
    }
    menuNew(cat: CatalogEntry, ctx: MenuContext) {
        this.$emit('action', {doc: this.model},
                   {type: 'create', cat, at: ctx.at});
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
    menuCopyId(ctx: MenuContext) {
        console.log(ctx.elem.id);
        navigator.clipboard.writeText(ctx.elem.id);
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
    /*onWidgetAction(widget: M.Widget, ev: {target: M.Element, action: A.Action}) {
        this.elemAction(ev.target, ev.action);
    }*/

    _mkNewE<E extends M.Element>(newElem: E) {
        this.$emit('action', {doc: this.model},
                   {type: 'create', newElem});
    }
}

type MenuContext = {elem?: M.Element, at?: Point2D};

const CONNECTOR_INIT_VEC = {x: 30, y: 30},
      INSPECTOR_OFFSET = {x: 40, y: -20},
      DUPLICATE_OFFSET = {x: -30, y: 30};

export { IWhiteboardApp }
export default toNative(IWhiteboardApp)
</script>