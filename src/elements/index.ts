import { DocumentModel as M } from '../model';
import { Point2D } from '../geom';


type Catalog = {[objtype: string]: CatalogEntry}
type CatalogEntry = CatalogEntryProps & {type: string}
type CatalogEntryProps = {
    stencil: {[prop: string]: any},
    props?: {[prop: string]: PropDef}
}
type PropDef = {format: string};


const CATALOG: Catalog = mkCatalog({
    'conjecture': {
        stencil: {
            tex: 'x^yz'
        },
    },
    'table': {
        stencil: {
            header: [undefined, 'A', 'B', 'C'],
            data: [[1, 'a', 'b', 'c'], [2, 'x', 'y', 'z']]
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
        v.type = k;
        if (v.stencil && !v.props)   // convenient
            v.props = mapValues(v.stencil, v => ({format: guessFormat(v)}));
    }
    return props as Catalog;
}


export interface ConjectureElement extends M.Element {
    type: 'tex'
    tex: string
}

export interface TableElement extends M.Element {
    type: 'table'
    data: any[][]
}

export interface Connector extends M.Element {
    type: 'connector'
    at: [Point2D, Point2D]
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


export { CATALOG, Catalog, CatalogEntry }