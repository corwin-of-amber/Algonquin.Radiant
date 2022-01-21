<template>
    <context-menu ref="m">
        <slot></slot>
    </context-menu>
</template>

<style src="./context-menu.css"></style>

<script>
import { Contextmenu as ContextMenu } from "v-contextmenu";
import "v-contextmenu/dist/themes/default.css";


export default {
    props: {theme: {default: 'compact'}},
    data: () => ({for: undefined}),
    emits: ['action'],
    components: { ContextMenu },
    methods: {
        open(ev, whatFor) {
            this.for = whatFor;
            this.$refs.m.show(ev);
        },
        action(ev) {
            this.$emit('action', {type: ev.name, for: this.for});
        },
        onClose() {
            setTimeout(() => this.for = undefined, 0); /** @oops must happen after `action` handler */
        }
    }
}
</script>