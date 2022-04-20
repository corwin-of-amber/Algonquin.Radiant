<template>
    <div class="sattelite-inspector">
        <prop-editor v-for="def, name in props" :key="name"
            :elem="elem" :prop="name" :format="def.format"
            @action="(e, a) => $emit('action', e, a)"/>
    </div>
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

div :deep(.inspector--prop-name) {
    font-size: 80%;
}
</style>

<script lang="ts">
import PropEditor from './inspector-prop.vue';


export default {
    props: ['widget', 'elem', 'props'],
    components: { PropEditor }
}
</script>