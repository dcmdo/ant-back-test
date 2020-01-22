//----------导入react组件----------
import React,{Component} from 'react';
import ReactDOM from 'react-dom';

//----------导入UI依赖项----------
import ForceOrientation from 'ForceOrientation';//移动端强制朝向库，主要用以转换UI坐标系
import ClassNames from 'classnames';//动态拼装样式类名
import DOMCrossPlatformEvent from 'DOMCrossPlatformEvent';//跨平台交互事件
import TypesCheck from 'TypesCheck';//类型检测
import ObjectFns from 'ObjectFns';//对象常用操作类
import ArrayFns from 'ArrayFns';//数组常用操作类
import throttle from 'throttle';//函数节流
import Immutable from 'immutable';//不可变对象
import Event from 'Event';

//----------导入默认样式----------
import './default-style/default-style.scss';

//----------------------------------------全局页面缩放、滚动事件监听，分发----------------------------------------
const UIGlobalEvent = new Event();

//页面缩放事件触发
const resizeEventHandle = throttle((e)=>{
    UIGlobalEvent.dispatchEvent({
        type:"global-resize"
    });
},50,{leading:false});

//鼠标滚轮事件触发
const scrollEventHandle = throttle((e)=>{
    UIGlobalEvent.dispatchEvent({
        type:"global-scroll"
    });
},50,{leading:false});
window.addEventListener("resize",resizeEventHandle,{ passive: false });
window.addEventListener("scroll",scrollEventHandle,true);
ForceOrientation.onChangeHandle(resizeEventHandle);

//----------------------------------------UI全局事件对象初始化----------------------------------------
const UISetEvent = new Event();
//----------------------------------------移动端hover样式处理----------------------------------------
import ClientDetect from 'ClientDetect';
(()=>{
    if(ClientDetect.isMobile()){
        let styleList = document.styleSheets;
        for(let i = 0,len = styleList.length;i<len;i++){
            let sheet = styleList[i];
            try{
                let rules = sheet.cssRules;
                for(let i = rules.length-1;i>-1;i--){
                    if(/\:hover/.test(rules[i]["selectorText"])){//移除hover选中
                        sheet.deleteRule(i);
                    }
                }
            }catch (ex) {}
        }
    }
})();
//----------------------------------------属性列表----------------------------------------
/**
 * orignalProps:{}原生属性
 * isRender = true;——是否渲染
 * isEnable = true;——是否可用
 * isVisible = true;——是否可见
 * className;——样式类名
 * disableClass;——不可用时的样式类名
 * extraClass;——附加样式类
 * tagName;——组件的标识
 * isRegisterEvent:true;——是否注册默认交互事件
 * setEventType:"";——设置内部事件类型（不常用）
 * stopPropagationList;——停止冒泡的默认事件列表（不常用）
 * callbackComponent:(component)=>{};——获取组件的引用
 * callbackComponentMount:(component)=>{};——获取组件的引用，已挂载至Dom
 * onPropsChanged:(component)=>{};
 * onStateChanged:(component)=>{};
 * onDestroy:(component)=>{};
 */
