import { nanoid } from 'nanoid';


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
    }

    export interface Element {
        id: Id
        at: Point2D | Point2D[]
    }

    export interface Widget extends Element {
        for?: Id
    }

    export interface TeXElement extends Element {
        tex: string
    }

    export type Id = string

}

namespace DocumentActions {

    export interface Action {
        type: ActionType
    }

    export type ActionType = 'select' | 'move' | 'create' | 'delete' | 
        'edit-attr' | 'menu';

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
        loc.doc.elements.push(action.newElem);
    }

    function applyDelete(loc: ActionLocator, action: DeleteAction) {
        var i = loc.doc.elements.indexOf(loc.elem);
        if (i >= 0)
            loc.doc.elements.splice(i, 1);
    }

    function applyEditAttr<T>(loc: ActionLocator, action: EditAttributeAction<T>) {
        loc.elem[action.attrName] = action.attrValue;
    }

}


type Point2D = {x: number, y: number};


export { DocumentModel, DocumentActions, Point2D }