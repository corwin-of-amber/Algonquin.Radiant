<template>
    <obj :elem="elem" @action="$emit('action', $event)">
        <div class="sattelite-inspector" :class="{'with-names': isWithNames()}">
            <prop-editor v-for="def, name in props" :key="name"
                :elem="ref" :prop="name" :format="def.format"
                :showName="isWithNames()"
                @action="(e, a) => $emit('action', e, a)"/>
        </div>
    </obj>
</template>

<style scoped>
div.sattelite-inspector {
    width: 15em;
    border: 1px solid #888;
    border-radius: 6px;
    padding: 6px;
    background: #fff8;
    backdrop-filter: blur(2px);
}

div.sattelite-inspector.with-names {
    padding-top: 3px;
}

:deep(.drag-move) div.sattelite-inspector {
    background: #fdd;
}

div :deep(.inspector--prop-name) {
    font-size: 80%;
}
</style>

<style>
.drag-move div.sattelite-inspector {
    background: #efe8;
}
.drag-move div.sattelite-inspector > * {
    opacity: 0.7;
}
</style>

<script lang="ts">
import { ComponentPublicInstance } from 'vue';
import { Vue, Component, Prop, toNative } from 'vue-facing-decorator';
import { DocumentModel as M } from '../../model';
import Obj from '../element-obj.vue';
import PropEditor from './inspector-prop.vue';
import { CATALOG } from '../../elements';

interface Props {
    refs: {for: M.Id}
}

@Component({
    components: { Obj, PropEditor },
    emits: ['action']
})
class IInspectorWidget extends Vue {
    @Prop elem: M.Element & Props

    declare $root: ComponentPublicInstance & {model: M.Document}

    isWithNames() {
        return Object.keys(this.props).length > 1;
    }

    get ref() {
        return this.$root.model.findId(this.elem.refs.for);
    }

    get props() {
        return this.propsFor(this.ref);
    }

    propsFor(elem: M.Element) {
        if (!elem) return {};

        var cat = CATALOG[elem.type];
        return cat?.props ?? {'value': {format: 'json'}};
    }
}

export { IInspectorWidget, Props }
export default toNative(IInspectorWidget)
</script>