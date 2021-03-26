
namespace DocumentModel {

    export interface Document {
        elements: Element
    }

    export interface Element {
        id: Id
        at: Point2D
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

    export interface SelectAction extends Action {
        type: 'select'
    }

    export interface MoveAction extends Action {
        type: 'move'
        origin: Point2D
        gesture: {from: Point2D, to: Point2D}
    }

    export type ActionType = 'select' | 'move' | 'create' | 'delete';

}


type Point2D = {x: number, y: number};


export { DocumentModel, DocumentActions, Point2D }