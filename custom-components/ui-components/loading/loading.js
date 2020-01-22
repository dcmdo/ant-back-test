import React from 'react';
import UIComponent from 'UIComponent';
import Image from 'Image';
import loadImg from './default-style/load.gif';
import './default-style/loading.scss';

/**
 * message {String} 加载信息
 * backgroundSrc {String} 加载的背景图片地址
 * loadingSrc {String} 加载图片的地址
 */
export default class Loading extends Image {
    get className() {
        let className = super.className;
        return className!=="default-image"?className:"loading";
    }
    get isRegisterEvent() {
        return false;
    }
    get controlledProps() {
        return [...super.controlledProps, ...["message"]];
    }
    //----------------------------------------内部属性----------------------------------------
    get loadingSrc(){
        return this.props.loadingSrc?this.props.loadingSrc:loadImg;
    }
    get src(){
        return this.props.backgroundSrc;
    }
    //----------------------------------------对外属性----------------------------------------
    get message() {
        return this.state.message;
    }
    set message(message) {
        this.setState({message: message});
    }
    //----------------------------------------组件内部结构----------------------------------------
    getChildren(){
        return UIComponent.fns.constElement(this,"_loading",this.statesHasChanged("message"),()=>{
            return (
                <div className={"loading-container"}>
                    <Image className={"loading-image"} src={this.loadingSrc}/>
                    {this.message?<span>{this.message}</span>:null}
                </div>
            );
        });
    }
}

