import { nanoid } from 'nanoid';
import { Point2D } from './geom';


namespace DocumentModel {

    export class Document {
        elements: Element[] = []
        widgets: Widget[] = []

        mkId() {
            do {
                var u = nanoid(6);
            } while (this.findId(u));
            return u;
        }

        findId(id: Id) {
            return this.elements.find(x => x.id === id)
        }

        static from(props: Document.Props) {
            var d = new Document();
            d.elements = props.elements;
            d.widgets = props.widgets;
            return d;
        }

        static promote(o: Document | Document.Props) {
            return o instanceof Document ? o : Document.from(o);
        }
    }

    export namespace Document {
        export type Props = {elements: Element[], widgets: Widget[]};
    }

    export interface Element {
        id: Id
        type: string
        at: Point2D | Point2D[]
        format?: ElementDisplayFormat
    }

    export interface Widget extends Element {
        for?: Id
    }

    export interface EphemeralWidget extends Widget {
        ephemeral: true
    }

    export type Id = string

    export type ElementDisplayFormat = {
        size: Sizer
    }

    export type Sizer = Point2D & {
        stretch: boolean | {x: boolean, y: boolean}
    }

    export function isWidget(e: Element): e is Widget {
        return !!(<Widget>e).for;
    }

    export function isEphemeralWidget(e: Element): e is Widget {
        return isWidget(e) && !!(<EphemeralWidget>e).ephemeral;
    }

}

namespace DocumentActions {

    export interface Action {
        type: ActionType
    }

    export type ActionType = 'select' | 'move' | 'create' | 'delete' | 
        'edit-attr' | 'menu' | 'inspect';

    export interface SelectAction extends Action {
        type: 'select'
    }

    export interface MoveAction extends Action {
        type: 'move'
        origin: Point2D
        ep?: number // endpoint index (in connector)
        gesture: {from: Point2D, to: Point2D}
    }

    export interface CreateAction extends Action {
        type: 'create'
        newElem: M.Element
    }

    export interface DeleteAction extends Action {
        type: 'delete'
    }

    export interface EditAttributeAction<T> extends Action {
        type: 'edit-attr'
        attrName: string
        attrValue: T
    }

    export interface MenuAction extends Action {
        type: 'menu'
        ev: MouseEvent
    }


    import M = DocumentModel;

    export type ActionLocator = {doc: M.Document, elem: M.Element};

    export function applyAction(loc: ActionLocator, action: Action) {
        switch (action.type) {
        case 'move':       applyMove(loc, action as MoveAction);                    break;
        case 'create':     applyCreate(loc, action as CreateAction);                break;
        case 'delete':     applyDelete(loc, action as DeleteAction);                break;
        case 'edit-attr':  applyEditAttr(loc, action as EditAttributeAction<any>);  break;
        }
    }

    function applyMove(loc: ActionLocator, action: MoveAction) {
        var o = action.origin, g = action.gesture,
            pt = {x: o.x + g.to.x - g.from.x,
                  y: o.y + g.to.y - g.from.y};
        if (Array.isArray(loc.elem.at)) {
            loc.elem.at[action.ep] = pt;
            loc.elem.at = loc.elem.at.slice(); // Vue reactivity issue?
        }
        else
            loc.elem.at = pt;
    }

    function applyCreate(loc: ActionLocator, action: CreateAction) {
        var l = M.isWidget(action.newElem) ? loc.doc.widgets : loc.doc.elements;
        l.push(action.newElem);
    }

    function applyDelete(loc: ActionLocator, action: DeleteAction) {
        var l = M.isWidget(loc.elem) ? loc.doc.widgets : loc.doc.elements,
            i = l.indexOf(loc.elem);
        if (i >= 0)
            l.splice(i, 1);
    }

    function applyEditAttr<T>(loc: ActionLocator, action: EditAttributeAction<T>) {
        loc.elem[action.attrName] = action.attrValue;
    }

}


export { DocumentModel, DocumentActions }