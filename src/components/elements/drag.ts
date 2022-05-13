import Vue from 'vue';
import { Point2D } from '../../geom';
import { DragBuddy } from '../drag';


class ElementDragBuddy<
        V extends Vue.ComponentPublicInstance & 
            {dragState: {c: string}, elem: {at: Point2D}} = 
        Vue.ComponentPublicInstance &
            {dragState: {c: string}, elem: {at: Point2D}}>
    extends DragBuddy<V>
{
    origin() {
        return {origin: this.o.elem.at};
    }
}


export { ElementDragBuddy }