<template>
    <div v-once></div>
</template>

<style scoped>
div { display: inline-block; }
</style>

<script lang="ts">
import katex from 'katex';
import 'katex/dist/katex.css';

export default {
    props: ['tex'],
    mounted() {
        this.$watch('tex', () => this.refresh(), {immediate: true});
    },
    methods: {
        refresh() {
            katex.render(this.tex, this.$el, {
                throwOnError: false
            });
        }
    }
}
</script>
