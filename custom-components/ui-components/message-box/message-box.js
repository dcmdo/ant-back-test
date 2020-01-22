import React from 'react';
import UIComponent from 'UIComponent';
import ClassNames from 'classnames';
import ModalWindow from 'ModalWindow';
import Button from 'Button';
import './default-style/message-box-style.scss';

export default class MessageBox extends UIComponent{
    get className(){
        let className = super.className;
        return className?className:"default-message-box";
    }
    get isRegisterEvent() {
        return false;
    }

    //----------------------------------------内部属性及方法----------------------------------------
    declareVars(){
        super.declareVars();
        this._okHandle = null;
        this._cancelHandle = null;
        this._message = null;
        this._messageType = null;
        this._modalWindow = null;
        this._isShow = false;
    }
    //----------------------------------------对外属性及方法----------------------------------------
    openMessage(message, messageType, okHandle = null, cancelHandle = null){
        this._message = message;
        this._messageType = messageType;
        if(okHandle){
            this._okHandle = ()=>{
                okHandle();
                this._isShow = false;
                this.forceUpdate();
            }
        }
        if(cancelHandle){
            this._cancelHandle = ()=>{
                cancelHandle();
                this._isShow = false;
                this.forceUpdate();
            }
        }
        this._isShow = true;
        this.forceUpdate();
    }

    closeMessage(){
        this._okHandle = null;
        this._cancelHandle = null;
        this._isShow = false;
        this.forceUpdate();
    }

    //-------------------------------------------------组件结构-------------------------------------------------
    get showTipClass(){
        if(this._messageType==="yes"){
            return "message-icon message-icon-yes cool-icon-31";
        }else if(this._messageType==="no"){
            return "message-icon message-icon-no cool-icon-30";
        }else{
            return "message-icon message-icon-tip cool-icon-25";
        }
    }
    render(){
        return UIComponent.fns.constElement(this,"_modal_window",false,
            ()=>{
                return <ModalWindow
                    isShow={this._isShow}
                >
                        <div ref="parent" className={ClassNames(this.getClassName())} style={this.style}>
                            <div className={this.showTipClass}>
                            </div>
                            <div className="message-container">
                                {this._message}
                            </div>
                            <div className="message-button-container">
                                {this._okHandle?<Button
                                    style={{float:this.firstFloat}}
                                    onClick={this._okHandle}>
                                    确定
                                </Button>:""}
                                {this._cancelHandle?<Button
                                    style={{float:this.secondFloat}}
                                    onClick={this._cancelHandle}>
                                    取消
                                </Button>:""}
                            </div>
                        </div>
                </ModalWindow>;
            }
        )
    }
}