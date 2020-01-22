const s4 = ()=>{
    return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
};

const GUID_UUID = {
    guid(){
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    },
    uuid(){
        return s4() + s4() + s4() + s4() + s4() + s4() + s4() + s4();
    }
};

export default GUID_UUID;