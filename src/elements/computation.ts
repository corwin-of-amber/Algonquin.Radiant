import Vue from 'vue';
import { DocumentModel as M } from '../model';


class ReactiveComputation {
    doc: M.Document
    innerAPI: Dollar
    _resources: Resource[] = []

    constructor(doc: M.Document) {
        this.doc = doc;
        this.innerAPI = ((id: any) => {
            return (<any>this.doc.findId(id)).value;
        }) as Dollar;
        this.innerAPI.doc = this.doc;
    }

    eval(code: string) {
        this.cleanup();
        try {
            var func = new Function('$', code ?? '');
        }
        catch (e) { 
            return {value: null, err: e};
        }
        try {
            return {value: func(this.innerAPI)};
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

type Dollar = ((id: string) => any) & DollarEtc;

interface DollarEtc {
    doc: M.Document
}

type Resource = {cleanup: () => void};


export { ReactiveComputation }