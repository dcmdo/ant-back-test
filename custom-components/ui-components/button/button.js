import React from 'react';
import UIComponent from 'UIComponent';
import './default-style/button.scss';

/**
 * 按钮
 * onClick {Function} (tagName, component)=>{}
 */
export default class Button extends UIComponent{
    get className(){
        let className = super.className;
        return className?className:"default-button";
    }

    //----------------------------------------内部属性变量----------------------------------------
    declareVars(){
        super.declareVars();
        this.onClick = null;
    }
    //----------------------------------------事件----------------------------------------
    pointClick(e){
        super.pointClick(e);
        e.stopPropagation();
        if(this.props.onClick){
            this.props.onClick(this.tagName, this);
        }
        if(this.onClick){
            this.onClick(this.tagName, this);
        }
    }
}