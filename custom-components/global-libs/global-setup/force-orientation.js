import Event from "Event";

const _event = new Event();
let rotAngle = 0;

// 初始化body基础样式
const root = document.body;
root.style.position = "absolute";
root.style.transformOrigin = "50% 50%";

let landscapeTimeout = null;

const landscapeHandle = ()=>{
    let orientation = null;
    let angle = window.orientation;
    if(angle===0||angle===180){
        orientation = "portrait";
    }else if(angle===90||angle===-90){
        orientation = "landscape";
    }
    if(!orientation){
        return;
    }
    clearTimeout(landscapeTimeout);
    landscapeTimeout = setTimeout(()=>{
        let cHeight = document.documentElement.clientHeight;
        let cWidth = document.documentElement.clientWidth;
        if(orientation==="portrait"){
            rotAngle = 90;
            root.style.transform = "rotate(90deg)";
            root.style.width = cHeight+"px";
            root.style.height = cWidth+"px";
            root.style.left = -(cHeight-cWidth)*0.5+"px";
            root.style.top = (cHeight-cWidth)*0.5+"px";
        }else if(orientation==="landscape"){
            rotAngle = 0;
            root.style.transform = "rotate(0deg)";
            root.style.width = cWidth+"px";
            root.style.height = cHeight+"px";
            root.style.left = "0px";
            root.style.top = "0px";
        }
        _event.dispatchEvent({type:"change"});
    },100);
};

const ForceOrientation = {
    onChangeHandle:(handle)=>{
        _event.addEventListener("change",handle);
    },
    offChangeHandle:(handle)=>{
        _event.removeEventListener("change",handle);
    },
    //----------移动端强制横屏----------
    forceLandscape(){
        window.addEventListener("orientationchange",landscapeHandle,false);
        window.addEventListener("resize",landscapeHandle,{ passive: false });
        landscapeHandle();
    },

    //----------转换事件位置信息----------
    orientationEventPoint(point){
        if(rotAngle===0){
            return point;
        }
        if(point.__isOrientationEventPoint){
            return point;
        }
        point.__isOrientationEventPoint = true;
        if(rotAngle===90){
            let x,y;
            let clientWidth = document.documentElement.clientWidth;
            let screenWidth = window.screen.width;
            if(point.clientX!==undefined){
                x = point.clientY;
                y = point.clientX;
                Object.defineProperties(point,{
                    clientX:{
                        value:x,
                        configurable:true,
                        enumerable:true
                    },
                    clientY:{
                        value:clientWidth-y,
                        configurable:true,
                        enumerable:true
                    }
                })
            }
            if(point.screenX!==undefined){
                x = point.screenY;
                y = point.screenX;
                Object.defineProperties(point,{
                    screenX:{
                        value:x,
                        configurable:true,
                        enumerable:true
                    },
                    screenY:{
                        value:screenWidth-y,
                        configurable:true,
                        enumerable:true
                    }
                })
            }
            if(point.pageX!==undefined){//后续可能需要校准和重新计算
                x = point.pageY;
                y = point.pageX;
                Object.defineProperties(point,{
                    pageX:{
                        value:x,
                        configurable:true,
                        enumerable:true
                    },
                    pageY:{
                        value:y,
                        configurable:true,
                        enumerable:true
                    }
                })
            }
        }
        return point;
    },
    
    //----------转换clientRect信息----------
    orientationClientRect(domRect){
        if(rotAngle===0){
            return domRect;
        }
        if(rotAngle===90){
            let clientWidth = document.documentElement.clientWidth;
            return {
                x:domRect.top,y:clientWidth - domRect.right,
                left:domRect.top,top:clientWidth - domRect.right,
                right:domRect.bottom, bottom:clientWidth - domRect.left,
                height:domRect.width,width:domRect.height
            };
        }
    },

    //----------转换宽高信息----------
    orientationWidthHeight(width,height){
        if(rotAngle===0){
            return {width:width,height:height};
        }else if(rotAngle===90){
            return {width:height,height:width};
        }
    }
};

export default ForceOrientation;