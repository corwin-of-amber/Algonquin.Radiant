<template>
    <div class="sattelite-inspector" @mousedown="onMouseGuard">
        <div ref="editor-container" v-once/>
    </div>
</template>

<style> /* cannot use `scoped` here because CodeMirror has its own DOM */
div.sattelite-inspector {
    width: 15em;
    border: 1px solid #888;
    border-radius: 6px;
    padding: 6px;
    background: #fff8;
    backdrop-filter: blur(2px);
}
div.sattelite-inspector .cm-focused {
    outline: none !important;
}
</style>

<script lang="ts">
import Vue from 'vue';

import { basicSetup } from '@codemirror/basic-setup';
import { EditorState } from  '@codemirror/state';
import { EditorView, ViewPlugin } from '@codemirror/view';


export default Vue.extend({
    props: ['widget', 'elem', 'attrs'],
    mounted() {
        var state = EditorState.create({
            doc: this.elem?.tex ?? "",
            extensions: [
                basicSetup,
                EditorView.updateListener.of(update =>
                    update.docChanged && this.onChange(update.state))
            ]
        });
        new EditorView({
            state,
            parent: this.$refs['editor-container']
        })
    },
    methods: {
        onChange(state: EditorState) {
            if (this.elem && this.attrs?.[0]) {
                this.$emit('action', this.elem, {
                    type: 'edit-attr',
                    attrName: this.attrs?.[0],
                    attrValue: state.sliceDoc()
                });
            }
        },
        onMouseGuard(ev: MouseEvent) {
            var el = ev.target as HTMLElement;
            if (el.closest('.cm-line'))
                ev.stopPropagation();  // allow selection in editor text area
            else
                ev.preventDefault(); // keep editor focused, if it was
        }
    }
});
</script>