import React from 'react';
import UIComponent from 'UIComponent';
import './default-style/toggle.scss';

/**
 * isTrue {Boolean}
 * trueChild {ReactElement}
 * falseChild {ReactElement}
 * onValueChange {Function} (tagName,isTrue,isManual)=>{}
 */
export default class Toggle extends UIComponent{
    get className(){
        let className = super.className;
        return className?className:"default-toggle";
    }
    get trueClass(){
        return this.className+"-true";
    }
    getClassName(){
        let className = super.getClassName();
        className[this.trueClass] = this.isTrue;
        return className;
    }
    get controlledProps(){
        return [...super.controlledProps,...["isTrue","trueChild","falseChild"]];
    }

    //----------------------------------------内部属性及方法----------------------------------------
    declareVars(){
        super.declareVars();
        this._isManual = false;
        this._oldValue = null;
    }
    //-------------------------------------------------对外属性-------------------------------------------------
    get isTrue(){
        return this.state.isTrue === true ? true : false;
    }
    set isTrue(isTrue){
        this.setState({isTrue:isTrue});
    }
    get trueChild(){
        return UIComponent.fns.constElement(this,"_true_child",this.statesHasChanged("trueChild"),
            ()=>{return this.state.trueChild?this.state.trueChild:<i className="cool-icon-31"/>}
        )
    }
    set trueChild(trueChild){
        this.setState({trueChild:trueChild});
    }
    get falseChild(){
        return UIComponent.fns.constElement(this,"_false_child",this.statesHasChanged("falseChild"),
            ()=>{return this.state.falseChild?this.state.falseChild:<i className="cool-icon-30"/>}
        )
    }
    set falseChild(falseChild){
        this.setState({falseChild:falseChild});
    }
    //-------------------------------------------------组件结构及生命周期-------------------------------------------------
    getChildren(){
        return this.isTrue?this.trueChild:this.falseChild;
    }
    pointClick(e){
        e.stopPropagation();
        this._isManual = true;
        this.isTrue = !this.isTrue;
    }
    domDidChange(){
        super.domDidChange();
        this.valueChange();
    }
    valueChange(){
        if(this._oldValue!==this.isTrue){
            if(this.props.onValueChange){
                this.props.onValueChange(this.tagName,this.isTrue,this._isManual);
            }
            this._oldValue = this.isTrue;
        }
        this._isManual = false;
    }
}
