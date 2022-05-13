<template>
    <obj :elem="widget">
        <div class="sattelite-inspector" :class="{'with-names': isWithNames()}">
            <prop-editor v-for="def, name in props" :key="name"
                :elem="elem" :prop="name" :format="def.format"
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
import Obj from '../element-obj.vue';
import PropEditor from './inspector-prop.vue';


export default {
    props: ['widget', 'elem', 'props'],
    methods: {
        isWithNames() { return Object.keys(this.props).length > 1; }
    },
    components: { Obj, PropEditor }
}
</script>