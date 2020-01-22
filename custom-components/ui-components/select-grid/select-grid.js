import React from 'react';
import UIComponent from 'UIComponent';
import './default-style/select-grid.scss';

class SelectGroup{
    /**
     * @param onValueChange {Function} (remove,add,isManual,component)=>{}
     * @param onValuesChange {Function} ([tagNames],isManual)=>{}
     * @param canCancel {Boolean} false 是否可取消选择
     * @param canMultiple {Boolean} false 是否可多选
     */
    constructor(onValueChange,onValuesChange,canCancel,canMultiple){
        this.declareVars(onValueChange,onValuesChange,canCancel,canMultiple);
    }

    //----------------------------------------内部属性及方法----------------------------------------
    declareVars(onValueChange,onValuesChange,canCancel,canMultiple){
        this._canCancel = canCancel===true ? true : false;
        this._canMultiple = canMultiple===true ? true : false;
        this._onValueChange = onValueChange;
        this._onValuesChange = onValuesChange;
        this._selectGrids = {};
        this._selectedTagNames = [];
        this._oldTagNamesImmutable = null;
        this._selectedTagName = null;
        this._oldTagName = undefined;
        this._valuesChangeDelay = UIComponent.fns.throttle((isManual)=>{
            const Immutable = UIComponent.fns.Immutable;
            let newImmutable = Immutable.fromJS(this._selectedTagNames);
            if(!Immutable.is(this._oldTagNamesImmutable,newImmutable)){
                if(this._onValuesChange){
                    this._onValuesChange(this._selectedTagNames,isManual);
                }
                this._oldTagNamesImmutable = newImmutable;
            }
        },100,{leading:false});
    }

    valueChange(tagName,isSelected,isManual,component){
        if(this._canMultiple){
            if(isSelected){
                this._selectedTagNames = UIComponent.fns.ArrayFns.union(this._selectedTagNames,[tagName]);
            }else{
                this._selectedTagNames = UIComponent.fns.ArrayFns.without(this._selectedTagNames,tagName);
            }
            //……………………触发valuesChange…………………………………………
            this._valuesChangeDelay(isManual);
        }else{
            //……………………切换选择项…………………………………………
            if(isSelected && this._selectedTagName!==tagName){
                if(this._selectedTagName !== null){//……………………取消已选择…………………………………………
                    try{
                        this._selectGrids[this._selectedTagName].isSelected = false;
                    }catch (e) {}
                }
                this._selectedTagName = tagName;
            }else if(!isSelected && this._selectedTagName===tagName){
                if(this._canCancel){//……………………如果可取消…………………………………………
                    this._selectedTagName = null;
                }else{//……………………如果不可取消…………………………………………
                    try{
                        this._selectGrids[tagName].isSelected = true;
                    }catch (e) {}
                }
            }
            if(this._oldTagName !== this._selectedTagName){
                if(this._onValueChange){
                    this._onValueChange(this._oldTagName===undefined ? null : this._oldTagName,this._selectedTagName,isManual,component);
                }
                this._oldTagName = this._selectedTagName;
            }
        }
    }

    //----------------------------------------对外属性及方法----------------------------------------
    add(tagName,grid){
        this._selectGrids[tagName] = grid;
    }
    remove(tagName){
        delete this._selectGrids[tagName];
    }
}

/**
 * isSelected {Boolean} 是否选择
 * selectGroup {SelectGroup} 选择组
 * onValueChange {Function} (tagName,isSelected,isManual,component)=>{}
 */
export default class SelectGrid extends UIComponent{
    get className(){
        let className = super.className;
        return className?className:"default-select-grid";
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
        return [...super.controlledProps,"isSelected"];
    }
    awake() {
        super.awake();
    }

    //-------------------------------------------------内部属性及方法-------------------------------------------------
    declareVars(){
        super.declareVars();
        this._isManual = false;
        this._oldValue = null;
        this.onValueChange = null;
    }
    get group(){
        return this.props.selectGroup;
    }
    addToGroup(){
        if(this.group instanceof SelectGroup)
            this.group.add(this.tagName,this);
    }
    removeToGroup(){
        if(this.group instanceof SelectGroup)
            this.group.remove(this.tagName);
    }
    groupValueChange(){
        if(this.group instanceof SelectGroup){
            this.group.valueChange(this.tagName, this.isSelected, this._isManual, this);
        }
    }
    //-------------------------------------------------对外属性及方法-------------------------------------------------
    get isSelected(){
        return this.state.isSelected === true ? true : false;
    }
    set isSelected(isSelected){
        this.setState({isSelected:isSelected});
    }
    //-------------------------------------------------组件结构-------------------------------------------------
    componentDidMount() {
        this.addToGroup();
        super.componentDidMount();
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
                this.props.onValueChange(this.tagName,this.isSelected,this._isManual,this);
            }
            if(this.onValueChange){
                this.onValueChange(this.tagName,this.isSelected,this._isManual,this);
            }
            this._oldValue = this.isSelected;
        }
        this._isManual = false;
    }
}

SelectGrid.SelectGroup = SelectGroup;