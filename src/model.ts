import { nanoid } from 'nanoid';


namespace DocumentModel {

    export interface Document {
        elements: Element[]
    }

    export interface Element {
        id: Id
        at: Point2D
    }

    export interface TeXElement extends Element {
        tex: string
    }

    export type Id = string

    export function mkId(doc: Document) {
        do {
            var u = nanoid(6);
        } while (doc.elements.some(x => x.id === u));
        return u;
    }
}

namespace DocumentActions {

    export interface Action {
        type: ActionType
    }

    export type ActionType = 'select' | 'move' | 'create' | 'delete' | 
        'menu';

    export interface SelectAction extends Action {
        type: 'select'
    }

    export interface MoveAction extends Action {
        type: 'move'
        origin: Point2D
        gesture: {from: Point2D, to: Point2D}
    }

    export interface CreateAction extends Action {
        type: 'create'
        newElem: M.Element
    }

    export interface DeleteAction extends Action {
        type: 'delete'
    }

    export interface MenuAction extends Action {
        type: 'menu'
        ev: MouseEvent
    }


    import M = DocumentModel;

    export type ActionLocator = {doc: M.Document, elem: M.Element};

    export function applyAction(loc: ActionLocator, action: Action) {
        switch (action.type) {
        case 'move':     applyMove(loc, action as MoveAction);       break;
        case 'create':   applyCreate(loc, action as CreateAction);   break;
        case 'delete':   applyDelete(loc, action as DeleteAction);   break;
        }
    }

    function applyMove(loc: ActionLocator, action: MoveAction) {
        var o = action.origin, g = action.gesture;
        loc.elem.at = {x: o.x + g.to.x - g.from.x,
                       y: o.y + g.to.y - g.from.y};
    }

    function applyCreate(loc: ActionLocator, action: CreateAction) {
        loc.doc.elements.push(action.newElem);
    }

    function applyDelete(loc: ActionLocator, action: DeleteAction) {
        var i = loc.doc.elements.indexOf(loc.elem);
        if (i >= 0)
            loc.doc.elements.splice(i, 1);
    }

}


type Point2D = {x: number, y: number};


export { DocumentModel, DocumentActions, Point2D }