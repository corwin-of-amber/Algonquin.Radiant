<template>
    <div>
    <!--
    <context-menu ref="m" @action="$emit('action', $event)">
        <item name="new-conj">New Conjecture</item>
        <item name="new-conn">New Connector</item>
        <hr/>
        <item name="cut">Cut</item>
        <item name="copy" :enabled="false">Copy</item>
        <item name="paste" :enabled="false">Paste</item>
        <item name="duplicate">Duplicate</item>
        <item name="delete">Delete</item>
        <hr/>
        <item name="inspect">Show Inspector...</item>
    </context-menu> -->
    </div>
</template>

<script lang="ts">
import Vue from 'vue'
import ContextMenu from './context-menu/context-menu.vue';
import Item from './context-menu/context-menu-item.vue';

import { Point2D } from '../geom';

export default {
    methods: {
        open(ev: MouseEvent, whatFor: {at?: Point2D}) {
            whatFor.at ??= {x: ev.x, y: ev.y};
            this.$refs.m.open(ev, whatFor);
        }
    },
    components: {ContextMenu, Item}
}
</script>