<template>
    <context-menu ref="m">
        <item v-for="cat, key of elements" 
            name="new-element" :data="{key, cat}">New {{ cat.description }}</item>
        <hr/>
        <item name="cut">Cut</item>
        <item name="copy" :enabled="false">Copy</item>
        <item name="paste" :enabled="false">Paste</item>
        <item name="duplicate">Duplicate</item>
        <item name="delete">Delete</item>
        <hr/>
        <item name="inspect">Show Inspector...</item>
        <item name="copy-id">Copy Id</item>
    </context-menu>
</template>

<script lang="ts">
import { Vue, Component, Ref, toNative } from 'vue-facing-decorator';
import ContextMenu from './context-menu/context-menu.vue';
import Item from './context-menu/context-menu-item.vue';
import { DocumentModel as M } from '../model';
import { Point2D } from '../geom';
import { CatalogEntry, CATALOG as ELEMENT_CATALOG } from '../elements';

@Component({
    components: { ContextMenu, Item }
})
class IWhiteboardContextMenu extends Vue {
    @Ref m: any
    
    open(ev: MouseEvent, whatFor: {at?: Point2D, elem?: M.Element}) {
        whatFor.at ??= {x: ev.x, y: ev.y};
        this.m.open(ev, whatFor);
    }

    get elements() { return ELEMENT_CATALOG; }
}

interface ActionEvent {
    type: string
    for?: {
        elem?: M.Element
        at?: Point2D
    }
    data?: {
        key: string
        cat: CatalogEntry
    }
}


export { IWhiteboardContextMenu, ActionEvent }
export default toNative(IWhiteboardContextMenu)
</script>