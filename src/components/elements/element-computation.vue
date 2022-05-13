<template>
    <obj :elem="elem">
        <span :dummy="value"></span>
        <element-default :elem="elem"/>
    </obj>
</template>

<script>
import { ReactiveComputation } from '../../elements/computation';
import Obj from '../element-obj.vue';
import ElementDefault from './element-default.vue';

export default {
    props: ['elem'],
    created() {
        this._computation = new ReactiveComputation(this.$root.model);
    },
    computed: {
        value() {
            var {value, err} = this._computation.eval(this.elem.code);
            this.elem.value = value;
            this.elem.err = err;
        }
    },
    components: { Obj, ElementDefault }
}
</script>
