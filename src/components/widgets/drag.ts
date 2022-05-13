import Vue from 'vue';
import { Point2D } from '../../geom';
import { DragBuddy } from '../drag';


class WidgetDragBuddy<
        V extends Vue.ComponentPublicInstance & 
            {dragState: {c: string}, widget: {at: Point2D}} = 
        Vue.ComponentPublicInstance &
            {dragState: {c: string}, widget: {at: Point2D}}>
    extends DragBuddy<V>
{
    origin() {
        return {origin: this.o.widget.at};
    }
}


export { WidgetDragBuddy }