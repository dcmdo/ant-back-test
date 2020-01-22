import React from 'react';
import UIComponent from 'UIComponent';
import CoolMath from 'CoolMath';
import './default-style/step.scss';

/**
 * textAnchor {String} left || right || top || bottom
 * stepWeight {Number} 1
 * textWeight {Number} 1
 * steps {[String]} 步骤文字
 * currentStep {Number} 1
 */
export default class Step extends UIComponent{
    get className(){
        let className = super.className;
        return className?className:"default-step";
    }
    get isRegisterEvent(){
        return UIComponent.fns.TypesCheck.isBoolean(this.props.isRegisterEvent) ? this.props.isRegisterEvent : false;
    }
    get clientRectChangeEventType(){
        return {resize:true};
    }
    clientRectChange(){
        this.forceUpdate();
    }
    get style(){
        return {...super.style, position:'relative'};
    }
    get controlledProps(){
        return [...super.controlledProps,...["steps","currentStep"]];
    }

    //-------------------------------------------------内部属性及方法-------------------------------------------------
    get isHorizontal(){
        if(!this.clientRect)
            return true;
        return this.clientRect.width >= this.clientRect.height;
    }
    get textAnchor(){
        if(this.isHorizontal)
            return this.props.textAnchor === "bottom"?"bottom":"top";
        else
            return this.props.textAnchor === "right"?"right":"left";
    }
    get stepWeight(){
        let stepWeight = this.props.stepWeight;
        if(!UIComponent.fns.TypesCheck.isNumber(stepWeight)) {
            stepWeight = 1;
        }else{
            if(stepWeight<0)
                stepWeight = 1;
        }
        return stepWeight;
    }
    get textWeight(){
        let textWeight = this.props.textWeight;
        if(!UIComponent.fns.TypesCheck.isNumber(textWeight)) {
            textWeight = 1;
        }else{
            if(textWeight<0)
                textWeight = 1;
        }
        return textWeight;
    }
    get stepRatio(){
        let stepWeight = this.stepWeight;
        let textWeight = this.textWeight;
        return stepWeight/(stepWeight+textWeight);
    }
    get textRadio(){
        let stepWeight = this.stepWeight;
        let textWeight = this.textWeight;
        return textWeight/(stepWeight+textWeight);
    }
    get stepCount(){
        return this.steps.length;
    }
    get width(){
        if(!this.clientRect)
            return 0;
        return this.clientRect.width;
    }
    get height(){
        if(!this.clientRect)
            return 0;
        return this.clientRect.height;
    }

    //-------------------------------------------------对外属性-------------------------------------------------
    get steps(){
        this.state.steps = UIComponent.fns.TypesCheck.isArray(this.state.steps)?this.state.steps:["step1","step2","step3","step4","step5"];
        return this.state.steps;
    }
    set steps(steps){
        this.setState({steps:steps});
    }
    get currentStep(){
        let step = UIComponent.fns.TypesCheck.isNumber(this.state.currentStep)?this.state.currentStep:0;
        this.state.currentStep = CoolMath.clamp(0,this.stepCount-1,step);
        return this.state.currentStep;
    }
    set currentStep(currentStep){
        this.setState({currentStep:currentStep});
    }

