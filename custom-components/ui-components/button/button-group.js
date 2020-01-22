import React from 'react';
import UIComponent from 'UIComponent';
import Button from 'Button';
import './default-style/button-group.scss';

// 子按钮初始化函数
const initChildren = (onClick,children)=>{
    let _children = [];
    React.Children.map(children, (child,index)=>{
        if(UIComponent.fns.isSpecificReactType(child,Button)){
            let Type = child.type;
            let props = {...child.props};
            props.key = "button-"+index;
            props.tagName = props.tagName===undefined?props.key:props.tagName;
            props.onClick = (tagName, component)=>{
                if(onClick){
                    onClick(tagName, component);
                }
            };
            _children.push(
                <Type {...props}/>
            );
        }else{
            _children.push(child);
        }
    });
    return _children;
};

//@onClick(tagName, component);
export default class ButtonGroup extends UIComponent{
    get className(){
        let className = super.className;
        return className?className:"default-button-group";
    }
    get isRegisterEvent(){
        return false;
    }
    
    //----------------------------------------组件结构及生命周期----------------------------------------
    getChildren(){
        return UIComponent.fns.constElement(this,"_children",this.statesHasChanged("children"),
            ()=>{
                return initChildren(this.props.onClick,this.children);
            });
    }
}