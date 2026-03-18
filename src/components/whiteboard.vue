<template>
    <div class="whiteboard" @contextmenu.stop.prevent>
        <svg ref="svg" xmlns="http://www.w3.org/2000/svg"
                class="sketchvg--container" @mousedown="onMouseDown">
            <circle r="400" cx="150" cy="0"/>
            <circle r="400" cx="500" cy="500"/>
            <template v-for="elem in model.elements" :key="elem.id">
                <component :is="elemComponentType(elem)" :elem="elem"
                    @action="elemAction(elem, $event)"/>
            </template>
            <template v-for="widget in model.widgets" :key="widget.id" :elem="widget">
                <component :is="widgetComponentType(widget)" :widget="widget"
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
import { toRaw } from 'vue';
import { Vue, Component, Ref, toNative } from 'vue-facing-decorator';

import WhiteboardContextMenu,
       { IWhiteboardContextMenu,
         ActionEvent as MenuActionEvent } from './whiteboard-context-menu.vue';
import { DocumentModel as M, DocumentActions as A } from '../model';
import { Point2D } from '../geom';

import { CATALOG, CatalogEntry } from '../elements';
import obj from './element-obj.vue';
import block from './elements/element-block.vue';
import conjecture from './elements/element-conjecture.vue';
import atable from './elements/element-table.vue';
import computation from './elements/element-computation.vue';
import stub from './elements/element-stub.vue';
import WidgetInspector from './widgets/inspector.vue';
import knob from './widgets/widget-knob.vue';
import drawer from './widgets/widget-drawer.vue';

import { SketchEditor } from 'sketchvg/src';
import { Shape2D } from 'sketchvg/src/shape';
import { ShapeComponent } from 'sketchvg/src/components/shape';


const ELEMENT_TYPES = {obj, block, conjecture, atable, computation, stub},
      WIDGET_TYPES = {WidgetInspector, knob, drawer};

@Component({
    components: {
        WhiteboardContextMenu,
        ...ELEMENT_TYPES,
        ...WIDGET_TYPES
    },
    emits: ['action']
})
class IWhiteboardApp extends Vue {
    model: M.Document = {} as M.Document
    @Ref svg: SVGSVGElement
    @Ref contextMenu: IWhiteboardContextMenu

    sketch: SketchEditor
    sketchSync = new Map<M.Element, ShapeComponent>()

    mounted() {
        this.sketch = new SketchEditor(this.svg);
    }

    updated() {
        this.sketchSync = this.syncSketch(this.sketchSync);
    }

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
            this.contextMenu.open(action.ev, {elem}), 0);
    }
    elemComponentType(elem: M.Element) {
        return Object.hasOwn(ELEMENT_TYPES, elem.type) ||
               Object.hasOwn(WIDGET_TYPES, elem.type) ? elem.type : 'stub';
    }
    widgetComponentType(widget: M.Widget) {
        return widget.type ?? 'widget-inspector';
    }

    /** Create a respective SketchVG component, if applicable */
    elemSketch(elem: M.Element & {shape?: Shape2D}): ShapeComponent {
        let shape = elem.shape;
        if (shape && !this.sketch.has(shape)) {
            return this.sketch.add(shape)
                .on('mousedown', ev => {
                    if (ev.$ev.button === 2)
                        this.elemMenu(elem, {type: 'menu', ev: ev.$ev.originalEvent})
                });
        }
    }
    syncSketch(cur: typeof this.sketchSync) {
        let next: typeof cur = new Map;
        for (let element of this.model.elements) {
            let key = toRaw(element),
                comp = cur.get(key) ?? this.elemSketch(element);
            cur.delete(key);
            if (comp)
                next.set(key, comp);
        }
        for (let comp of cur.values()) {
            this.sketch.remove(comp);
        }
        return next;
    }

    findElement(id: M.Id) {
        return this.model.findId(id);
    }
    propsFor(elem: M.Element) {
        if (!elem) return {};

        var cat = CATALOG[elem.type];
        return cat?.props ?? {'value': {format: 'json'}};
    }

    menuAction(ev: MenuActionEvent) {
        switch (ev.type) {
        case 'new-element': this.menuNew(ev.data.cat, ev.for); break;
        case 'cut':
        case 'delete':      this.menuDelete(ev.for);    break;
        case 'duplicate':   this.menuDuplicate(ev.for); break;
        case 'inspect':     this.menuInspect(ev.for);   break;
        case 'copy-id':     this.menuCopyId(ev.for);    break;
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
        let shift = (p: Point2D) => Point2D.add(p, DUPLICATE_OFFSET),
            newElem: M.Element = {
                ...ctx.elem,
                id: this.model.mkId(),
                at: shift(ctx.elem.at)
            };
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
                this.contextMenu.open(ev, {}), 0);
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

type MenuContext = MenuActionEvent['for']

const CONNECTOR_INIT_VEC = {x: 30, y: 30},
      INSPECTOR_OFFSET = {x: 40, y: -20},
      DUPLICATE_OFFSET = {x: -30, y: 30};

export { IWhiteboardApp }
export default toNative(IWhiteboardApp)
</script>