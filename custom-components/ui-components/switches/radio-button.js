import React from 'react';
import UIComponent from 'UIComponent';
import './default-style/radio-button.scss';

/**
 * canCancel {Boolean} 是否可取消
 * onValueChange {Function} (remove:tagName,add:tagName,isManual)=>{}
 */
class RadioButtonGroup{
    //构造函数
    constructor(onValueChange,canCancel){
        this.declareVars(onValueChange,canCancel);
    }

    declareVars(onValueChange,canCancel){
        this._canCancel = canCancel === true ? true : false;
        this._onValueChange = onValueChange;
        this._radios = {};
        this._selectedTagName = null;
        this._oldTagName = undefined;
    }

    //添加Radio到group队列
    add(tagName,radio){
        this._radios[tagName] = radio;
    }
    //将radio从队列移除
    remove(tagName){
        delete this._radios[tagName];
    }
    valueChange(tagName,isSelected,isManual){
        //切换选择项
        if(isSelected && this._selectedTagName!==tagName){
            if(this._selectedTagName !== null){//取消已选择
                this._radios[this._selectedTagName].isSelected = false;
            }
            this._selectedTagName = tagName;
        }else if(!isSelected && this._selectedTagName===tagName){
            if(this._canCancel){//如果可取消
                this._selectedTagName = null;
            }else{//如果不可取消
                this._radios[tagName].isSelected = true;
            }
        }
        if(this._oldTagName !== this._selectedTagName){
            if(this._onValueChange){
                this._onValueChange(this._oldTagName === undefined ? null : this._oldTagName,this._selectedTagName,isManual);
            }
            this._oldTagName = this._selectedTagName;
        }
    }
}

/**
 * isSelected {Boolean} false 是否选择
 * radioBack {ReactElement} 选择背景
 * radioMark {ReactElement} 选择标志
 * radioButtonGroup {RadioButtonGroup} 选择组
 * onValueChange {Function} (tagName,isSelected,isManual)=>{}
 */
export default class RadioButton extends UIComponent{
    get className(){
        let className = super.className;
        return className?className:"default-radio-button";
    }
    get selectedClass(){
        return this.className+"-selected";
    }
    getClassName(){
        let className = super.getClassName();
        if(this.selectedClass){
            className[this.selectedClass] = this.isSelected;
        }
        return className;
    }
    get controlledProps(){
        return [...super.controlledProps,...["isSelected","radioBack","radioMark"]];
    }
    awake(){
        super.awake();
        this.addToGroup();
    }

    //-------------------------------------------------内部方法-------------------------------------------------\
    declareVars(){
        super.declareVars();
        this._isManual = false;
        this._oldValue = null;
    }
    //获取selectGroup
    get radioButtonGroup(){
        return this.props.radioButtonGroup;
    }
    addToGroup(){
        if(this.radioButtonGroup instanceof RadioButtonGroup)
            this.radioButtonGroup.add(this.tagName,this);
    }
    removeToGroup(){
        if(this.radioButtonGroup instanceof RadioButtonGroup)
            this.radioButtonGroup.remove(this.tagName);
    }
    groupValueChange(){
        if(this.radioButtonGroup instanceof RadioButtonGroup)
            this.radioButtonGroup.valueChange(this.tagName,this.isSelected,this._isManual);
    }

    //-------------------------------------------------对外属性-------------------------------------------------
    get isSelected(){
        return this.state.isSelected === true ? true : false;
    }
    set isSelected(isSelected){
        this.setState({isSelected:isSelected});
    }
    get radioMark(){
        return UIComponent.fns.constElement(this,"_mark",("radioMark" in this.changedState),
            ()=>{
                return this.state.radioMark?this.state.radioMark:
                    <div className="radio-mark">
                        <i className="cool-icon-22"/>
                    </div>
            }
        )
    }
    set radioMark(radioMark){
        this.setState({radioMark:radioMark});
    }
    get radioBack(){
        return UIComponent.fns.constElement(this,"_back",("radioBack" in this.changedState),
            ()=>{
                return this.state.radioBack?this.state.radioBack:
                    <div className="radio-back">
                        <i className="cool-icon-21"/>
                    </div>
            }
        )
    }
    set radioBack(radioBack){
        this.setState({radioBack:radioBack});
    }

    //-------------------------------------------------组件结构生命周期-------------------------------------------------
    getChildren(){
        return [
            <div className="radio-frame" key={"radio-frame"} style={{pointerEvents:'none'}}>
                {this.radioBack}
                {this.radioMark}
            </div>,
            <div ref="content" className="radio-content" key={"content"} style={{pointerEvents:'none'}}>
                {this.children}
            </div>
        ];
    }
    componentWillUnmount(){
        super.componentWillUnmount();
        this.removeToGroup();
    }
    pointClick(e){
        super.pointClick(e);
        e.stopPropagation();
        this._isManual = true;
        this.isSelected = !this.isSelected;
    }
    domDidChange(){
        super.domDidChange();
        this.valueChange();
    }
    valueChange(){
       if(this._oldValue !== this.isSelected){
            this.groupValueChange();
            if(this.props.onValueChange){
                this.props.onValueChange(this.tagName,this.isSelected,this._isManual);
            }
           this._oldValue = this.isSelected;
        }
        this._isManual = false;
    }
}
RadioButton.RadioButtonGroup = RadioButtonGroup;
