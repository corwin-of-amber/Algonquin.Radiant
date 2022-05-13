import Vue from 'vue';
import { DocumentModel as M } from '../model';


class ReactiveComputation {
    doc: M.Document
    _resources: Resource[] = []

    constructor(doc: M.Document) {
        this.doc = doc;
    }

    eval(code: string) {
        this.cleanup();
        try {
            var func = new Function('$', code ?? '');
        }
        catch (e) { 
            console.warn('(compiling computation code)', e);
            return {value: null};
        }
        try {
            return {value: func(this)};
        }
        catch (e) {
            this.cleanup();
            return {value: null, err: e};
        }
    }

    watch<T>(access: () => T, cb: () => void, options?: Vue.WatchOptions<boolean>) {
        var cleanup = Vue.watch(access, cb, options);
        this._resources.push({cleanup});
    }

    cleanup() {
        for (let {cleanup} of this._resources) {
            try { cleanup(); }
            catch (e) { console.warn('(during cleanup)', e); }
        }
        this._resources = [];
    }
}

type Resource = {cleanup: () => void};


export { ReactiveComputation }