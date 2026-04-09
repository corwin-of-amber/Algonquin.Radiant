
class StableObj<T extends object> {
    obj?: T

    set(t: T) {
        return this.obj = StableObj.stable(this.obj, t);
    }
    
    static stable<T extends object>(obj: T, t: T) {
        return obj ? this.cleanup(Object.assign(obj, t), t) : t;
    }

    static cleanup<T extends object>(obj: T, t: T) {
        for (let k of Object.getOwnPropertyNames(obj))
            if (!Object.hasOwn(t, k)) delete obj[k];
        return obj;
    }
}


export { StableObj }