import EJSON from 'ejson';


class LocalStore {
    key: string;

    constructor(key: string) { this.key = key; }

    load() {
        var l = localStorage[this.key];
        return l && EJSON.parse(l);
    }

    save(p: any) {
        p && (localStorage[this.key] = EJSON.stringify(p));
    }
}


export { LocalStore }
