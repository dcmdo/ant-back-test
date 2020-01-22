import React from 'react';
import UIComponent from 'UIComponent';
import RadioButton from 'RadioButton';
import './default-style/radio-button-group.scss';

/**
 * canCancel {Boolean} false 是否可取消
 * selectedTagName {String} 选择的标签
 * onValueChange {Function} (remove:tagName,add:tagName,isManual)=>{}
 */
export default class RadioButtonGroup extends UIComponent{
    get className(){
        let className = super.className;
        return className?className:"default-radio-button-group";
    }
    get isRegisterEvent(){
        return UIComponent.fns.TypesCheck.isBoolean(this.props.isRegisterEvent)?this.props.isRegisterEvent:false;
    }
    get controlledProps(){
        return [...super.controlledProps,...["selectedTagName"]];
    }

    //-------------------------------------------------内部属性及方法-------------------------------------------------
    declareVars(){
        super.declareVars();
        this._isManual = false;
        this._oldTagName = undefined;
        this._availableRadios = {};
    }

    get canCancel(){
        return UIComponent.fns.TypesCheck.isBoolean(this.props.canCancel)?this.props.canCancel:false;
    }
    radioValueChange(tagName,isSelected,isManual){
        //----------切换选择项----------
        if(isSelected && this.selectedTagName!==tagName){
            this._isManual = isManual;
            try{//----------取消已选择----------
                this._availableRadios[this.selectedTagName].isSelected = false;
            }catch (ex){}
            this.selectedTagName = tagName;
        }else if(!isSelected && this.selectedTagName===tagName){
            this._isManual = isManual;
            if(this.canCancel){//----------如果可取消----------
                this.selectedTagName = null;
            }else{//----------如果不可取消----------
                try{
                    this._availableRadios[tagName].isSelected = true;
                }catch (ex){}
            }
        }
    }
    valueChange(){
        if(this._oldTagName !== this.selectedTagName){
            if(this.props.onValueChange){
                this.props.onValueChange(this._oldTagName === undefined ? null : this._oldTagName,this.selectedTagName,this._isManual);
            }
            this._oldTagName = this.selectedTagName;
        }
        this._isManual = false;
    }
    initChildren(){
        let _children = [];
        React.Children.map(this.children, (child,index)=>{
            if(UIComponent.fns.isSpecificReactType(child,RadioButton)){
                let Type = child.type;
                let props = {};
                for(let k in child.props){
                    props[k] = child.props[k];
                }
                props.tagName = props.tagName===undefined?"radio-button-"+index:props.tagName;
                props.key = child.key?child.key:props.tagName;
                props.onValueChange = UIComponent.fns.constObject(this,"_value_change",this.radioValueChange.bind(this));
                props.isSelected = this.selectedTagName === props.tagName;
                _children.push(
                    <Type {...props}
                          callbackComponent={
                              UIComponent.fns.constObject(this,props.tagName+"_radio_callback",(component)=>{
                                  this._availableRadios[props.tagName] = component;
                              })
                          }
                          onDestroy = {
                              UIComponent.fns.constObject(this,props.tagName+"_radio_destroy",()=>{
                                  delete this._availableRadios[props.tagName];
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
    get selectedTagName(){
        return this.state.selectedTagName || null;
    }
    set selectedTagName(selectedTagName){
        this.setState({selectedTagName:selectedTagName});
    }

    //-------------------------------------------------组件结构及生命周期-------------------------------------------------
    getChildren(){
        return UIComponent.fns.constElement(this,"_children",this.statesHasChanged("children"),
            this.initChildren.bind(this)
        )
    }
    domDidChange(){
        super.domDidChange();
        this.valueChange();
    }
    stateChanged(){
        super.stateChanged();
        if(this.statesHasChanged("selectedTagName")){
            let selectedTagName = this.changedState["selectedTagName"];
            try{
                this._availableRadios[selectedTagName.last].isSelected = false;
            }catch(ex){}
            try{
                this._availableRadios[selectedTagName.next].isSelected = true;
            }catch (ex){}
        }
    }
}