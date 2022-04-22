<template>
    <div class="inspector--prop" @mousedown="onMouseGuard">
        <div class="inspector--prop-name" v-if="showName">{{prop}}</div>
        <div class="inspector--prop-value" ref="editor-container" v-once/>
    </div>
</template>

<style scoped>
div.inspector--prop :deep(.cm-focused) {
    outline: none !important;
    height: 100%;
}
div.inspector--prop {
    width: 100%;
}
div.inspector--prop-value {
    max-height: 7em;
    overflow: auto;
} 
</style>

<script lang="ts">
import { basicSetup } from '@codemirror/basic-setup';
import { EditorState } from  '@codemirror/state';
import { EditorView, ViewPlugin } from '@codemirror/view';


export default {
    props: {elem: Object, prop: String, format: String,
            showName: {type: Boolean, default: true}},
    mounted() {
        var state = EditorState.create({
            doc: this.unparse(this.elem?.[this.prop]),
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
        unparse(value: any) {
            if (value === undefined) return "";
            else if (typeof value === 'string') return value;
            else return JSON.stringify(value, null, 2);
        },
        parse(value: string) {
            switch (this.format) {
            case 'json': return JSON.parse(value);
            case 'text': return value;
            case 'number': return parseFloat(value);
            }
        },
        onChange(state: EditorState) {
            if (this.elem && this.prop) {
                try {
                    this.$emit('action', this.elem, {
                        type: 'edit-attr',
                        attrName: this.prop,
                        attrValue: this.parse(state.sliceDoc())
                    });
                }
                catch (e) {
                    console.warn('invalid json', e);
                }
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
}
</script>