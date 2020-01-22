import React from 'react';
import ClassNames from "classnames";
import UIComponent from 'UIComponent';
import StateSelect from 'StateSelect';

/**
 * 以下属性被动添加无需手动赋值
 * table
 * trIndex
 */
export default class HeadTR extends UIComponent{
    get className() {
        let className = super.className;
        return className?className:"head-tr";
    }
    get isRegisterEvent() {
        return false;
    }
    //-------------------------------------------------内部属性方法-------------------------------------------------
    get table(){
        return this.props.table;
    }
    get columns(){
        return this.table.columns;
    }
    get trIndex(){
        return this.props.trIndex;
    }
    get column(){
        return this.columns[this.trIndex];
    }

    // 仅多选时有用
    getCheckProps(check){
        check.checkType = check.checkType === 0 ? 0 : 1;
        let checkPropsHandle = check.checkPropsHandle;
        let checkProps = {};
        if(checkPropsHandle){
            checkProps = checkPropsHandle();
        }
        checkProps.props = checkProps.props || {};
        checkProps.canCheck = checkProps.canCheck === false ? false : true;
        return  checkProps;
    }

    //-------------------------------------------------组件结构-------------------------------------------------
    checkElement(column){
        let check = column.check;
        if(check){
            let checkProps = this.getCheckProps(check);
            if(check.checkType === 1){
                return <StateSelect
                    className = {"table-check"}
                    stateRender = {this.table.defaultStateRender}
                    {...checkProps.props}
                    stateRule = {this.table.defaultStateRule}
                    isEnable = {checkProps.canCheck}
                    stateCount = {3}
                    index = {1}
                    callbackComponent = {
                        UIComponent.fns.constObject(this,"_check_callback",
                            (component)=>{
                                component.isInit = true;
                                this.table.setParentCheckComponent(component,true);
                            })
                    }
                    onDestroy = {
                        UIComponent.fns.constObject(this,"_check_destroy",
                            (component)=>{
                                this.table.setParentCheckComponent(component,false);
                            })
                    }
                    onValueChange = {
                        UIComponent.fns.constObject(this,"_check_value_change",
                            (tagName,index,isManual,component)=>{
                                let isChecked = index===2;
                                if(index!==3){
                                    if(component.isInit){
                                        component.isInit = false;
                                        if(!isChecked){
                                            return;
                                        }
                                    }
                                    this.table.mutiplyParentCheck(isChecked);
                                }
                            })
                    }
                />
            }
        }
        return null;
    }

    render() {
        if(!this.isRender){
            return null;
        }
        return(
            <tr {...this.orignalProps} ref='parent' className={ClassNames(this.getClassName())} style={this.style}>
                {this.getChildren()}
            </tr>
        );
    }

    getChildren() {
        let column = this.column;
        let thElements = [];
        column.forEach((col,index)=>{
            let checkElement = this.checkElement(col);
            if(checkElement){
                col.props.children = checkElement;
            }
            thElements.push(
                <th key={"th-"+index} className={"head-th"} {...col.props}/>
            )
        });
        return thElements;
    }
}