export default class UIComponent extends Component{
    //----------------------------------------UI常用功能库定义----------------------------------------
    static get fns(){
        return {
            //----------UI内部事件----------
            UISetEvent:UISetEvent,
            //----------跨平台交互事件----------
            DOMCrossPlatformEvent:DOMCrossPlatformEvent,
            //----------类型检测模块----------
            TypesCheck:TypesCheck,
            //----------对象的常用操作----------
            ObjectFns:ObjectFns,
            //----------数组的常用操作----------
            ArrayFns:ArrayFns,
            //----------HashCode----------
            Immutable:Immutable,
            //----------函数节流----------
            throttle:throttle,
            /**
             * 创建根据条件变化的react元素
             * @param scope 作用域
             * @param key 对象的访问键名
             * @param condition true为可变，false为不可变
             * @param elementHandle:用于生成对象的函数，返回object
             * @returns scope[key]
             */
            constElement:(scope,key,condition,elementHandle)=>{
                let _key = "_const_element_"+key;
                if(scope[_key]===undefined){
                    scope[_key] = elementHandle();
                }else if("__force__" in scope.changedState){
                    scope[_key] = elementHandle();
                }else if(condition){
                    scope[_key] = elementHandle();
                }
                return scope[_key];
            },
            /**
             * 创建永远不可变的对象
             * @param scope 作用域
             * @param key 对象的访问键名
             * @param object 键指向的对象
             * @returns scope[key]
             */
            constObject:(scope,key,object)=>{
                let _key = "_const_object_"+key;
                if(scope[_key]===undefined){
                    scope[_key] = object;
                }
                return scope[_key];
            },
            //----------px转换rem----------
            convertToRem:(size)=>{
                let parentFontSize = window.getComputedStyle(document.documentElement).fontSize;
                return (size/parseFloat(parentFontSize));
            },
            //----------rem转换px----------
            remToPx:(rem)=>{
                let parentFontSize = window.getComputedStyle(document.documentElement).fontSize;
                return parseFloat(parentFontSize)*rem;
            },
            //----------分割CssValue值及单位----------
            splitCssValue:(cssValue)=>{
                let num = cssValue.replace(/[a-zA-Z]+/,"");
                let unit = cssValue.replace(num,"");
                num = Number(num);
                return [num,unit];
            },
            //----------获取React元素的DOM元素----------
            getReactDOM:(reactRef)=>{
                return ReactDOM.findDOMNode(reactRef);
            },
            //----------计算React元素的ClientRect----------
            getBoundingClientRect:(reactRefOrDom)=>{
                let element = reactRefOrDom;
                if(UIComponent.fns.isReactElement(reactRefOrDom)){
                    element = UIComponent.fns.getReactDOM(reactRefOrDom);
                }
                if(element){
                    return ForceOrientation.orientationClientRect(element.getBoundingClientRect());
                }else{
                    return null;
                }
            },
            //----------判断是否在元素内----------
            pointIsInElement(reactRefOrDom,pointPos){
                let bound = UIComponent.fns.getBoundingClientRect(reactRefOrDom);
                let region = {
                    minX:bound.left+window.screenLeft,maxX:bound.left+bound.width+window.screenLeft,
                    minY:bound.top+window.screenTop,maxY:bound.top+bound.height+window.screenTop
                };
                return pointPos.x>region.minX&&pointPos.x<region.maxX
                &&pointPos.y>region.minY&&pointPos.y<region.maxY;
            },
            //----------计算指针相对于元素的位置----------
            getPointPosByReactElement:(reactRefOrDom,pointPos)=>{
                let bound = UIComponent.fns.getBoundingClientRect(reactRefOrDom);
                return {x:pointPos.x-bound.left,y:pointPos.y-bound.top};
            },
            //----------计算指针相对于元素的位置，百分比表示----------
            getPointPosByReactElementPercentage:(reactRef,pointPos)=>{
                let bound = UIComponent.fns.getBoundingClientRect(reactRef);
                return {x:(pointPos.x-bound.left)/bound.width,y:(pointPos.y-bound.top)/bound.height};
            },
            //----------检测是否为React组件----------
            isReactElement(checkTarget){
                if(UIComponent.fns.TypesCheck.isEmpty(checkTarget))
                    return false;
                return React.isValidElement(checkTarget) || checkTarget instanceof Component;
            },
            //----------检测React元素类型----------
            isSpecificReactType(checkTarget,type){
                if(!UIComponent.fns.isReactElement(checkTarget))
                    return false;
                let types = [checkTarget.type];
                let circleTag = true;
                let index = 0;
                let res = false;
                while (circleTag){
                    res = types[index]===type;
                    if(res){
                        circleTag = false;
                    }else{
                        if(types[index].__proto__===Component){
                            res = types[index].__proto__===type;
                            circleTag = false;
                        }else{
                            types.push(types[index].__proto__);
                            index +=1;
                        }
                    }
                }
                return res;
            },
        };
    }
    //----------------------------------------组件对外属性----------------------------------------
    //----------是否渲染----------
    get isRender(){
        return UIComponent.fns.TypesCheck.isBoolean(this.state.isRender)?this.state.isRender:true;
    }
    set isRender(bool){
        this.setState({isRender:bool});
    }
    //----------是否可用----------
    get isEnable(){
        return UIComponent.fns.TypesCheck.isBoolean(this.state.isEnable)?this.state.isEnable:true;
    }
    set isEnable(isEnable){
        this.setState({isEnable:isEnable});
    }
    //----------是否可见----------
    get isVisible(){
        return UIComponent.fns.TypesCheck.isBoolean(this.state.isVisible)?this.state.isVisible:true;
    }
    set isVisible(isVisible){
        this.setState({isVisible:isVisible});
    }
    //----------组件标识名----------
    get tagName(){
        return this.props.tagName;
    }
    //----------样式类----------
    get className(){
        return this.state.className;
    }
    set className(className){
        this.setState({className:className});
    }
    //----------不可用时的样式类----------
    get disableClass(){
        return this.state.disableClass?this.state.disableClass:"default-disable";
    }
    set disableClass(disableClass){
        this.setState({disableClass:disableClass});
    }
    //----------附加样式类----------
    get extraClass(){
        return this.state.extraClass;
    }
    set extraClass(extraClass){
        this.setState({extraClass:extraClass});
    }
    //----------样式----------
    get style(){
        return this.state.style || {};
    }
    set style(style){
        this.setState({style:style});
    }
    //----------元素id----------
    get id(){
        return this.state.id;
    }
    set id(id){
        this.setState({id:id});
    }
    //----------元素子元素----------
    get children(){
        return this.state.children;
    }
    set children(children){
        this.setState({children:children});
    }
    //----------------------------------------组件内部属性及方法----------------------------------------
    //----------是否注册可交互UI事件----------
    get isRegisterEvent(){
        return this.props.isRegisterEvent===false?false:true;
    }
    //----------组件布局更改类型resize:true,false;scroll:true,false;----------
    get clientRectChangeEventType(){
        return {};
    }
    //----------可控属性列表----------
    get controlledProps(){
        return ["isRender","isEnable","isVisible","className","disableClass","extraClass","style","id","children"];
    }
    //对于引用类型的对象，进行属性和状态对同源数据的分离修改
    get controlledPropsWithClone(){
        return [];
    }
    //----------判断某些属性是否更改----------
    propsHasChanged(){
        for(let i = 0;i< arguments.length;i++){
            if(arguments[i] in this.changedProps){
                return true;
            }
        }
        return false;
    }
    //----------判断某些状态是否更改----------
    statesHasChanged(){
        for(let i = 0;i< arguments.length;i++){
            if(arguments[i] in this.changedState){
                return true;
            }
        }
        return false;
    }
    //----------------------------------------组件构建相关函数----------------------------------------
    //----------组件构造函数----------
    constructor(props,context){
        super(props,context);
        this.alive = true;
        this.awake();
    }
    //----------组件初始化时调用----------
    awake(){
        this.declareVars();
        //返回当前组件
        if(this.props.callbackComponent){
            this.props.callbackComponent(this);
        }else if(this.props.callBackComponent){//兼容旧版
            this.props.callBackComponent(this);
        }
    }

