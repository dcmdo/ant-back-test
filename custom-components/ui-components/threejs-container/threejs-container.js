import React from 'react';
import UIComponent from 'UIComponent';
import './default-style/threejs-container.scss';
import Loading from 'Loading';
import * as THREE from 'three';
import GLTFLoader from 'three-gltf-loader';

//----------------------------------------给THREE.js添加属性及方法----------------------------------------
THREE.GLTFLoader = GLTFLoader;
const ThreeLoaderContainer = [];
THREE.startLoad = (message)=>{
    ThreeLoaderContainer.forEach((container)=>{
       container.startLoad(message);
    });
};
THREE.loading = (message,progress)=>{
    ThreeLoaderContainer.forEach((container)=>{
        container.loading(message,progress);
    });
};
THREE.loadError = (message)=>{
    ThreeLoaderContainer.forEach((container)=>{
        container.loadError(message);
    });
};
THREE.loaded = ()=>{
    ThreeLoaderContainer.forEach((container)=>{
        container.loaded();
    });
};

/**
 * initParas {Object} THREE.js renderer 初始化参数
 */
export default class ThreeJsContainer extends UIComponent{
    get className(){
        let className = super.className;
        return className?className:"default-three-container";
    }
    get isRegisterEvent(){
        return this.props.isRegisterEvent===true?true:false;
    }
    get clientRectChangeEventType(){
        return {resize:true};
    }
    awake(){
        super.awake();
        ThreeLoaderContainer.push(this);
    }

    //----------------------------------------内部属性方法----------------------------------------
    declareVars(){
        super.declareVars();
        //----------公有----------
        this.renderer = null;
        this.crossEvent = null;
        this.size = null;
        //----------私有----------
        this._loadingComponent = null;
    }

    //初始化入口
    init(){
        this.renderer = new THREE.WebGLRenderer(this.initParas);
        this.renderer.autoClear = false;
        this.renderer.localClippingEnabled = true;
        this.renderer.setClearColor("black");
        this.renderer.setPixelRatio(this.devicePixelRatio);
        this.renderer.setSize(this.size.width,this.size.height);
        this.refs.canvas_container.appendChild(this.renderer.domElement);
        this.resize(this.size);
    }
    get initParas(){
        return this.props.initParas || {
            antialias:true, preserveDrawingBuffer:true
        }
    }
    //初始化ui
    get ui(){

    }
    get loadingUI(){
        return (
            <Loading callbackComponent={(component)=>{
                this._loadingComponent = component;
            }} isRender = {false}/>
        );
    }
    //画布尺寸更改
    resize(size){

    }

    //----------------------------------------对外属性方法----------------------------------------
    //加载
    startLoad(message){
        try {
            this._loadingComponent.isRender = true;
            this._loadingComponent.message = message?message:"开始加载资源…";
        }catch (ex){}
    }
    loading(message,progress){
        try {
            let _message = message || "正在加载资源";
            if(progress!==undefined){
                _message += progress+"%";
            }else if(!message){
                _message += "…";
            }
            this._loadingComponent.isRender = true;
            this._loadingComponent.message = _message;
        }catch (ex){}
    }
    loadError(message){
        try {
            this._loadingComponent.isRender = true;
            this._loadingComponent.message = message?message:"资源加载错误！";
        }catch (ex){}
    }
    loaded(){
        try {
            this._loadingComponent.message = "初始化场景…";
            setTimeout(()=>{
                this._loadingComponent.isRender = false;
            },1000)
        }catch (ex){}
    }
    //devicePixelRatio
    get devicePixelRatio(){
        return Math.min(window.devicePixelRatio,2);
    }
    //----------------------------------------组件结构----------------------------------------
    getChildren(){
        return <React.Fragment>
            <div className="canvas-container" ref="canvas_container"/>
            <div ref="event_area" style={{position:"absolute",left:"0px",top:"0px",width:"100%",height:"100%"}}/>
            <div className="canvas-ui" style={{transform:"translateZ(1px)"}}>
                {this.ui}
                {this.loadingUI}
            </div>
            </React.Fragment>
    }
    domMount(){
        super.domMount();
        //初始化事件
        document.oncontextmenu = ()=>{
            return false;
        };
        this.crossEvent = UIComponent.fns.DOMCrossPlatformEvent.createEvent(this.refs.event_area);
        this.crossEvent.start();
        //触发初始化函数
        this.init();
    }
    domUnmount(){
        super.domUnmount();
        //释放事件
        this.crossEvent.dispose();
        this.crossEvent = null;
        //需要在下面实现资源释放
    }
    clientRectChange(){
        super.clientRectChange();
        this.size = {left:this.clientRect.left,top:this.clientRect.top,width:this.clientRect.width,height:this.clientRect.height};
        try{
            this.renderer.setPixelRatio(window.devicePixelRatio);
            this.renderer.setSize(this.size.width, this.size.height);
            this.resize(this.size);
        }catch (ex){}
    }
}
