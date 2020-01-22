import React from 'react';
import UIComponent from 'UIComponent';
import CheckBox from 'CheckBox';
import './default-style/check-box-group.scss';

/**
 * checkedTagNames {Array} [];
 * onValuesChange {Function} ([tagNames],isManual)=>{};
 */
export default class CheckBoxGroup extends UIComponent{
    get className(){
        let className = super.className;
        return className?className:"default-checkbox-group";
    }
    get isRegisterEvent(){
        return UIComponent.fns.TypesCheck.isBoolean(this.props.isRegisterEvent)?this.props.isRegisterEvent:false;
    }
    get controlledProps(){
        return [...super.controlledProps,...["checkedTagNames"]];
    }

    //-------------------------------------------------内部方法及属性-------------------------------------------------
    declareVars(){
        super.declareVars();
        this._oldTagNamesImmutable = null;
        this._isManual = false;
        this._availableChecks = {};
        //----------创建延迟函数----------
        this._valuesChangeDelay = UIComponent.fns.throttle((isManual)=>{
            const Immutable = UIComponent.fns.Immutable;
            let newImmutable = Immutable.fromJS(this.checkedTagNames);
            if(!Immutable.is(this._oldTagNamesImmutable,newImmutable)){
                if(this.props.onValuesChange){
                    this.props.onValuesChange(this.checkedTagNames,isManual);
                }
                this._oldTagNamesImmutable = newImmutable;
            }
        },100,{leading:false});
    }
    checkChange(tagName,isChecked,isManual){
        this._isManual = isManual;
        if(isChecked){
            this.checkedTagNames = UIComponent.fns.ArrayFns.union(this.checkedTagNames,[tagName]);
        }else{
            this.checkedTagNames = UIComponent.fns.ArrayFns.without(this.checkedTagNames,tagName);
        }
    }
    valueChange(){
        //----------触发valuesChange----------
        this._valuesChangeDelay(this._isManual);
        this._isManual = false;
    }
    initChildren(){
        let _children = [];
        React.Children.map(this.children, (child,index)=>{
            if(UIComponent.fns.isSpecificReactType(child,CheckBox)){
                let Type = child.type;
                let props = {};
                for(let k in child.props){
                    props[k] = child.props[k];
                }
                props.tagName = props.tagName===undefined?"checkbox-"+index:props.tagName;
                props.key = child.key?child.key:props.tagName;
                props.onValueChange = UIComponent.fns.constObject(this,"_value_change",this.checkChange.bind(this));
                props.isChecked = this.checkedTagNames.indexOf(props.tagName)!==-1;
                _children.push(
                    <Type {...props}
                          callbackComponent={
                              UIComponent.fns.constObject(this,props.tagName+"_check_callback",
                                  (component)=>{
                                      this._availableChecks[props.tagName] = component;
                                  }
                              )
                          }
                          onDestroy = {
                              UIComponent.fns.constObject(this,props.tagName+"_check_destroy",()=>{
                                  delete this._availableChecks[props.tagName];
                              })
                          }
                    />
                );
            }else{
                _children.push(child);
            }
        });
        return _children;
    }

    //-------------------------------------------------对外属性-------------------------------------------------
    get checkedTagNames(){
        this.state.checkedTagNames = this.state.checkedTagNames || [];
        return this.state.checkedTagNames;
    }
    set checkedTagNames(checkedTagNames){
        this.setState({checkedTagNames:checkedTagNames});
    }

    //-------------------------------------------------组件结构-------------------------------------------------
    getChildren(){
        return UIComponent.fns.constElement(this,"_children",("children" in this.changedState)||("checkedTagNames" in this.changedState),
            this.initChildren.bind(this)
        );
    }
    domDidChange(){
        super.domDidChange();
        this.valueChange();
    }
    stateChanged(){
        super.stateChanged();
        if(this.statesHasChanged("checkedTagNames")){
            if(UIComponent.fns.TypesCheck.isArray(this.checkedTagNames)){
                for(let k in this._availableChecks){
                    let check = this._availableChecks[k];
                    if(this.checkedTagNames.indexOf(k)!==-1){
                        check.isChecked = true;
                    }else {
                        check.isChecked = false;
                    }
                }
            }else{
                for(let k in this._availableChecks){
                    this._availableChecks[k].isChecked = false;
                }
            }
        }
    }
}