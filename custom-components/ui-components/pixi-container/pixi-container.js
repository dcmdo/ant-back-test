import React from 'react';
import UIComponent from 'UIComponent';
import './default-style/pixi-container.scss';
import * as PIXI from 'pixi.js';

export default class PixiContainer extends UIComponent{
    get className(){
        let className = super.className;
        return className?className:"default-pixi-container";
    }
    get isRegisterEvent(){
        return this.props.isRegisterEvent===true?true:false;
    }
    //-------------------------------------------------对外属性及方法-------------------------------------------------
    get application(){
        this._application = this._application?this._application:new PIXI.Application({
            width:this.clientRect.width,
            height:this.clientRect.height,
            antialias:true,
            transparent:true,
            resolution:1
        });
        return this._application;
    }
    get renderer(){
        return this.application.renderer;
    }
    get view(){
        return this.application.view;
    }
    get stage(){
        return this.application.stage;
    }
    get screen(){
        return this.application.screen;
    }
    //-------------------------------------------------内部方法-------------------------------------------------
    init(){
        this.renderer.autoResize = true;
        this.refs.parent.appendChild(this.view);
    }
    //……………………尺寸更改触发，可重写…………………………………………
    resize(size){
        
    }
    //……………………创建父容器…………………………………………
    //@anchor[x,y] 0-1;
    createParentContainer(key,anchor){
        this._parent_container = this._parent_container?this._parent_container:{};
        this._parent_container[key] = new PIXI.Container();
        let centerPoint = new PIXI.Point(this.clientRect.width*anchor[0],this.clientRect.height*anchor[1]);
        this._parent_container[key].position = centerPoint;
        this._parent_container[key]._anchor = anchor;
        this.stage.addChild(this._parent_container[key]);
        return this._parent_container[key];
    }
    //-------------------------------------------------组件内部结构-------------------------------------------------
    get clientRectChangeEventType(){
        return {resize:true};
    }
    clientRectChange(){
        super.clientRectChange();
        this.size = {left:this.clientRect.left,top:this.clientRect.top,width:this.clientRect.width,height:this.clientRect.height};
        try{
            this.renderer.resize(this.size.width, this.size.height);
            this.resize(this.size);
            for(let k in this._parent_container){
                let parent = this._parent_container[k];
                let anchor = parent._anchor;
                let centerPoint = new PIXI.Point(this.clientRect.width*anchor[0],this.clientRect.height*anchor[1]);
                parent.position = centerPoint;
            }
        }catch (ex){}
    }
    domMount(){
        super.domMount();
        this.init();
    }
}
