import EJSON from 'ejson';


type Value<T = any, E = string> = {value?: T, err?: E}


/**
 * Auxiliary class for values that are not supposed to be persistent.
 * (currently unused...)
 */
class Ephemeral {
    static readonly name = 'Ephemeral'

    /* EJSON */
    typeName() { return Ephemeral.name; }
    toJSONValue() {
        return {};
    }
    static fromJSONValue(v: {}) {
        return new Ephemeral();
    }
}

EJSON.addType(Ephemeral.name, Ephemeral.fromJSONValue);


export { Value }