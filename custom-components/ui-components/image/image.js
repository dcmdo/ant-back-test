import React from 'react';
import UIComponent from 'UIComponent';
import './default-style/image.scss';
//@src:
//@onClick
export default class Image extends UIComponent{
    get className(){
        let className = super.className;
        return className?className:"default-image";
    }
    set className(className){
        super.className = className;
    }
    get style(){
        return {...super.style, backgroundImage:this.src ? 'url('+this.src+')' : ""};
    }
    set style(style){
        super.style = style;
    }
    get controlledProps(){
        return [...super.controlledProps,...["src"]];
    }
    //-------------------------------------------------外部属性方法-------------------------------------------------
    get src(){
        return this.state.src;
    }
    set src(src){
        this.setState({src:src});
    }
    //-------------------------------------------------组件内部结构-------------------------------------------------
    pointClick(e){
        super.pointClick(e);
        e.stopPropagation();
        if(this.props.onClick){
            this.props.onClick(this.tagName);
        }
    }
}
