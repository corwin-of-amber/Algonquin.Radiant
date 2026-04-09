<template>
    <div class="inspector--prop" @mousedown="onMouseGuard">
        <div class="inspector--prop-name" v-if="showName">{{ prop }}</div>
        <template v-if="dsource">
            <select class="inspector--prop-format" v-if="showFormat" v-model="dsource.format">
                <option>text</option>
                <option>number</option>
                <option>json</option>
                <option>js</option>
            </select>
        </template>
        <div class="inspector--prop-value" ref="editorContainer" v-once/>
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
import { Vue, Component, Prop, Ref, toNative} from 'vue-facing-decorator'
import rJSON from 'really-relaxed-json';
import { basicSetup } from '@codemirror/basic-setup';
import { EditorState } from  '@codemirror/state';
import { EditorView } from '@codemirror/view';

@Component({
    emits: ['action']
})
class IInspectorProperty extends Vue {
    @Prop elem: object
    @Prop prop: string
    @Prop format: string
    @Prop source: string
    @Prop({default: true}) showName: boolean
    @Prop({default: true}) showFormat: boolean

    @Ref editorContainer: Element

    interp = new Interpreter()

    mounted() {
        let source = this.dsource?.payload;

        var state = EditorState.create({
            doc: source ?? this.unparse(this.elem?.[this.prop]),
            extensions: [
                basicSetup,
                EditorView.updateListener.of(update =>
                    update.docChanged && this.onChange(update.state))
            ]
        });
        new EditorView({
            state,
            parent: this.editorContainer
        })

        /** @todo yeah that's not the best place to have this logic */
        if (source) this.emitDoc(source);
    }

    unparse(value: any) {
        if (value === undefined) return "";
        switch (this.format) {
            case 'json':
                return rJSON.prettyPrint(rJSON.Options.RJsonPretty, JSON.stringify(value));
            case 'string':
            case 'number':
                return `${value}`;

            case 'dynamic':
                return rJSON.prettyPrint(rJSON.Options.RJsonPretty, JSON.stringify(value));
        }
    }

    parse(value: string) {
        switch (this.format) {
            case 'json': return JSON.parse(rJSON.toJson(value));
            case 'text': return value;
            case 'number': return parseFloat(value);

            case 'dynamic':
                return this.interp.eval(value, this.dsource.format, this.elem?.[this.prop]?.value);
        }
    }

    emitChanged(value: any) {
        this.$emit('action', {
            type: 'edit-attr',
            elem: this.elem,
            attrName: this.prop,
            attrValue: value
        });
    }

    emitDoc(source: string) {
        this.emitChanged(this.parse(source));
    }

    onChange(state: EditorState) {
        if (this.elem && this.prop) {
            try {
                let doc = state.sliceDoc();
                if (this.format === 'dynamic')
                    this.dsource.payload = doc;
                this.emitDoc(doc);
            }
            catch (e) {
                console.warn('invalid json', e);
            }
        }
    }

    onMouseGuard(ev: MouseEvent) {
        var el = ev.target as HTMLElement;
        if (el.closest('.cm-line') || el.closest('.inspector--prop-format'))
            ev.stopPropagation();  // allow selection in editor text area
        else
            ev.preventDefault(); // keep editor focused, if it was
    }

    get dsource(): {format: string, payload?: string} {
        if (this.source)
            return this.elem[this.source] ??= {format: 'json'};
    }
}


class Interpreter {

    eval(source: string, language: string, fallback?: any) {
        try {
            switch (language) {
                case 'js': 
                    return {value: this.evalJS(source)};
                case 'json':
                    return {value: JSON.parse(rJSON.toJson(source))};
                default:
                    throw new Error(`unsupported language: '${language}'`);
            }
        }
        catch (e) {
            return {err: `${e}`, value: fallback};
        }
    }

    evalJS(source: string) {
        let v = new Function(`return (${source})`)();
        if (typeof v === 'object' && !(v?.constructor === ({}).constructor || Array.isArray(v)))
            return [`object ${v.constructor.name}`];
        return v;
    }
}


export default toNative(IInspectorProperty)
</script>