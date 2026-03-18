<template>
    <obj :elem="elem">
        <div class="element--boxed">
            <element-default :elem="elem"/>
            <span class="errormsg" v-if="elem.err" v-text="elem.err"></span>
        </div>
    </obj>
</template>

<style scoped>
span.errormsg {
    display: block;
    font-size: 80%;
}
</style>

<script lang="ts">
import { Component, Vue, Prop, toNative } from 'vue-facing-decorator';
import { DocumentModel as M } from '../../model';
import Obj from '../element-obj.vue';
import ElementDefault from './element-default.vue';

interface Props {
    value: any
    err: string
}

@Component({
    components: { Obj, ElementDefault }
})
class IElementValue extends Vue {
    @Prop elem: M.Element & Props = undefined   
}

export { IElementValue, Props }
export default toNative(IElementValue)
</script>
