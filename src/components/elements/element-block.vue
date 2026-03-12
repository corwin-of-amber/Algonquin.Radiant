<template>
    <obj :elem="elem">
        <div class="element--block">
            {{ elem.caption }}
        </div>
    </obj>
</template>

<script lang="ts">
import { Vue, Component, Prop, toNative }  from 'vue-facing-decorator';
import { DocumentModel as M } from '../../model';
import obj from '../element-obj.vue';


interface Props {
    caption: string
}

@Component({
    components: { obj }
})
class IElementBlock extends Vue {
    @Prop elem: M.Element & Props
}

export { IElementBlock, Props }
export default toNative(IElementBlock)
</script>