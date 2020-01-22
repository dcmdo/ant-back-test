import React from 'react';
import UIComponent from '../ui-component';
import CoolMath from 'CoolMath';
import ClassNames from 'classnames';
import './default-style/num-input.scss';

/**
 * placeholder {String}
 * num {Number} 0
 * min {Number} 0
 * max {Number} 1
 * numType {String} int || float
 * floatPrecision {Number} 2
 * onValueChange {Function} (tagName,value,isManual,component)=>{}
 */
// let numRegs = /^[0-9]+\.{0,1}[0-9]{0,2}/g;
export default class NumInput extends UIComponent{
    get className(){
        let className = super.className;
        return className?className:"default-num-input";
    }
    get isRegisterEvent(){
        return UIComponent.fns.TypesCheck.isBoolean(this.props.isRegisterEvent)?this.props.isRegisterEvent:false;
    }
    get controlledProps(){
        return [...super.controlledProps,...["placeholder","num","min","max"]];
    }
    awake(){
        super.awake();
        this.initRegs();
    }

    //-------------------------------------------------内部属性方法-------------------------------------------------
    declareVars(){
        super.declareVars();
        this._filterRegs = null;
        this._regs = null;
        this._isManual = false;
        this._oldNum = null;
    }
    get numType(){
        return this.props.numType==="float"?"float":"int";
    }
    get floatPrecision(){
        if(this.numType==="float"){
            if(UIComponent.fns.TypesCheck.isNumber(this.props.floatPrecision)){
                if(this.props.floatPrecision>0)
                    return this.props.floatPrecision;
            }
            return 2;
        }
        return 0;
    }
    check(num){
        let checkNum = (num+"").replace(this._filterRegs,"");
        return checkNum;
    }
    get filter(){
        let num = this.num+"";
        num = num.match(this._regs);
        if(num!==null){
            num = num[0];
        }else{
            num = "";
        }
        num = parseFloat(num);
        if(UIComponent.fns.TypesCheck.isNaN(num)){
            num = "";
        }else if(num<this.min){
            num = this.min;
        }else if(num>this.max){
            num = this.max;
        }
        return num===""?this.min:num;
    }
    initRegs(){
        if(this.numType==="int"){
            if(this.min<0){
                this._filterRegs = /[^\-\d]/g;
                this._regs = /^\-?\d+/;
            }else{
                this._filterRegs = /[^\d]/g;
                this._regs = /\d+/;
            }
        }else{
            if(this.min<0){
                this._filterRegs = /[^\-\.\d]/g;
                this._regs = RegExp("^\-?[0-9]*(\.)?([0-9]{0,"+this.floatPrecision+"}"+")","g");
            }else{
                this._filterRegs = /[^\.\d]/g;
                this._regs = RegExp("^[0-9]*(\.)?([0-9]{0,"+this.floatPrecision+"}"+")","g");
            }
        }
    }

    //-------------------------------------------------对外属性方法-------------------------------------------------
    get placeholder(){
        return this.state.placeholder;
    }
    set placeholder(placeholder){
        this.setState({placeholder:placeholder});
    }
    get num(){
        return this.state.num;
    }
    set num(num){
        this.setState({num:num});
    }
    get min(){
        return UIComponent.fns.TypesCheck.isNumber(this.state.min)?this.state.min:0;
    }
    set min(min){
        this.setState({min:min});
    }
    get max(){
        let min = this.min;
        let max = UIComponent.fns.TypesCheck.isNumber(this.state.max)?this.state.max:min+1;
        if(max<min){
            max = min+1;
        }
        return max;
    }
    set max(max){
        this.setState({max:max});
    }
    focus(){
        this.refs.parent.focus();
    }

    //-------------------------------------------------组件内部结构-------------------------------------------------
    render(){
        if(!this.isRender){
            return null;
        }
        return(
            <input ref='parent' id={this.id} className={ClassNames(this.getClassName())} style={this.style}
                   type="text" placeholder={this.placeholder} value={this.check(this.num)}
                   onChange={(e)=>{
                       this._isManual = true;
                       this.num = e.target.value;
                   }}
                   onBlur={()=>{
                       this._isManual = true;
                       this.num = this.filter;
                   }}
            />
        );
    }

    domMount() {
        super.domMount();
        this.num = this.filter;
    }

    domDidChange(){
        super.domDidChange();
        let filterNum = this.filter;
        if(filterNum !== this._oldNum){
            this._oldNum = filterNum;
            if(this.props.onValueChange){
                this.props.onValueChange(this.tagName,filterNum,this._isManual,this);
            }
        }
        this._isManual = false;
    }
}