    //-------------------------------------------------组件结构-------------------------------------------------
    getChildren(){
        let width = this.width;
        let height = this.height;
        let stepRatio = this.stepRatio;
        let textRatio = this.textRadio;
        let stepSize;
        let textSize;
        let nodeRadio;
        let textSegmentLength;
        let backgroundStyle;
        let foregroundStyle;
        let stepsContainerStyle;
        let textContainerStyle;
        if(this.isHorizontal){
            stepSize = height*stepRatio;
            textSize = height*textRatio;
            nodeRadio = stepSize*0.5;
            textSegmentLength = (this.width - stepSize)/(this.stepCount-1);
            backgroundStyle = {
                position:'absolute',
                left:nodeRadio,
                right:nodeRadio,
                height:nodeRadio,
            };
            foregroundStyle = {
                position:'absolute',
                height:'100%'
            };
            foregroundStyle.width = this.currentStep/(this.stepCount-1)*100+"%";
            stepsContainerStyle = {
                position:'absolute',
                left:0,
                width:width,
                height:stepSize,
                fontSize:stepSize*0.8
            };
            textContainerStyle = {
                position:'absolute',
                left:stepSize*0.5,
                right:stepSize*0.5,
                height:textSize,
                fontSize:textSize*0.8
            };
            if(this.textAnchor === "top"){
                backgroundStyle.bottom = "12.5%";
                stepsContainerStyle.bottom = 0;
                textContainerStyle.top = 0;
            }else{
                backgroundStyle.top = "12.5%";
                stepsContainerStyle.top = 0;
                textContainerStyle.bottom = 0;
            }
        }else{
            stepSize = width*stepRatio;
            textSize = width*textRatio;
            nodeRadio = stepSize*0.5;
            textSegmentLength = (this.height - stepSize)/(this.stepCount-1);
            backgroundStyle = {
                position:'absolute',
                top:nodeRadio,
                bottom:nodeRadio,
                width:nodeRadio,
            };
            foregroundStyle = {
                position:'absolute',
                width:'100%'
            };
            foregroundStyle.height = this.currentStep/(this.stepCount-1)*100+"%";
            stepsContainerStyle = {
                position:'absolute',
                top:0,
                height:height,
                width:stepSize,
                fontSize:stepSize*0.8
            };
            textContainerStyle = {
                position:'absolute',
                top:0,
                bottom:0,
                width:textSize,
                fontSize:textSize*0.8
            };
            if(this.textAnchor === "left"){
                backgroundStyle.right = "12.5%";
                stepsContainerStyle.right = "0%";
                textContainerStyle.left = "0%";
            }else{
                backgroundStyle.left = "12.5%";
                stepsContainerStyle.left = "0%";
                textContainerStyle.right = "0%";
            }
        }
        let nodes = [];
        let texts = [];
        let steps = this.steps;
        let nodeStyle = {};
        nodeRadio = nodeRadio*2;
        nodeStyle = {
            position:'absolute',
            height:nodeRadio,
            width:nodeRadio,
            lineHeight:nodeRadio+"px",
            textAlign:'center',
            borderRadius:'50%',
        };
        steps.forEach((item,index)=>{
            let style = UIComponent.fns.ObjectFns.clone(nodeStyle);
            if(this.isHorizontal){
                style.left = (width-nodeRadio)*(index/(this.stepCount-1));
            }else{
                style.top = (height-nodeRadio)*(index/(this.stepCount-1));
            }
            nodes.push(<div key={"node-"+index} className={index<=this.currentStep?"step-node step-node-current":"step-node"} style={style}>{index+1}</div>);
            texts.push(
                <text key={"text-"+index} className={index<=this.currentStep?"step-text step-text-current":"step-text"}
                      y={this.isHorizontal?textSize*0.75:textSegmentLength*index+textSize*0.75}
                      x={this.isHorizontal ? textSegmentLength * index :
                          this.textAnchor === "left" ? textSize : 0
                      }
                      style={this.isHorizontal?{textAnchor:"middle"}:
                          this.textAnchor==="left"?{textAnchor:"end"}:{textAnchor:"start"}}
                >{item}</text>
            );
        });
        let children = [
            <div className="step-background" style={backgroundStyle} key="background"><div className="step-foreground" style={foregroundStyle}/></div>,
            <div className="step-container" style={stepsContainerStyle} key="step-container">
                {nodes}
            </div>,
            <div key="texts-container" className="step-text-container" style={textContainerStyle}>
                <svg className="svg-container">
                    {texts}
                </svg>
            </div>
        ];
        return children;
    }
}
