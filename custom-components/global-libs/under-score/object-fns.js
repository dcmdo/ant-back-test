import _ from 'underscore';
import deepCopy from 'deepcopy';

const _merge = (a,b)=>{
    let res = {};
    for(let k in a){
        res[k] = a[k];
    }
    for(let k in b){
        res[k] = b[k];
    }
    return res;
};

const _length = (obj)=>{
    return _.keys(obj).length;
};

export default {
    keys:_.keys,
    allKeys:_.allKeys,
    values:_.values,
    mapObject:_.mapObject,
    pairs:_.pairs,
    invert:_.invert,
    create:_.create,
    functions:_.functions,
    findKey:_.findKey,
    extend:_.extend,
    extendOwn:_.extendOwn,
    merge:_merge,
    pick:_.pick,
    omit:_.omit,
    defaults:_.defaults,
    clone:deepCopy,
    has:_.has,
    isEqual:_.isEqual,
    length:_length
}
