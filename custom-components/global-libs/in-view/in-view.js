import throttle from 'throttle';
import TypesCheck from 'TypesCheck';
import ObjectFns from 'ObjectFns';
import Event from 'Event';
//移动端强制朝向库，主要用以转换UI坐标系
import ForceOrientation from 'ForceOrientation';

const inViewSet = [];
const checkDelayHandle = throttle(()=>{
    inViewSet.forEach((inView)=>{
        inView.checkView();
    });
},100,{leading:false});

window.addEventListener("scroll",()=>{
    checkDelayHandle();
},true);

window.addEventListener("resize",()=>{
    checkDelayHandle();
},{passive:false});

export default class InView {
    constructor(container,elements){
        this.declareVars(container);
        this.initElements(elements);
        this.addToViewSet();
    }
    
    //-------------------------------------------------内部属性方法-------------------------------------------------
    declareVars(container){
        //----------私有----------
        this._container = container;//父参照节点
        this._elements = [];//要判断的元素集合
        this._inViewElements = [];//在视图内的元素集合
        this._nearElement;//视图内最近的元素
        this._exitViewElements = [];//在视图外面的元素集合
        this._event = new Event();//初始化事件模块
        this._isIgnoreNextCheck = false;//是否忽略下次检测
    }

    // 初始化元素
    initElements(elements){
        if(!elements){
            return;
        }
        if(!TypesCheck.isArray(elements)){
            elements = [elements];
        }
        elements.forEach((element)=>{
            if(this._elements.indexOf(element)===-1){
                this._elements.push(element);
            }
        });
        this.checkView();
    }

    addToViewSet(){
        if(inViewSet.indexOf(this)===-1){
            inViewSet.push(this);
        }
    }

    get containerRange(){
        let container = this.container;
        if(container === document.documentElement){
            let size = ForceOrientation.orientationWidthHeight(container.clientWidth, container.clientHeight);
            return {xRange:[0,size.width],yRange:[0,size.height]};
        }else{
            let rect = ForceOrientation.orientationClientRect(container.getBoundingClientRect());
            return {xRange:[rect.x,rect.x+rect.width],yRange:[rect.y,rect.y+rect.height]};
        }
    }

    checkView(){
        if(this.isIgnoreNextCheck){
            this.isIgnoreNextCheck = false;
            return;
        }
        if(this._elements.length<1){
            return;
        }
        let xRefRange = this.containerRange.xRange;
        let yRefRange = this.containerRange.yRange;
        let inViews = [];
        let exitViews = [];
        let nearView;
        let curDistance = Infinity;
        this._elements.forEach((element)=>{
            let rect = ForceOrientation.orientationClientRect(element.getBoundingClientRect());
            let xRange = [rect.x,rect.x+rect.width];
            let yRange = [rect.y,rect.y+rect.height];
            let inX = false;
            if(xRange[0]>=xRefRange[0] && xRange[0]<=xRefRange[1]){
                inX = true;
            }else if(xRange[1]>=xRefRange[0] && xRange[1]<=xRefRange[1]){
                inX = true;
            }else if(xRange[0]<=xRefRange[0] && xRange[1]>=xRefRange[1]){
                inX = true;
            }
            let inY = false;
            if(yRange[0]>=yRefRange[0] && yRange[0]<=yRefRange[1]){
                inY = true;
            }else if(yRange[1]>=yRefRange[0] && yRange[1]<=yRefRange[1]){
                inY = true;
            }else if(yRange[0]<=yRefRange[0] && yRange[1]>=yRefRange[1]){
                inY = true;
            }
            if(inY && inX){
                let dis = Math.abs(xRefRange[0]-xRange[0]) + Math.abs(yRefRange[0]-yRange[0]);
                if(dis<curDistance){
                    nearView = element;
                    curDistance = dis;
                }
                inViews.push(element);
            }else if(this._inViewElements.indexOf(element)!==-1){
                exitViews.push(element);
            }
        });
        if(!ObjectFns.isEqual(exitViews,this._exitViewElements)){
            this._exitViewElements = exitViews;
            if(exitViews.length>0){
                this._event.dispatchEvent({
                    type:"exitView",
                    elements:exitViews
                })
            }
        }
        if(!ObjectFns.isEqual(inViews,this._inViewElements)||this._nearElement!==nearView){
            this._inViewElements = inViews;
            this._nearElement = nearView;
            if(inViews.length>0){
                this._event.dispatchEvent({
                    type:"inView",
                    elements:inViews,
                    nearElement:nearView
                })
            }
        }
    }

    //-------------------------------------------------对外属性方法-------------------------------------------------
    get container(){
        return this._container?this._container:document.documentElement;
    }
    set container(container){
        this._container = container;
    }

    //添加元素
    addElements(elements, doCheck=false){
        if(!elements)
            return;
        if(!TypesCheck.isArray(elements)){
            elements = [elements];
        }
        elements.forEach((element)=>{
            if(this._elements.indexOf(element)===-1){
                this._elements.push(element);
            }
        });
        if(doCheck){
            this.checkView();
        }
    }

    //移除元素
    removeElements(elements, doCheck=false){
        if(!elements)
            return;
        if(!TypesCheck.isArray(elements)){
            elements = [elements];
        }
        elements.forEach((element)=>{
            let index = this._elements.indexOf(element);
            if(index !== -1){
                this._elements.splice(index,1);
            }
        });
        if(doCheck){
            this.checkView();
        }
    }

    //清空元素
    clearElements(){
        this._elements = [];
        this._inViewElements = [];
        this._nearElement = undefined;
        this._exitViewElements = [];
    }

    //销毁当前组件
    dispose(){
        let index = inViewSet.indexOf(this);
        if(index!==-1){
            inViewSet.splice(index,1);
        }
    }

    //监听inView事件
    onInView(inViewHandle){
        this._event.addEventListener("inView",inViewHandle);
    }

    //移除inView事件
    offInView(inViewHandle){
        this._event.removeEventListener("inView",inViewHandle);
    }

    //监听exitView事件
    onExitView(exitViewHandle){
        this._event.addEventListener("exitView",exitViewHandle);
    }

    //移除exitView事件
    offExitView(exitViewHandle){
        this._event.removeEventListener("exitView",exitViewHandle);
    }

    //是否下次忽略检测
    get isIgnoreNextCheck(){
        return this._isIgnoreNextCheck;
    }

    set isIgnoreNextCheck(isIgnoreNextCheck){
        this._isIgnoreNextCheck = isIgnoreNextCheck;
    }
}