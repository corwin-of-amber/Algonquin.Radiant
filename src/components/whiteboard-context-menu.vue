<template>
    <context-menu ref="m">
        <item name="new-conj">New Conjecture</item>
        <item name="new-comp">New Computation</item>
        <item name="new-tabl">New Table</item>
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
import { Vue, Component, toNative } from 'vue-facing-decorator';
import ContextMenu from './context-menu/context-menu.vue';
import Item from './context-menu/context-menu-item.vue';
import { Point2D } from '../geom';

@Component({
    components: {ContextMenu, Item}
})
class WhiteboardContextMenu extends Vue {
    $refs: any
    
    open(ev: MouseEvent, whatFor: {at?: Point2D}) {
        whatFor.at ??= {x: ev.x, y: ev.y};
        this.$refs.m.open(ev, whatFor);
    }
}

export default toNative(WhiteboardContextMenu)
</script>