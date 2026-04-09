<template>
    <obj :elem="elem" @action="$emit('action', $event)" class="widget--inspector">
        <div class="sattelite element--boxed" :class="{'with-names': isWithNames()}">
            <prop-editor v-for="def, name in props" :key="name"
                :elem="ref" :prop="name" :format="def.format" :source="def.source"
                :showName="isWithNames()"
                @action="(e, a) => $emit('action', e, a)"/>
        </div>
    </obj>
</template>

<style scoped>
div.sattelite.with-names {
    padding-top: 3px;
}

div :deep(.inspector--prop-name) {
    font-size: 80%;
}
</style>

<style>
.drag-move div.sattelite {
    background: #efe8;
}
.drag-move div.sattelite > * {
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