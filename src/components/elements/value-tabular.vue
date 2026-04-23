<template>
    <tabular ref="inner" :data="gridData(elem.value)"/>
</template>


<script lang="ts">
import { Vue, Component, Prop, Ref, toNative } from 'vue-facing-decorator';
import Tabular, { ITabular, data } from 'vue-tabular';

import { DocumentModel as M } from '../../model';

@Component({
    components: { Tabular }
})
class IValueTabular extends Vue {
    @Prop elem: M.Element & {value: any}
    @Ref inner: ITabular

    gridData(value: any) {
        try {
            if (value === undefined) return [];
            return data.fromObjects(value);
        }
        catch (e) {
            console.error(e);
            return [];
        }
    }
}

export { IValueTabular }
export default toNative(IValueTabular)
</script>