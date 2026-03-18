<template>
    <obj :elem="elem">
        <div class="element--boxed">
            <span :dummy="value"></span>
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
import { ComponentPublicInstance } from 'vue';
import { Component, Vue, Prop, toNative } from 'vue-facing-decorator';
import { ReactiveComputation } from '../../elements/computation';
import Obj from '../element-obj.vue';
import ElementDefault from './element-default.vue';

@Component({
    components: { Obj, ElementDefault }
})
class ElementComputation extends Vue {
    @Prop
    elem = undefined
    _computation: ReactiveComputation

    declare $root: ComponentPublicInstance & {model: any}
    
    created() {
        this._computation = new ReactiveComputation(this.$root.model);
    }
    
    get value() {
        var {value, err} = this._computation.eval(this.elem.code);
        if (!err)
            this.elem.value = value;
        this.elem.err = err;
        return value;
    }
    
}

export default toNative(ElementComputation)
</script>
