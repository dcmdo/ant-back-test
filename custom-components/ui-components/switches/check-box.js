import React from 'react';
import UIComponent from 'UIComponent';
import './default-style/check-box.scss';

/**
 * onValuesChange {Function} ([tagNames],isManual)=>{}
 */
class CheckBoxGroup {
    constructor(onValuesChange){
        this.declareVars(onValuesChange);
    }

    declareVars(onValuesChange){
        this._onValuesChange = onValuesChange;
        this._checkedTagNames = [];
        this._oldTagNamesImmutable = null;
        this._valuesChangeDelay =  UIComponent.fns.throttle((isManual)=>{
            const Immutable = UIComponent.fns.Immutable;
            let newImmutable = Immutable.fromJS(this._checkedTagNames);
            if(!Immutable.is(this._oldTagNamesImmutable,newImmutable)){
                if(this._onValuesChange){
                    this._onValuesChange(this._checkedTagNames,isManual);
                }
                this._oldTagNamesImmutable = newImmutable;
            }
        },100,{leading:false});
    }

    valueChange(tagName,isChecked,isManual){
        if(isChecked){
            this._checkedTagNames = UIComponent.fns.ArrayFns.union(this._checkedTagNames,[tagName]);
        }else{
            this._checkedTagNames = UIComponent.fns.ArrayFns.without(this._checkedTagNames,tagName);
        }

        //----------触发valuesChange----------
        this._valuesChangeDelay(isManual);
    }
}

/**
 * isChecked {Boolean} false 是否勾选
 * checkBack {ReactElement} 勾选背景
 * checkMark {ReactElement} 勾选标志
 * checkBoxGroup {CheckBoxGroup} 勾选组
 * onValueChange {Function} (tagName,isChecked,isManual)=>{}
 */
export default class CheckBox extends UIComponent{
    get className(){
        let className = super.className;
        return className?className:"default-checkbox";
    }
    get checkedClass(){
        return this.className+"-checked";
    }
    getClassName(){
        let className = super.getClassName();
        if(this.checkedClass){
            className[this.checkedClass] = this.isChecked;
        }
        return className;
    }
    get controlledProps(){
        return [...super.controlledProps,...["isChecked","checkBack","checkMark"]];
    }

    //-------------------------------------------------内部方法-------------------------------------------------
    declareVars(){
        super.declareVars();
        this._isManual = false;
        this._oldValue = null;
    }
    get checkBoxGroup(){
        return this.props.checkBoxGroup;
    }
    groupValueChange(){
        if(this.checkBoxGroup instanceof  CheckBoxGroup)
            this.checkBoxGroup.valueChange(this.tagName,this.isChecked,this._isManual);
    }

    //-------------------------------------------------对外属性-------------------------------------------------
    get isChecked(){
        return this.state.isChecked === true ? true : false;
    }
    set isChecked(isChecked){
        this.setState({isChecked:isChecked});
    }
    get checkBack(){
        return UIComponent.fns.constElement(this,"_check_back",this.statesHasChanged("checkBack"),
            ()=>{
                return this.state.checkBack?this.state.checkBack:
                    <div className="check-back">
                        <i className="cool-icon-23"/>
                    </div>
            }
        )
    }
    set checkBack(checkBack){
        this.setState({checkBack:checkBack});
    }
    get checkMark(){
        return UIComponent.fns.constElement(this,"_check_mark",this.statesHasChanged("checkMark"),
            ()=>{
                return this.state.checkMark?this.state.checkMark:
                    <div className="check-mark">
                        <i className="cool-icon-24"/>
                    </div>
            }
        )
    }
    set checkMark(checkMark){
        this.setState({checkMark:checkMark});
    }
    //-------------------------------------------------组件结构-------------------------------------------------
    getChildren(){
        return [
            <div className="check-frame" key={"check-frame"} style={{pointerEvents:'none'}}>
                {this.checkBack}
                {this.checkMark}
            </div>,
            <div className="check-content" key={"content"} style={{pointerEvents:'none'}}>
                {this.children}
            </div>
        ];
    }
    pointClick(e){
        super.pointClick(e);
        e.stopPropagation();
        this._isManual = true;
        this.isChecked = !this.isChecked;
    }
    domDidChange(){
        super.domDidChange();
        this.valueChange();
    }
    valueChange(){
        if(this._oldValue !== this.isChecked){
            this.groupValueChange();
            if(this.props.onValueChange){
                this.props.onValueChange(this.tagName,this.isChecked,this._isManual);
            }
            this._oldValue = this.isChecked;
        }
        this._isManual = false;
    }
}

CheckBox.CheckBoxGroup = CheckBoxGroup;
