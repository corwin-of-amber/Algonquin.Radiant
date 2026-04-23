import _ from 'lodash';
import { reactive } from 'vue';
import { Meta, Cell } from '../../src/elements/mini-notebook';
import { GridWidget } from 'vue-tabular/src/data';

import './index.scss';


export default function entry() {

    let $ = reactive({} as {[k: string]: any});

    class Scratch0 {

        at = [2,2]

        board = () => _.range(5).map(y =>
            _.range(5).map(x => new GridWidget({
                class: ['square', ..._.isEqual([x,y], $.at) ? ['x'] : []],
                text: ' '
            })))

        verbs = {
            rt: () => $.at[0]++
        }

    }

    let cells: {[k: string]: Cell<any[]>} = Meta.intoCells(new Scratch0);
    Object.assign($, Object.fromEntries(Object.entries(cells).map(([k, v]) => [k, v.value])));

    $.clone = () => {
        let c = entry();
        c.at = $.at;
        return c;
    }

    return $;
}
