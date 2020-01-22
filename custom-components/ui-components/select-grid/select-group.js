import React from 'react';
import UIComponent from 'UIComponent';
import SelectGrid from 'SelectGrid';
import './default-style/select-group.scss';

/**
 * canCancel {Boolean} 是否可取消
 * canMultiple {Boolean} 是否可多选
 * selectedTagName {any} 单选选中的标签
 * selectedTagNames {[any]} 多选选中的标签
 * onValueChange {Function} (remove, add, isManual,component)=>{}
 * onValuesChange {Function} (tagNames, isManual, component)=>{}
 */
export default class SelectGroup extends UIComponent{
    get className(){
        let className = super.className;
        return className?className:"default-select-group";
    }
    get isRegisterEvent(){
        return UIComponent.fns.TypesCheck.isBoolean(this.props.isRegisterEvent)?this.props.isRegisterEvent:false;
    }
    get controlledProps(){
        return [...super.controlledProps,...["selectedTagName","selectedTagNames"]];
    }

    //-------------------------------------------------内部属性及方法-------------------------------------------------
    declareVars(){
        super.declareVars();
        this._oldTagNamesImmutable = [];
        this._isManual = false;
        this._oldTagName = undefined;
        this._availableGrids = {};
        this._valuesChangeDelay = UIComponent.fns.throttle((isManual)=>{
            const Immutable = UIComponent.fns.Immutable;
            let newImmutable = Immutable.fromJS(this.selectedTagNames);
            if(!Immutable.is(this._oldTagNamesImmutable, newImmutable)){
                if(this.props.onValuesChange){
                    this.props.onValuesChange(this.selectedTagNames,isManual,this);
                }
                this._oldTagNamesImmutable = newImmutable;
            }
        },100,{leading:false});
    }
    get canCancel(){
        if(this.canMultiple)
            return true;
        return UIComponent.fns.TypesCheck.isBoolean(this.props.canCancel)?this.props.canCancel:false;
    }
    get canMultiple(){
        return UIComponent.fns.TypesCheck.isBoolean(this.props.canMultiple)?this.props.canMultiple:false;
    }
    selectGridChange (tagName, isSelected, isManual, component){
        if(this.canMultiple){
            this._isManual = isManual;
            if(isSelected){
                this.selectedTagNames = UIComponent.fns.ArrayFns.union(this.state.selectedTagNames,[tagName]);
            }else{
                this.selectedTagNames = UIComponent.fns.ArrayFns.without(this.state.selectedTagNames,tagName);
            }
        }else{
            //----------切换选择项----------
            if(isSelected && this.selectedTagName!==tagName){
                this._isManual = isManual;
                try{//----------取消已选择----------
                    this._availableGrids[this.selectedTagName].isSelected = false;
                }catch (ex){}
                this.selectedTagName = tagName;
            }else if(!isSelected && this.selectedTagName===tagName){
                this._isManual = isManual;
                if(this.canCancel){//----------如果可取消----------
                    this.selectedTagName = null;
                }else{//----------如果不可取消----------
                    try{
                        this._availableGrids[tagName].isSelected = true;
                    }catch (ex){}
                }
            }
        }
    };
    valueChange(){
        if(this.canMultiple){
            //----------触发valuesChange----------
            this._valuesChangeDelay(this._isManual);
        }else{
            if(this._oldTagName !== this.selectedTagName){
                let component = null;
                if(this.selectedTagName === null){
                    component = this._availableGrids[this._oldTagName];
                }else{
                    component = this._availableGrids[this.selectedTagName];
                }
                if(this.props.onValueChange){
                    this.props.onValueChange(this._oldTagName===undefined ? null : this._oldTagName,this.selectedTagName,this._isManual,component || null);
                }
                this._oldTagName = this.selectedTagName;
            }
        }
        this._isManual = false;
    }

    initChildren(){
        let _children = [];
        React.Children.map(this.children, (child,index)=>{
            if(UIComponent.fns.isSpecificReactType(child,SelectGrid)){
                let Type = child.type;
                let props = {};
                for(let k in child.props){
                    props[k] = child.props[k];
                }
                props.tagName =  props.tagName!==undefined?props.tagName:"select-grid-"+index;
                props.key = child.key?child.key:props.tagName;
                props.onValueChange = UIComponent.fns.constObject(this,"_value_change",this.selectGridChange.bind(this));
                if(this.canMultiple){
                    props.isSelected = this.selectedTagNames.indexOf(props.tagName)!==-1;
                }else{
                    props.isSelected = this.selectedTagName === props.tagName;
                }
                _children.push(
                    <Type {...props}
                          callbackComponent={
                              UIComponent.fns.constObject(this,props.tagName+"_grid_callback",
                                  (component)=>{
                                      this._availableGrids[props.tagName] = component;
                                  }
                              )
                          }
                          onDestroy = {
                              UIComponent.fns.constObject(this,props.tagName+"_grid_destroy",(component)=>{
                                  if(component.isSelected){
                                      this.selectGridChange(component.tagName,false,false,null);
                                  }
                                  delete this._availableGrids[props.tagName];
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

    get selectedTagNames(){
        this.state.selectedTagNames = this.state.selectedTagNames || [];
        return this.state.selectedTagNames;
    }
    set selectedTagNames(selectedTagNames){
        this.setState({selectedTagNames:selectedTagNames});
    }

    getSelectGrid(tagName){
        return this._availableGrids[tagName];
    }
    //-------------------------------------------------组件结构及生命周期-------------------------------------------------
    getChildren(){
        return UIComponent.fns.constElement(this,"_children",this.statesHasChanged("children"),
            this.initChildren.bind(this)
        );
    }
    domDidChange(){
        super.domDidChange();
        this.valueChange();
    }
    stateChanged(){
        super.stateChanged();
        if(this.canMultiple){
            if(this.statesHasChanged("selectedTagNames")){
                if(UIComponent.fns.TypesCheck.isArray(this.selectedTagNames)){
                    for(let k in this._availableGrids){
                        let grid = this._availableGrids[k];
                        if(this.selectedTagNames.indexOf(k)!==-1){
                            grid.isSelected = true;
                        }else {
                            grid.isSelected = false;
                        }
                    }
                }else{
                    for(let k in this._availableGrids){
                        this._availableGrids[k].isSelected = false;
                    }
                }
            }
        }else{
            if(this.statesHasChanged("selectedTagName")){
                let selectedTagName = this.changedState["selectedTagName"];
                try{
                    this._availableGrids[selectedTagName.last].isSelected = false;
                }catch(ex){}
                try{
                    this._availableGrids[selectedTagName.next].isSelected = true;
                }catch (ex){}
            }
        }
    }
}
