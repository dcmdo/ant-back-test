import React from 'react';
import UIComponent from 'UIComponent';
import './default-style/switch.scss';
import Animation from 'Animation';

/**
 * isOn {Boolean} false
 * styleType {String} circle || halfCircle
 * onChild {ReactElement} 打开时显示元素
 * offChild {ReactElement} 关闭时显示元素
 * onValueChange {Function} (tagName,isOn,isManual)=>{}
 */
export default class Switch extends UIComponent{
    get className(){
        let className = super.className;
        return className?className:"default-switch";
    }
    get trueClass(){
        return this.className+"-true";
    }
    getClassName(){
        let superClass = super.getClassName();
        if(this.trueClass){
            superClass[this.trueClass] = this.isOn;
        }
        return superClass;
    }
    //添加必要样式参数
    get style(){
        return {...super.style, overflow:'hidden',borderRadius:this.borderRadius};
    }
    //添加受控属性
    get controlledProps(){
        return [...super.controlledProps,...["isOn","styleType","onChild","offChild"]];
    }

    //-------------------------------------------------内部属性及方法-------------------------------------------------
    declareVars(){
        super.declareVars();

        this._isManual = false;
        // this._animInit = false;
        this._anim = null;
        this._oldValue = null;
        this._keepStyleInterval = null;
    }
    //计算borderRadio
    get borderRadius(){
        if(!this.clientRect){
            return "0rem";
        }
        if(this.styleType === "circle"){
            return UIComponent.fns.convertToRem(this.clientRect.height*0.5)+"rem";
        }else if(this.styleType === "halfCircle"){
            return UIComponent.fns.convertToRem(this.clientRect.height*0.25)+"rem";
        }else{
            return "0rem";
        }
    }
    //offset
    get offset(){
        if(!this.clientRect){
            return 0;
        }
        return UIComponent.fns.convertToRem(this.clientRect.width - this.clientRect.height)+"rem";
    }
    //tagStyle
    get tagStyle(){
        let style = {};
        if(!this.clientRect){
            return style;
        }
        style.position = 'absolute';
        if(this.props.styleType === "circle"){
            style.borderRadius = "50%";
            style.height = UIComponent.fns.convertToRem(this.clientRect.height*0.8)+"rem";
            style.width = style.height;
            style.left = UIComponent.fns.convertToRem(this.clientRect.height*0.1)+"rem";
            style.top = style.left;
        }else{
            style.height = UIComponent.fns.convertToRem(this.clientRect.height)+"rem";
            style.width = style.height;
            style.left = "0rem";
            style.top = "0rem";
        }
        return style;
    }
    //offContentStyle
    get offContentStyle(){
        let style = {};
        if(!this.clientRect){
            return style;
        }
        style.position = 'absolute';
        style.height = '100%';
        style.top = "0rem";
        style.right = "0rem";
        if(this.props.styleType === "circle"){
            style.right = UIComponent.fns.convertToRem(this.clientRect.height*0.25)+"rem";
            style.left =  UIComponent.fns.convertToRem(this.clientRect.height*0.9)+"rem";
        }else{
            style.right = "0rem";
            style.left = UIComponent.fns.convertToRem(this.clientRect.height)+"rem";
        }
        return style;
    }
    //onContentStyle
    get onContentStyle(){
        let style = {};
        if(!this.clientRect){
            return style;
        }
        style.position = 'absolute';
        style.height = '100%';
        if(this.props.styleType === "circle"){
            style.left = UIComponent.fns.convertToRem(this.clientRect.height*0.25)+"rem";
            style.right = UIComponent.fns.convertToRem(this.clientRect.height*0.9)+"rem";
        }else{
            style.left = "0rem";
            style.right = UIComponent.fns.convertToRem(this.clientRect.height)+"rem";
        }
        return style;
    }
    //设置动画
    setAnim(){
        let target = UIComponent.fns.getReactDOM(this.refs.switchElement);
        target.style.marginLeft = "0rem";
        let animOffset = UIComponent.fns.convertToRem(this.clientRect.width-this.clientRect.height)+"rem";
        this._anim = Animation.to(target,{
            marginLeft:animOffset
        },{
            duration:0.3
        });
        if(this.isOn){
            Animation.sample(this._anim,1);
        }else{
            Animation.sample(this._anim,0);
        }
        this.forceUpdate();
    }
    //-------------------------------------------------对外属性-------------------------------------------------
    get isOn(){
        return this.state.isOn?true:false;
    }
    set isOn(isOn){
        this.setState({isOn:isOn});
    }
    get styleType(){
        return this.state.styleType;
    }
    set styleType(style_type){
        this.setState({styleType:style_type});
    }
    get onChild(){
        return UIComponent.fns.constElement(this,"_on_child", this.statesHasChanged("onChild"),
            ()=>{return this.state.onChild?this.state.onChild:<i className="cool-icon-31"/>}
        )
    }
    set onChild(onChild){
        this.setState({onChild:onChild});
    }
    get offChild(){
        return UIComponent.fns.constElement(this,"_off_child",this.statesHasChanged("offChild"),
            ()=>{return this.state.offChild?this.state.offChild:<i className="cool-icon-30"/>}
        )
    }
    set offChild(offChild){
        this.setState({offChild:offChild});
    }
    //-------------------------------------------------组件结构-------------------------------------------------
    getChildren(){
        return (
            <div className="switch-element" ref="switchElement" style={{
                position:'relative', width:'100%', height:'100%'
            }}>
                <div className="switch-off" style={{position:'absolute',width:'100%',height:'100%',borderRadius:this.borderRadius}}>
                    <div className="switch-content" style={this.offContentStyle}>{this.offChild}</div>
                </div>
                <div className="switch-on" style={{position:'absolute',width:'100%',height:'100%',right:this.offset,borderRadius:this.borderRadius}}>
                    <div className="switch-content" style={this.onContentStyle}>{this.onChild}</div>
                </div>
                <div className="switch-tag" style={this.tagStyle}/>
            </div>
        );
    }
    domMount(){
        super.domMount();
        this._keepStyleInterval = setInterval(()=>{
            this.resizeChange();
        },300);
    }
    domUnmount(){
        super.domUnmount();
        clearInterval(this._keepStyleInterval);
    }
    domDidChange(){
        super.domDidChange();
        this.valueChange();
    }
    clientRectChange() {
        super.clientRectChange();
        this.setAnim();
    }

    pointClick(e){
        super.pointClick(e);
        e.stopPropagation();
        this._isManual = true;
        this.isOn = !this.isOn;
    }
    valueChange(){
        if(this._oldValue !== this.isOn){
            this._oldValue = this.isOn;
            if(this.props.onValueChange){
                this.props.onValueChange(this .tagName,this.isOn,this._isManual);
            }
            if(this._anim){
                if(this.isOn){
                    Animation.playForward(this._anim);
                }else{
                    Animation.playBackward(this._anim);
                }
            }
        }
        this._isManual = false;
    }
}