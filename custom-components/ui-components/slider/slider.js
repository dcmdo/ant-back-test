import React from 'react';
import UIComponent from 'UIComponent';
import CoolMath from 'CoolMath';
import './default-style/slider.scss';

/**
 * minValue {Number} 0
 * maxValue {Number} 1
 * sliderValue {Number} 0
 * steps {Number} 0
 * onDragStart {Function} (tagName)=>{}
 * onDragEnd {Function} (tagName)=>{}
 * onValueChange {Function} (tagName,sliderValue,step,isManual,component)=>{}
 */
export default class Slider extends UIComponent{
    get className(){
        let className = super.className;
        return className?className:"default-slider";
    }
    get controlledProps(){
        return [...super.controlledProps,...["sliderValue","minValue","maxValue","steps"]];
    }

    //-------------------------------------------------内部属性及方法-------------------------------------------------
    declareVars(){
        super.declareVars();

        this._isManual = false;
        this._stepIndex = null;
        this._dragEvent = null;
        this._oldStepIndex = null;
        this._oldSliderValue = null;
        //定义拖动函数
        this._dragThrottle = UIComponent.fns.throttle((e)=>{
            this._isManual = true;
            let clientX,clientY;
            if(e.isMouse){
                clientX = e.clientX;
                clientY = e.clientY;
            }else if(e.isTouch){
                clientX = e.touches[0].clientX;
                clientY = e.touches[0].clientY;
            }
            let pointPos = UIComponent.fns.getPointPosByReactElementPercentage(this.refs.parent,{x:clientX,y:clientY});
            this.sliderValue = CoolMath.lerp(this.minValue,this.maxValue,pointPos.x);
        },50,{leading:false});
    }

    get isStep(){
        return UIComponent.fns.TypesCheck.isNumber(this.steps)&&this.steps>0;
    }
    //计算step区间值
    get stepSegmentValue(){
        let stepSize = (this.maxValue - this.minValue)/this.steps;
        this._stepIndex = CoolMath.clamp(0,this.steps,Math.round(((this.sliderValue - this.minValue)/stepSize).toFixed(1)));
        return this._stepIndex*stepSize+this.minValue;
    }
    get cssBySliderValue(){
        if(this.isStep){
            this.state.sliderValue = this.stepSegmentValue;
        }
        return CoolMath.inverseLerp(this.minValue,this.maxValue,this.sliderValue)*100+"%";
    }
    valueChange(){
        if(this.isStep){
            if(this._oldStepIndex !== this._stepIndex){
                this._oldStepIndex = this._stepIndex;
                if(this.props.onValueChange){
                    this.props.onValueChange(this.tagName,this.sliderValue,this._stepIndex,this._isManual,this);
                }
            }
        }else{
            if(this._oldSliderValue !== this.sliderValue){
                this._oldSliderValue = this.sliderValue;
                if(this.props.onValueChange){
                    this.props.onValueChange(this.tagName,this.sliderValue,0,this._isManual,this);
                }
            }
        }
        this._isManual = false;
    }
    //-------------------------------------------------对外属性及方法-------------------------------------------------
    get sliderValue(){
        return UIComponent.fns.TypesCheck.isNumber(this.state.sliderValue)?this.state.sliderValue:this.minValue;
    }
    set sliderValue(sliderValue){
        this.setState({sliderValue:sliderValue});
    }
    get minValue(){
        return UIComponent.fns.TypesCheck.isNumber(this.state.minValue)?this.state.minValue:0;
    }
    set minValue(minValue){
        this.setState({minValue:minValue});
    }
    get maxValue(){
        return UIComponent.fns.TypesCheck.isNumber(this.state.maxValue)?this.state.maxValue:this.minValue + 1;
    }
    set maxValue(maxValue){
        this.setState({maxValue:maxValue});
    }
    get steps(){
        return this.state.steps;
    }
    set steps(steps){
        this.setState({steps:steps});
    }
    //-------------------------------------------------组件结构及生命周期-------------------------------------------------
    //初始化子元素
    getChildren(){
        return  UIComponent.fns.constElement(this,"_front",this.statesHasChanged("sliderValue","minValue","maxValue","steps"),
            ()=>{
                return (
                    <div key="front" className="slider-front" style={{width:this.cssBySliderValue}}>
                        <div className="slider-tag"/>
                    </div>
                );
            }
        )
    }
    domMount(){
        super.domMount();
        this._dragEvent = UIComponent.fns.DOMCrossPlatformEvent.createEvent(window);
        this._dragEvent.addEventListener("pointMove",this._dragThrottle);
        this._dragEvent.addEventListener("pointUp",()=>{
            this._dragEvent.end();
            if(this.props.onDragEnd){
                this.props.onDragEnd(this.tagName);
            }
        });
    }
    domUnmount(){
        super.domUnmount();
        this._dragEvent.dispose();
        this._dragEvent = null;
    }
    domDidChange(){
        super.domDidChange();
        this.valueChange();
    }
    pointDown(e){
        super.pointDown(e);
        e.stopPropagation();
        this._dragThrottle(e);
        this._dragEvent.start();
        if(this.props.onDragStart){
            this.props.onDragStart(this.tagName);
        }
    }
}
