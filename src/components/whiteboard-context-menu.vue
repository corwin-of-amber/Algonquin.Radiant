<template>
    <context-menu ref="m" @action="$emit('action', $event)">
        <item name="new-conj">New conjecture</item>
        <hr/>
        <item name="cut">Cut</item>
        <item>Copy</item>
        <item>Paste</item>
        <item>Duplicate</item>
        <item name="delete">Delete</item>
    </context-menu>
</template>

<script lang="ts">
import Vue from 'vue'
import ContextMenu from './context-menu/context-menu.vue';
import Item from './context-menu/context-menu-item.vue';

import { Point2D } from '../model';

export default Vue.extend({
    methods: {
        open(ev: MouseEvent, whatFor: {at?: Point2D}) {
            whatFor.at ??= {x: ev.x, y: ev.y};
            this.$refs.m.open(ev, whatFor);
        }
    },
    components: {ContextMenu, Item}
})
</script>