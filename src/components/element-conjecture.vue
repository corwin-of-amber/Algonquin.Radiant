<template>
    <obj :elem="elem">
        <katex :tex="elem.tex"/>
    </obj>
</template>

<script>
import obj from './element-obj.vue';
import katex from './conjecture-katex.vue';

export default {
    props: ['elem'],
    components: { obj, katex }
}
</script>
