import _ from 'underscore';

const _isContain = (a1,a2)=>{
    let res = true;
    a1.some((item,index)=>{
        if(item!==a2[index]){
            res = false;
            return true;
        }
    });
    return res;
};

const ArrayFns = {
    first:_.first,
    initial:_.initial,
    last:_.last,
    rest:_.rest,
    compact:_.compact,
    flatten:_.flatten,
    without: _.without,
    union: _.union,
    intersection: _.intersection,
    difference: _.difference,
    uniq: _.uniq,
    zip:_.zip,
    unzip:_.unzip,
    object:_.object,
    sortedIndex:_.sortedIndex,
    range:_.range,
    isContain(array1,array2){
        let len1 = array1.length;
        let len2 = array2.length;
        if(len1<len2){
            return _isContain(array1,array2);
        } else{
            return _isContain(array2,array1);
        }
    }
};
export default ArrayFns;
