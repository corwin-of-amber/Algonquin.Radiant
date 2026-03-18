import EJSON from 'ejson';
import { DocumentModel as M } from '../model';
import { Point2D } from '../geom';
import { Polyline } from 'sketchvg/src/shape';


type Catalog = {[objtype: string]: CatalogEntry}
type CatalogEntry = CatalogEntryProps & {type: string}
type CatalogEntryProps = {
    description?: string
    stencil: {[prop: string]: any},
    props?: {[prop: string]: PropDef},
    created?: (e: M.Element | M.Widget) => void
}
type PropDef = {format: string};


const CATALOG: Catalog = mkCatalog({
    'connector': {
        stencil: {
            shape: Polyline.makeSimple([{x: -10, y: 0}, {x: 20, y: 0}])
        },
        props: {},
        created: (e: M.Element & {at: Point2D, shape: Polyline}) => {
            e.shape = EJSON.clone(e.shape);
            e.shape.translate(e.at);
        }
    },
    'block': {
        stencil: {
            caption: "chimichanga"
        }
    },
    'conjecture': {
        stencil: {
            tex: 'x^yz'
        }
    },
    'atable': {
        description: 'Table',
        stencil: {
            header: [undefined, 'A', 'B', 'C'],
            data: [[1, 'a', 'b', 'c'], [2, 'x', 'y', 'z']]
        }
    },
    'computation': {
        stencil: {
            code: 'return {};'
        }
    },
    'knob': {
        stencil: {}
    },
    'drawer': {
        stencil: {
            expand: true,
            content: {
                value: [{}]
            }
        }
    }
});

/**
 * Auxiliary catalog initialization function so that I do not have
 * to repeat keys in entries.
 * @param props an object containing catalog entries sans the `type` field.
 * @returns a proper catalog.
 */
function mkCatalog(props: {[objtype: string]: CatalogEntryProps}): Catalog {
    for (let [k, v] of Object.entries(props as Catalog)) {
        v.type ??= k;
        v.description ??= k[0].toUpperCase() + k.slice(1)
        if (v.stencil && !v.props)   // convenient
            v.props = mapValues(v.stencil, v => ({format: guessFormat(v)}));
    }
    return props as Catalog;
}


export interface ConjectureElement extends M.Element {
    type: 'conjecture'
    tex: string
}

export interface TableElement extends M.Element {
    type: 'atable'
    data: any[][]
}


function guessFormat(v: any) {
    switch (typeof v) {
        case 'string':   return 'text';
        case 'number':   return 'number';
        default:         return 'json';
    }
}

function mapValues<T, S>(o: {[k: string]: T}, f: (v: T) => S): {[k: string]: S} {
    return Object.fromEntries(
        Object.entries(o).map(([k, v]) => [k, f(v)])
    )
}


export { CATALOG, Catalog, CatalogEntry, mkCatalog }