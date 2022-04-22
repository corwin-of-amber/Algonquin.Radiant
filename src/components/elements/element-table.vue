<template>
    <obj :elem="elem">
        <table>
            <tr class="header-row">
                <th v-for="cell,$j in elem.header ?? []" :key="$j">{{cell}}</th>
            </tr>
            <tr v-for="row,$i in elem.data" :key="$i">
                <td v-for="cell,$j in row" :key="$j">
                    <component :is="dataElement ?? 'element-default'"
                               :elem="{value: cell}"/>
                </td>
            </tr>
        </table>
    </obj>
</template>

<script>
import Obj from '../element-obj.vue';
import ElementDefault from './element-default.vue';


export default {
    props: ['elem', 'keyColumn', 'dataElement'],
    methods: {
        keyOf(index, row) {
            let col = this.keyColumn,
                key = (typeof col == 'number') ? row[col] : index;
            if (key === undefined) {
                console.warn(`table: missing key in row ${index}`);
                key = index;
            }
            return key;
        }
    },
    components: { Obj, ElementDefault }
}
</script>

<style>

</style>