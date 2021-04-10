import EJSON from 'ejson';


class LocalStore {
    key: string
    loadedValue: string

    constructor(key: string) { this.key = key; }

    load() {
        var l = localStorage[this.key];
        if (l) this.loadedValue = l;
        return l && EJSON.parse(l);
    }

    save(p: any) {
        p && (localStorage[this.key] = EJSON.stringify(p));
    }

    delete() {
        delete localStorage[this.key];
    }

    revert() {
        if (this.loadedValue) localStorage[this.key] = this.loadedValue;
        else this.delete();
    }
}


export { LocalStore }
