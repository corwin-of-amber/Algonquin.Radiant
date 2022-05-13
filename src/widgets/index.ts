import { Catalog, mkCatalog } from '../elements';



const CATALOG: Catalog = mkCatalog({
    'knob': {
        stencil: {
            role: 'sizer'
        }
    },
    /**
     * @todo
    'inspector': {
        stencil: { }
    }
     */
});


export { CATALOG }