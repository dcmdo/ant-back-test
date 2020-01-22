import React from 'react';
import UIComponent from '../ui-component';
import ClassNames from 'classnames';
import './default-style/text-field.scss';

//@常用正则表达式：
//@字母数字下划线（用户名密码校验）：/^[a-zA-Z0-9_]+$/
//@邮箱校验：/^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/
//@手机号校验：/^1\d{10}$/
//@固定电话校验：/^0\d{2,3}-?\d{7,8}$/
//@六位验证码校验：/^[0-9]{6}$/
/**
 * type {String} text || password
 * placeholder {String}
 * text {String}
 * check {Object} {length:{min:1,max:20},checkRegs:[{reg:,tip:""}]}
 * onInputChange {Function} (tagName,text,isOK,info,isManual,component)=>{} // 过时请使用 onValueChange替代
 * onValueChange {Function} (tagName,text,isOK,info,isManual,component)=>{}
 * onFocus {Function} ()=>{}
 * onBlur {Function} ()=>{}
 */
export default class TextField extends UIComponent{
    get isRegisterEvent(){
        return UIComponent.fns.TypesCheck.isBoolean(this.props.isRegisterEvent)?this.props.isRegisterEvent:false;
    }
    get className(){
        let className = super.className;
        return className?className:"default-text-field";
    }
    get controlledProps(){
        return [...super.controlledProps,...["type","placeholder","text"]];
    }

    //-------------------------------------------------对外属性方法-------------------------------------------------
    declareVars(){
        super.declareVars();
        this._isOK = null;
        this._tipInfo = null;
        this._isManual = false;
        this._oldText = null;
    }
    get type(){
        return this.state.type===undefined?"text":this.state.type;
    }
    set type(type){
        return this.setState({type:type});
    }
    get placeholder(){
        return this.state.placeholder===undefined?"请在此输入":this.state.placeholder;
    }
    set placeholder(placeholder){
        this.setState({placeholder:placeholder});
    }
    get text(){
        return this.check(this.state.text);
    }
    set text(text){
        this.setState({text:text});
    }
    focus(){
        this.refs.parent.focus();
    }

    //-------------------------------------------------内部方法及属性-------------------------------------------------
    check(string){
        if(UIComponent.fns.TypesCheck.isEmpty(string))
            string = "";
        this._isOK = true;
        this._tipInfo = "";
        if(!UIComponent.fns.TypesCheck.isUndefined(this.props.check)){
            if(!UIComponent.fns.TypesCheck.isUndefined(this.props.check.length)){
                let length = string.length;
                let lengthCheckValue = this.props.check.length;
                if(length<lengthCheckValue.min){
                    this._isOK = false;
                    this._tipInfo = "字符数不能少于"+lengthCheckValue.min+"个";
                }else if(length>lengthCheckValue.max){
                    this._tipInfo = "字符数已达到上限"+lengthCheckValue.max+"个";
                    string = string.slice(0,lengthCheckValue.max);
                }
            }
            if(!UIComponent.fns.TypesCheck.isUndefined(this.props.check.checkRegs)){
                let checkRegs = this.props.check.checkRegs;
                for(let k in checkRegs){
                    if(!checkRegs[k].reg.test(string)){
                        this._isOK = false;
                        this._tipInfo = checkRegs[k].tip;
                        break;
                    }
                }
            }
        }
        return string;
    }
    valueChangeHandle(e){
        this._isManual = true;
        this.text = e.target.value;
    }

    //-------------------------------------------------组件结构-------------------------------------------------
    render(){
        if(!this.isRender){
            return null;
        }
        return <input ref='parent' id={this.id} className={ClassNames(this.getClassName())} style={this.style}
                      onWheel={this.props.onWheel?(e)=>{
                          this.props.onWheel(this.tagName,e);
                      }:undefined}
                      onKeyDown={this.props.onKeyDown?(e)=>{
                          this.props.onKeyDown(this.tagName,e);
                      }:undefined}
                      onKeyUp={this.props.onKeyUp?(e)=>{
                          this.props.onKeyUp(this.tagName,e);
                      }:undefined}
                      onFocus={()=>{
                          if(this.props.onFocus){
                              this.props.onFocus();
                          }
                      }}
                      onBlur={()=>{
                          if(this.props.onBlur){
                              this.props.onBlur();
                          }
                      }}
                      type={this.type} placeholder={this.placeholder} value={this.text}
                      onChange={(e)=>{
                          this.valueChangeHandle(e);
                      }}/>;
    }
    domDidChange(){
        super.domDidChange();
        if(this._oldText !== this.text){
            this._oldText = this.text;
            if(this.props.onValueChange){
                this.props.onValueChange(this.tagName,this.text,this._isOK,this._tipInfo,this._isManual,this);
            }else if(this.props.onInputChange){
                this.props.onInputChange(this.tagName,this.text,this._isOK,this._tipInfo,this._isManual,this);
                console.warn("onInputChange为过期属性，请采用onValueChange代替！");
            }
        }
        this._isManual =false;
    }
}
