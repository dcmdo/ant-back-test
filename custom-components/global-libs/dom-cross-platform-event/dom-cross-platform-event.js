import ForceOrientation from 'ForceOrientation';

// 执行事件函数
const doEvent = (eventHandles,e)=>{
    eventHandles.forEach((item)=>{
        item(e);
    });
};

// 使用移动端强制方向之后转换touch事件的坐标
const orientationTouchPoints = (touches)=>{
    for(let i = 0; i < touches.length; i++){
        ForceOrientation.orientationEventPoint(touches[i]);
    }
};

// 为事件参数添加和修订一些参数
const setEventData = (e)=>{
    let isMouse = e instanceof MouseEvent;
    let event = e;
    event.isTouch = !isMouse;
    event.isMouse = isMouse;
    if(isMouse){
        event = ForceOrientation.orientationEventPoint(event);
    }else{
        orientationTouchPoints(event.changedTouches);
        orientationTouchPoints(event.touches);
    }
    return event;
};

class CrossEvent{
    constructor(element){
        this.declareVars(element);
    }
    //----------------------------------------内部属性方法----------------------------------------
    declareVars(element){
        //----------私有----------
        this._eventContainer = {
            "pointEnter":[], "pointMove":[], "pointOut":[], "pointDown":[],
            "pointUp":[], "pointClick":[], "pointDoubleClick":[], "wheel":[],
            "mouseWheel":[], "leftPointDown":[], "leftPointUp":[], "leftPointMove":[],
            "rightPointDown":[], "rightPointUp":[], "rightPointMove":[]
        };
        this._element = element;
        
        //----------事件处理函数的作用域绑定----------
        this._touchStartHandle = this.touchStartHandle.bind(this);
        this._touchMoveHandle = this.touchMoveHandle.bind(this);
        this._touchEndHandle = this.touchEndHandle.bind(this);
        this._mouseOverHandle = this.mouseOverHandle.bind(this);
        this._mouseMoveHandle = this.mouseMoveHandle.bind(this);
        this._mouseOutHandle = this.mouseOutHandle.bind(this);
        this._mouseDownHandle = this.mouseDownHandle.bind(this);
        this._mouseUpHandle = this.mouseUpHandle.bind(this);
        this._clickHandle = this.clickHandle.bind(this);
        this._wheelHandle = this.wheelHandle.bind(this);

        // 双击相关变量
        this._listenDoubleClick = false;
        this._clickTimeListener = null;

        this._isStart = false;
    }

    //----------事件处理函数----------
    touchStartHandle(e){
        let event = setEventData(e);
        event.target._isTouch = true;
        doEvent(this._eventContainer["pointEnter"],event);
        doEvent(this._eventContainer["pointDown"],event);
        let touchLength = event.touches.length;
        if(touchLength===1){
            doEvent(this._eventContainer["leftPointDown"],event);
        }else if(touchLength===2){
            doEvent(this._eventContainer["leftPointUp"],event);
            doEvent(this._eventContainer["rightPointDown"],event);
        }else if(touchLength===3){
            doEvent(this._eventContainer["rightPointUp"],event);
        }
    };
    touchMoveHandle(e){
        let event = setEventData(e);
        event.target._isTouch = false;
        doEvent(this._eventContainer["pointMove"],event);
        if(event.touches.length===1){
            doEvent(this._eventContainer["leftPointMove"],event);
        }
        else if(event.touches.length===2){
            doEvent(this._eventContainer["rightPointMove"],event);
        }
    };
    touchEndHandle(e){
        let event = setEventData(e);
        doEvent(this._eventContainer["pointUp"],event);
        let touchLength = event.touches.length;
        if(touchLength===2){
            doEvent(this._eventContainer["rightPointDown"],event);
        }else if(touchLength===1){
            doEvent(this._eventContainer["rightPointUp"],event);
            doEvent(this._eventContainer["leftPointDown"],event);
        }else if(touchLength===0){
            doEvent(this._eventContainer["leftPointUp"],event);
        }
        doEvent(this._eventContainer["pointOut"],event);
    };
    mouseOverHandle(e){
        let event = setEventData(e);
        doEvent(this._eventContainer["pointEnter"],event);
    };
    mouseMoveHandle(e){
        if(e.target._isTouch){
            return;
        }
        let event = setEventData(e);
        doEvent(this._eventContainer["pointMove"], event);
        if (event.buttons===1)
            doEvent(this._eventContainer["leftPointMove"], event);
        else if (event.buttons === 2)
            doEvent(this._eventContainer["rightPointMove"], event);
    };
    mouseOutHandle(e){
        let event = setEventData(e);
        doEvent(this._eventContainer["pointOut"],event);
    };
    mouseDownHandle(e){
        if(e.target._isTouch){
            return;
        }
        let event = setEventData(e);
        doEvent(this._eventContainer["pointDown"], event);
        if (event.button === 0)
            doEvent(this._eventContainer["leftPointDown"], event);
        else if (event.button === 2)
            doEvent(this._eventContainer["rightPointDown"], event);
    };
    mouseUpHandle(e){
        if(e.target._isTouch){
            return;
        }
        let event = setEventData(e);
        doEvent(this._eventContainer["pointUp"], event);
        if (event.button === 0)
            doEvent(this._eventContainer["leftPointUp"], event);
        else if (event.button === 2)
            doEvent(this._eventContainer["rightPointUp"], event);
    };
    clickHandle(e){
        let event = setEventData(e);
        event.target._isTouch = false;
        doEvent(this._eventContainer["pointClick"], event);
        if(this._listenDoubleClick){
            this._listenDoubleClick = false;
            clearTimeout(this._clickTimeListener);
            doEvent(this._eventContainer["pointDoubleClick"], event);
        }else{
            this._listenDoubleClick = true;
            this._clickTimeListener = setTimeout(()=>{
                this._listenDoubleClick = false;
            },200);
        }
    };
    wheelHandle(e){
        doEvent(this._eventContainer["wheel"],setEventData(e));
        doEvent(this._eventContainer["mouseWheel"],setEventData(e));
    };

