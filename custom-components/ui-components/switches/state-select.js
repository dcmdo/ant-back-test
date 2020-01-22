import React from 'react';
import UIComponent from 'UIComponent';
import './default-style/state-select.scss';

/**
 * stateCount {Number} 2
 * index {Number} 1
 * stateRender {Function} (index)=>{return component}
 * stateRule {Function} (index,count)=>{return index}
 * stateClass {Function} (index)=>{return ""}
 * onValueChange {Function} (tagName,index,isManual,component)=>{}
 */
export default class StateSelect extends UIComponent{
    get className(){
        let className = super.className;
        return className?className:"default-state-select";
    }
    stateClass(index){
        if(this.props.stateClass){
            return this.props.stateClass(index);
        }
        return this.className+"-"+index;
    }
    getClassName(){
        let className = super.getClassName();
        let stateClass = this.stateClass(this.index);
        if( stateClass ){
            className[stateClass] = true;
        }
        return className;
    }
    get controlledProps(){
        return [...super.controlledProps,...["index"]];
    }

    //----------------------------------------内部属性方法----------------------------------------
    declareVars(){
        super.declareVars();

        this._isManual = false;
        this._oldIndex = null;
    }

    get stateCount(){
        let stateCount = this.props.stateCount;
        if(UIComponent.fns.TypesCheck.isNumber(stateCount)){
            if(stateCount<2)
                return 2;
            return stateCount;
        }
        return 2;
    }
    stateRule(index,count){
        return this.props.stateRule?
            this.props.stateRule(index,count):((_index,_count)=>{
                let newIndex = _index+1;
                if(newIndex>_count)
                    return 1;
                else
                    return newIndex;
            })(index,count);
    }
    stateRender(index){
        if(this.props.stateRender){
            return UIComponent.fns.constElement(this,"_"+index,this.statesHasChanged("stateRender"),
                ()=>{return this.props.stateRender(index)}
            );
        }
        return index;
    }

    //----------------------------------------对外属性方法----------------------------------------
    get index(){
        let index = this.state.index;
        if(UIComponent.fns.TypesCheck.isNumber(index)){
            if(index<1 || index>this.stateCount)
                return 1;
            return index;
        }
        return 1;
    }
    set index(index){
        this.setState({index:index});
    }

    //-------------------------------------------------组件结构-------------------------------------------------
    getChildren(){
        return this.stateRender(this.index);
    }
    pointClick(e){
        super.pointClick(e);
        e.stopPropagation();
        this._isManual = true;
        this.index = this.stateRule(this.index,this.stateCount);
    }
    domDidChange(){
        super.domDidChange();
        if(this._oldIndex !== this.index){
            this._oldIndex = this.index;
            if(this.props.onValueChange){
                this.props.onValueChange(this.tagName,this.index,this._isManual,this);
            }
        }
        this._isManual = false;
    }
}
