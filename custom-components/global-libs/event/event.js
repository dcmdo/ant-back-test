import TypesCheck from 'TypesCheck';
export default class Event{
    constructor(){
        this.declareVars();
    }
    //----------------------------------------内部属性方法----------------------------------------
    declareVars(){
        //----------私有----------
        this._handles = {};
        this._onceHandles = {};
    }

    //触发事件的函数
    _dispatch (e){
        let handles = this._handles[e.type];
        if(TypesCheck.isArray(handles)){
            for (let i = 0, len = handles.length; i < len; i++){
                let handle = handles[i];
                if(TypesCheck.isFunction(handle)){
                    handle(e);
                }
            }
        }

        handles = this._onceHandles[e.type];
        if(TypesCheck.isArray(handles)){
            for (let i = 0, len = handles.length; i < len; i++){
                let handle = handles[i];
                if(TypesCheck.isFunction(handle)){
                    handle(e);
                }
            }
            delete this._onceHandles[e.type];
        }
    }

    //----------------------------------------对外属性方法----------------------------------------
    debug(){
        console.log({...this._handles,...this._onceHandles});
    }

    //添加事件
    addEventListener(eventType,handle){
        this._handles[eventType] = this._handles[eventType] || [];
        if(this._handles[eventType].indexOf(handle)===-1){
            this._handles[eventType].push(handle);
        }
    }

    //添加一次性触发
    addEventListenerOnce(eventType,handle){
        this._onceHandles[eventType] = this._onceHandles[eventType] || [];
        if(this._onceHandles[eventType].indexOf(handle)===-1){
            this._onceHandles[eventType].push(handle);
        }
    }

    //移除事件
    removeEventListener(eventType,handle){
        //移除普通事件
        try{
            let handles = this._handles[eventType];
            let index = handles.indexOf(handle);
            if(index!==-1){
                handles.splice(index,1);
                if(handles.length === 0){
                    delete this._handles[eventType];
                }
            }
        }catch (e) {}

        //移除一次性触发事件
        try {
            let handles = this._onceHandles[eventType];
            let index = handles.indexOf(handle);
            if(index!==-1){
                handles.splice(index,1);
                if(handles.length === 0){
                    delete this._onceHandles[eventType];
                }
            }
        }catch (e) {}
    }

    /**
     * 清空事件
     * @param eventType {String} 不传参时清除所有事件
     */
    clear(eventType){
        if(eventType){
            delete this._handles[eventType];
            delete this._onceHandles[eventType];
        }else{
            this._handles = {};
        }
    }

    // 触发事件
    dispatchEvent(event){
        for (let i = 0, len = arguments.length; i < len; i++) {
            this._dispatch(arguments[i]);
        }
    }

    //是否包含特定类型的事件
    isContain(eventType){
        let isContain = this._handles[eventType] || false;
        let isContainOnce = this._onceHandles[eventType] || false;
        return isContain || isContainOnce;
    }
}