    //----------------------------------------对外属性方法----------------------------------------
    //----------抛弃的方法----------
    add(eventType,handle){
        console.warn("改方法已抛弃，请使用addEventListener");
        this.addEventListener(eventType,handle);
    }
    remove(eventType,handle){
        console.warn("改方法已抛弃，请使用removeEventListener");
        this.removeEventListener(eventType,handle)
    }
    destroy(){
        console.warn("该方法已抛弃，请使用dispose代替");
        this.dispose();
    }

    // 添加事件
    addEventListener(eventType,handle){
        if(handle in this._eventContainer[eventType]){
            console.error("当前事件已包含该handle");
            return;
        }
        this._eventContainer[eventType].push(handle);
    }

    // 移除事件
    removeEventListener(eventType,handle){
        let index = this._eventContainer[eventType].indexOf(handle);
        if(index!==-1){
            this._eventContainer[eventType].splice(index,1);
        }
    }

    // 清空事件
    clear(){
        for(let k in this._eventContainer){
            this._eventContainer[k] = [];
        }
    }

    // 开始事件监听
    start(){
        if(this._isStart)
            return;
        this._isStart = true;
        this._element.addEventListener("touchstart",this._touchStartHandle,{ passive: false });
        this._element.addEventListener("touchmove",this._touchMoveHandle,{ passive: false });
        this._element.addEventListener("touchend",this._touchEndHandle,{ passive: false });
        this._element.addEventListener("mouseover",this._mouseOverHandle,{ passive: false });
        this._element.addEventListener("mousemove",this._mouseMoveHandle,{ passive: false });
        this._element.addEventListener("mouseout",this._mouseOutHandle,{ passive: false });
        this._element.addEventListener("mousedown",this._mouseDownHandle,{ passive: false });
        this._element.addEventListener("mouseup",this._mouseUpHandle,{ passive: false });
        this._element.addEventListener("click",this._clickHandle,{ passive: false });
        this._element.addEventListener("wheel",this._wheelHandle,{ passive: false });
    }

    // 结束事件监听
    end(){
        if(!this._isStart)
            return;
        this._isStart = false;
        this._element.removeEventListener("touchstart",this._touchStartHandle);
        this._element.removeEventListener("touchmove",this._touchMoveHandle);
        this._element.removeEventListener("touchend",this._touchEndHandle);
        this._element.removeEventListener("mouseover",this._mouseOverHandle);
        this._element.removeEventListener("mousemove",this._mouseMoveHandle);
        this._element.removeEventListener("mouseout",this._mouseOutHandle);
        this._element.removeEventListener("mousedown",this._mouseDownHandle);
        this._element.removeEventListener("mouseup",this._mouseUpHandle);
        this._element.removeEventListener("click",this._clickHandle);
        this._element.removeEventListener("wheel",this._wheelHandle);
    }

    // 释放事件
    dispose(){
        this.clear();
        this.end();
    }
}
const DOMCrossPlatformEvent = {
    eventType:{
        "pointEnter":"pointEnter",
        "pointMove":"pointMove",
        "pointOut":"pointOut",
        "pointDown":"pointDown",
        "pointUp":"pointUp",
        "pointClick":"pointClick",
        "pointDoubleClick":"pointDoubleClick",
        "wheel":"wheel",
        "mouseWheel":"mouseWheel",// 已抛弃
        "leftPointDown":"leftPointDown",
        "leftPointUp":"leftPointUp",
        "leftPointMove":"leftPointMove",
        "rightPointDown":"rightPointDown",
        "rightPointUp":"rightPointUp",
        "rightPointMove":"rightPointMove"
    },
    createEvent(element){
        return new CrossEvent(element);
    },

    // 该方法抛弃
    CreateCrossEvent:(element)=>{
        console.warn("该方法已抛弃，请使用createEvent代替");
        return new CrossEvent(element);
    }
};
export default DOMCrossPlatformEvent;