    declareVars(){
        //----------私有----------
        this._firstInit = true;
        //----------共有----------
        //状态赋值并记录状态及属性的不可变数据
        this.state = this.initState();
        this.changedProps = {};
        this.changedState = {};
        //初始化全局事件
        this.events = ["pointEnter","pointMove","pointOut","pointDown","pointUp","pointClick","pointDoubleClick"];
        
        //----------函数----------
        //初始化全局缩放事件指向的函数
        this.resizeChange = ()=>{
            let currentRect = {width:0,height:0,left:0,right:0,top:0,bottom:0};
            if(this.refs.parent){
                let bound = UIComponent.fns.getBoundingClientRect(this.refs.parent);
                for(let k in currentRect){
                    currentRect[k] = bound[k];
                }
            }
            if(UIComponent.fns.ObjectFns.isEqual(this.clientRect,currentRect)){
                return;
            }else{
                this.clientRect = currentRect;
                this.clientRectChange();
            }
        };
        //初始化状态重置事件指向函数
        this.resetHandle=(e)=>{
            this.setState(e.state);
        };
    }

    //----------初始化状态----------
    initState() {
        let state = {
            __force__:false,
            __component__:this
        };
        if(this.props){
            let controlled = this.controlledProps;
            let controlledWithClone = this.controlledPropsWithClone;
            for(let k in this.props){
                if(controlled.indexOf(k)!==-1){
                    state[k] = this.props[k];
                }else if(controlledWithClone.indexOf(k)!==-1){
                    state[k] = UIComponent.fns.ObjectFns.clone(this.props[k]);
                }
            }
        }
        return state;
    }
    //----------动态添加样式类----------
    getClassName(){
        let className = {};
        if(this.className)
            className[this.className] = true;
        if(this.disableClass)
            className[this.disableClass] = !this.isEnable;
        if(this.extraClass)
            className[this.extraClass] = true;
        className["default-hidden"] = !this.isVisible;
        return className;
    }
    //----------获取子组件----------
    getChildren(){
        return this.children;
    }
    //----------渲染，可重写----------
    render(){
        if(!this.isRender){
            return null;
        }
        return(
            <div {...this.props.orignalProps} ref='parent' id={this.id} className={ClassNames(this.getClassName())} style={this.style}>
                {this.getChildren()}
            </div>
        );
    }
    //----------------------------------------生命周期函数----------------------------------------
    static getDerivedStateFromProps(nextProps,nextState){
        let _component = nextState.__component__;
        let lastProps = _component.props;
        _component.changedState = {};
        let changedProps = {};
        _component.changedProps = changedProps;
        if(_component._firstInit){
            _component.props_changed = true;
            _component.state_changed = true;
            for(let key in nextState){
                _component.changedState[key] = {last:undefined,next:nextState[key]};
            }
            for(let key in nextProps){
                _component.changedProps[key] = {last:undefined,next:nextProps[key]};
            }
        }
        let propsState = {};
        let keys = UIComponent.fns.ArrayFns.union(
            UIComponent.fns.ObjectFns.keys(lastProps),UIComponent.fns.ObjectFns.keys(nextProps)
        );
        if(keys){
            let controlled = _component.controlledProps;
            let controlledWithClone = _component.controlledPropsWithClone;
            keys.forEach((item)=>{
                let last = {},next={};
                last[item] = lastProps[item];
                next[item] = nextProps[item];
                if(!Immutable.is(Immutable.fromJS(last),Immutable.fromJS(next))){
                    if(controlled.indexOf(item)!==-1){
                        propsState[item] = next[item];
                    }else if(controlledWithClone.indexOf(item)!==-1){
                        propsState[item] = UIComponent.fns.ObjectFns.clone(next[item]);
                    }else{
                        changedProps[item] = {last:last[item],next:next[item]};
                    }
                }
            });
            if(!UIComponent.fns.TypesCheck.isEmpty(propsState)){
                return propsState;
            }
        }
        return null;
    }
    //----------决定组件是否更新----------
    shouldComponentUpdate(nextProps,nextState,debug){
        // this.changedState = {};
        let keys = UIComponent.fns.ArrayFns.union(
            UIComponent.fns.ObjectFns.keys(this.state),UIComponent.fns.ObjectFns.keys(nextState)
        );
        if(UIComponent.fns.TypesCheck.isArray(keys)){
            keys.forEach((item)=>{
                let last = {},next = {};
                last[item] = this.state[item];
                next[item] = nextState[item];
                if(!Immutable.is(Immutable.fromJS(last),Immutable.fromJS(next))){
                    this.changedState[item] = {
                        last:last[item],next:next[item]
                    };
                }
            })
        }
        this.props_changed = false;
        if(!UIComponent.fns.TypesCheck.isEmpty(this.changedProps)){
            this.props_changed = true;
        }
        this.state_changed = false;
        if(!UIComponent.fns.TypesCheck.isEmpty(this.changedState)){
            this.state_changed = true;
        }
        if(debug===true){
            console.log("----------------------------------------");
            console.log(this,this.state,nextState);
            console.log(this.changedState,this.changedProps,"shouldComponentUpdate");
            console.log("----------------------------------------");
        }
        return this.props_changed||this.state_changed;
    }
    //----------dom更新之后调用----------
    componentDidUpdate(prevProps, prevState){
        this.domDidChange();
    }
    //----------组件初始化至DOM调用----------
    componentDidMount(){
        this.domDidChange();
        if(this.props.callbackComponentMount){
            this.props.callbackComponentMount(this);
        }
        if(this._firstInit){
            this._firstInit = false;
        }
    }
    //----------组件将要被移除的时候调用----------
    componentWillUnmount(){
        this.alive = false;
        this.domUnmount();
        if(this.props.onDestroy){
            this.props.onDestroy(this);
        }
    }
    //----------dom挂载时调用----------
    domMount(){
        //添加跨平台交互事件
        if(this.isRegisterEvent){
            try{
                this.domCrossPlatformEvent = DOMCrossPlatformEvent.createEvent(UIComponent.fns.getReactDOM(this.refs.parent));
                this.events.forEach((item)=>{
                    this.domCrossPlatformEvent.addEventListener(item,this[item].bind(this));
                });
                this.domCrossPlatformEvent.start();
            }catch (e) {
                console.warn("未发现可供添加事件的节点:this.refs.parent");
            }
        }
        //添加全局缩放,移动事件
        let rectChangeEventType = this.clientRectChangeEventType;
        if(rectChangeEventType){
            if(rectChangeEventType.resize){
                UIGlobalEvent.addEventListener("global-resize",this.resizeChange);
            }
            if(rectChangeEventType.scroll){
                UIGlobalEvent.addEventListener("global-scroll",this.resizeChange)
            }
        }
        this.resizeChange();
        //添加状态重置函数
        if(UIComponent.fns.TypesCheck.isString(this.props.setEventType)){
            if(UIComponent.fns.UISetEvent.isContain(this.props.setEventType)){
                console.warn("UI组件的状态重置事件类型不唯一，可能会导致问题发生，事件类型为："+this.props.setEventType);
            }
            UIComponent.fns.UISetEvent.addEventListener(this.props.setEventType,this.resetHandle);
        }
    }
    //----------dom更改的时候调用----------
    domDidChange(){
        if(this.props_changed){
            this.propsChanged();
        }
        if(this.state_changed){
            this.stateChanged();
        }
        if(!UIComponent.fns.ObjectFns.isEqual(this.oldRender,this.isRender)){
            this.oldRender = this.isRender;
            if(this.oldRender){
                this.domMount();
            }else{
                this.domUnmount();
            }
        }
    }
    //----------dom卸载时调用----------
    domUnmount(){
        //移除默认跨平台交互事件
        if(this.isRegisterEvent){
            try{
                this.domCrossPlatformEvent.dispose();
                this.domCrossPlatformEvent = null;
            }catch(ex){}
        }
        //移除全局缩放移动事件
        let rectChangeEventType = this.clientRectChangeEventType;
        if(rectChangeEventType){
            if(rectChangeEventType.resize){
                UIGlobalEvent.removeEventListener("global-resize",this.resizeChange);
            }
            if(rectChangeEventType.scroll){
                UIGlobalEvent.removeEventListener("global-scroll",this.resizeChange)
            }
        }
        //重置this.clientRect
        this.clientRect = {};
        //移除状态重置事件
        if(UIComponent.fns.TypesCheck.isString(this.props.setEventType)){
            UIComponent.fns.UISetEvent.removeEventListener(this.props.setEventType,this.resetHandle);
        }
    }
    //----------dom布局更改时调用----------
    clientRectChange(){

    }
    //----------重写forceUpdate----------
    forceUpdate(){
        this.setState({__force__:!this.state.__force__});
    }
    //----------
    //重写setState
    //updater (preState,nextProps)=>{return { }} or {};
    //callback 状态更新完成回调
    //----------
    setState(...args){
        if(this.alive){
            super.setState(...args);
        }
    }
    //----------属性改变时调用----------
    propsChanged(){
        if(this.props.onPropsChanged){
            this.props.onPropsChanged(this);
        }
    }
    //----------状态更改时调用----------
    stateChanged(){
        if(this.props.onStateChanged){
            this.props.onStateChanged(this);
        }
    }
    //----------------------------------------交互事件区----------------------------------------
    //----------停止冒泡的事件列表----------
    canStopPropagation(eventName){
        if(this.props.stopPropagationList==="all")
            return true;
        if(UIComponent.fns.TypesCheck.isArray(this.props.stopPropagationList)){
            return this.props.stopPropagationList.indexOf(eventName)!==-1;
        }
        return false;
    }
    //----------进入UI元素----------
    pointEnter(e){
        if(this.canStopPropagation("pointEnter")){
            e.stopPropagation();
        }
        if(this.onPointEnter){
            this.onPointEnter(e);
        }
    }
    //----------UI元素中移动----------
    pointMove(e){
        if(this.canStopPropagation("pointMove")){
            e.stopPropagation();
        }
        if(this.onPointMove){
            this.onPointMove(e);
        }
    }
    //----------移出UI元素----------
    pointOut(e){
        if(this.canStopPropagation("pointOut")){
            e.stopPropagation();
        }
        if(this.onPointOut){
            this.onPointOut(e);
        }
    }
    //----------UI元素内按下----------
    pointDown(e){
        if(this.canStopPropagation("pointDown")){
            e.stopPropagation();
        }
        if(this.onPointDown){
            this.onPointDown(e);
        }
    }
    //----------UI元素内抬起----------
    pointUp(e){
        if(this.canStopPropagation("pointUp")){
            e.stopPropagation();
        }
        if(this.onPointUp){
            this.onPointUp(e);
        }
    }
    //----------UI元素内点击----------
    pointClick(e){
        if(this.canStopPropagation("pointClick")){
            e.stopPropagation();
        }
        if(this.onPointClick){
            this.onPointClick(e);
        }
    }
    //----------UI元素内双击----------
    pointDoubleClick(e){
        if(this.canStopPropagation("pointDoubleClick")){
            e.stopPropagation();
        }
        if(this.onPointDoubleClick){
            this.onPointDoubleClick(e);
        }
    }
}