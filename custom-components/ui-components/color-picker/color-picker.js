import React from 'react';
import UIComponent from 'UIComponent';
import './default-style/color-picker.scss';
import SelectGrid from 'SelectGrid';
import SelectGroup from 'SelectGroup';

// 默认颜色列表
const colors = ["#ff0000","#ff6000","#ffbf00","#dfff00",
    "#80ff00","#20ff00","#00ff40","#00ff9f",
    "#00ffff","#009fff","#0040ff","#2000ff",
    "#8000ff","#df00ff","#ff00bf","#ff0060",
    "#000000","#555555","#aaaaaa","#ffffff"
];

/**
 * 拾色器
 * colors {[{String}]} 颜色集合
 * color {String} 当前颜色
 * onValueChange {Function} (removeColor,addColor,isManual, component)=>{}
 */
export default class ColorPicker extends UIComponent{
    get className(){
        let className = super.className;
        return className?className:"default-color-picker";
    }
    get isRegisterEvent(){
        return false;
    }
    get controlledProps(){
        return [...super.controlledProps,...["colors","color"]];
    }

    //-------------------------------------------------内部属性方法-------------------------------------------------
    declareVars(){
        super.declareVars();
        //----------私有----------
        this._selectGroup = null;
    }

    get colorProps(){
        let props = {...this.props};
        props.className = this.className;
        props.selectedTagName = this.color;
        props.ref = "parent";
        props.callbackComponent = UIComponent.fns.constObject(this,"_colors_callback",(component)=>{
            this._selectGroup = component;
        });
        props.onValueChange = UIComponent.fns.constObject(this,"_colors_change",
            UIComponent.fns.throttle((remove,add,isManual)=>{
                this.state.color = add;
                if(this.props.onValueChange){
                    this.props.onValueChange(remove, add, isManual, this);
                }
            },100,{leading:false}));
        return props;
    }

    //-------------------------------------------------对外属性方法-------------------------------------------------
    get colors(){
        return this.state.colors || colors;
    }
    set colors(colors){
        this.setState({colors:colors});
    }

    get color(){
        return this.state.color || this.colors[0];
    }
    set color(color){
        this.setState({color:color});
    }

    //-------------------------------------------------组件结构及生命周期-------------------------------------------------
    //色块
    get colorBlocks(){
        let colors = this.colors;
        let colorBlocks = [];
        colors.forEach((item,index)=>{
            colorBlocks.push(<SelectGrid className="color-block" tagName={item} key={"color-block-"+index}
                                         style={{backgroundColor:item}}
            />)
        });
        return colorBlocks;
    }

    render(){
        return UIComponent.fns.constElement(this,"_picker",this.statesHasChanged("colors"),
            ()=>{
                return <SelectGroup {...this.colorProps}>{this.colorBlocks}</SelectGroup>;
            }
        )
    }

    stateChanged(){
        super.stateChanged();
        if(this.statesHasChanged("color")){
            this._selectGroup.selectedTagName = this.changedState.color.next || this.colors[0];
        }
    }
}