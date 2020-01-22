import React from 'react';
import UIComponent from '../ui-component';
import NumInput from 'NumInput';
import Button from 'Button';
import './default-style/num-select.scss';

/**
 * num {Number} 0
 * min {Number} 0
 * max {Number} 1
 * step {Number} 1
 * numType {String} int || float
 * floatPrecision {Number} 2
 * onValueChange {Function} (tagName,value,isManual)=>{}
 */
export default class NumSelect extends UIComponent{
    get className(){
        let className = super.className;
        return className?className:"default-num-select";
    }
    get isRegisterEvent(){
        return UIComponent.fns.TypesCheck.isBoolean(this.props.isRegisterEvent)?this.props.isRegisterEvent:false;
    }
    get controlledProps(){
        return [...super.controlledProps,...["placeholder","num","min","max","step"]];
    }

    //-------------------------------------------------内部属性及方法-------------------------------------------------
    declareVars(){
        super.declareVars();
        this._isManual = false;
    }
    plus(){
        let num = this.num + this.step;
        if(num>this.max)
            num = this.max;
        this.num = num;
    }
    minus(){
        let num = this.num - this.step;
        if(num<this.min)
            num = this.min;
        this.num = num;
    }
    //-------------------------------------------------对外属性及方法-------------------------------------------------
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
    get step(){
        return UIComponent.fns.TypesCheck.isNumber(this.state.step)?this.state.step:1;
    }
    set step(step){
        this.setState({step:step});
    }
    focus(){
        this.refs.input.focus();
    }
    //-------------------------------------------------组件结构-------------------------------------------------
    getChildren(){
        return [
            UIComponent.fns.constElement(this,"_num_input",this.statesHasChanged("num"),()=>{
                return (
                    <NumInput key="input" className="num-input" ref="input" num={this.num} min={this.min} max={this.max}
                              numType={this.props.numType}
                              floatPrecision={this.props.floatPrecision}
                              onValueChange={
                                  UIComponent.fns.constObject(this,"_value_change",
                                      (tagName,value,isManual)=>{
                                          this.state.num = value;
                                          if(this.props.onValueChange){
                                              this.props.onValueChange(this.props.tagName,this.num,this._isManual||isManual,this);
                                          }
                                          this._isManual = false;
                                      }
                                  )
                              }
                    />
                )
            }),
            UIComponent.fns.constElement(this,"_select_container",false,()=>{
                return(
                    <div key="select" className="select-container">
                        <Button className="select-button"
                                onClick={UIComponent.fns.constObject(this,"_up_click",
                                    ()=>{
                                        this._isManual = true;
                                        this.plus();
                                    }
                                )}
                        ><i className="cool-icon-1"/></Button>
                        <Button className="select-button"
                                onClick={UIComponent.fns.constObject(this,"_down_click",()=>{
                                    this._isManual = true;
                                    this.minus();
                                })}
                        ><i className="cool-icon-2"/></Button>
                    </div>
                )})
        ];
    }
}