<template>
    <obj :elem="elem">
        <span :dummy="value"></span>
        <element-default :elem="elem"/>
    </obj>
</template>

<script lang="ts">
import { ComponentPublicInstance } from 'vue';
import { Component, Vue, Prop } from 'vue-facing-decorator';
import { ReactiveComputation } from '../../elements/computation';
import Obj from '../element-obj.vue';
import ElementDefault from './element-default.vue';

@Component({
    components: { Obj, ElementDefault }
})
export default class ElementComputation extends Vue {
    @Prop
    elem = undefined
    _computation: ReactiveComputation

    $root: ComponentPublicInstance & {model: any}
    
    created() {
        this._computation = new ReactiveComputation(this.$root.model);
    }
    
    get value() {
        var {value, err} = this._computation.eval(this.elem.code);
        this.elem.value = value;
        this.elem.err = err;
        return value;
    }
    
}
</script>
