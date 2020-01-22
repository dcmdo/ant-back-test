import React from 'react';
import UIComponent from 'UIComponent';
import ClassNames from "classnames";
import StateSelect from "../switches/state-select";

/**
 * 以下属性被动添加，无需手动添加
 * table,
 * dataIndex,
 */
export default class BodyTR extends UIComponent{
    get className() {
        let className = super.className;
        return className?className:"body-tr";
    }
    get isRegisterEvent() {
        return false;
    }
    awake() {
        super.awake();
        this.addToTable();
    }
    //-------------------------------------------------内部属性方法-------------------------------------------------
    declareVars(){
        super.declareVars();
        this._checkComponent;
        this._globalVars = {};//全局作用域的变量集合，避免局部访问时的变量不更新问题
    }
    get table(){
        return this.props.table;
    }
    get datas(){
        return this.table.datas;
    }
    get dataIndex(){
        return this.props.dataIndex;
    }
    get data(){
        return this.datas[this.dataIndex];
    }
    get sortedColumns(){
        return this.table.sortedColumns;
    }

    // 获取check属性
    getCheckProps(check,data){
        data._tableExtra = data._tableExtra || {};

        check.checkType = check.checkType === 0 ? 0 : 1;

        let checkPropsHandle = check.checkPropsHandle;
        let checkProps = {};
        if(checkPropsHandle){
            checkProps = checkPropsHandle(data);
        }
        checkProps.props = checkProps.props || {};
        checkProps.canCheck = checkProps.canCheck === false ? false : true;
        checkProps.canCancel = checkProps.canCancel === false ? false : true;

        if(data._tableExtra.isChecked !== undefined){
            checkProps.isChecked = data._tableExtra.isChecked;
        }else{
            checkProps.isChecked = checkProps.isChecked === true ? true : false;
            data._tableExtra.isChecked = checkProps.isChecked;
        }
        return  checkProps;
    }

    // 添加至table
    addToTable(){
        this.table.setRows(this, true);
    }
    // 从table移除
    removeFromTable(){
        this.table.setRows(this, false);
    }

    //----------------------------------------对外属性方法----------------------------------------

    get isChecked(){
        return this.data._tableExtra.isChecked;
    }

    set isChecked(isChecked){
        //第一时间设置勾选值有助于对被动选择时数值的获取
        this.data._tableExtra.isChecked = isChecked;

        this._checkComponent.index = isChecked ? 2 : 1;
    }

    //-------------------------------------------------组件结构及生命周期-------------------------------------------------
    checkElement(data,column){
        let check = column.check;

        if(check){
            let checkProps = this.getCheckProps(check,data);

            //刷新全局变量
            this._globalVars.checkType = check.checkType;
            this._globalVars.data = data;
            this._globalVars.onCheck = check.onCheck;
            this._globalVars.canCancel = checkProps.canCancel;

            return <StateSelect
                className = {"table-check"}
                stateRender = {this.table.defaultStateRender}
                {...checkProps.props}
                stateRule = {this.table.defaultStateRule}
                isEnable = {checkProps.canCheck}
                index = {checkProps.isChecked?2:1}
                stateCount = {2}
                callbackComponent = {
                    UIComponent.fns.constObject(this,"_check_callback",
                        (component)=>{
                            component.checkType = this._globalVars.checkType;
                            component.data = this._globalVars.data;
                            component.onCheck = this._globalVars.onCheck;
                            component.canCancel = this._globalVars.canCancel;

                            if(component.checkType === 1){
                                this.table.setChildCheckComponent(component, true);
                            }

                            this._checkComponent = component;
                        })
                }
                onDestroy={
                    UIComponent.fns.constObject(this,"_check_destroy",
                        (component)=>{
                            if(component.checkType === 1){
                                this.table.setChildCheckComponent(component, false);
                            }

                            if(component.index === 2){
                                if(component.checkType === 0){
                                    this.table.singleCheck(component.onCheck, false, component);
                                }else{
                                    this.table.mutiplyChildCheck(component.onCheck, false, component);
                                }
                            }
                        })
                }
                onValueChange={
                    UIComponent.fns.constObject(this,"_check_value_change",
                        (tagName,index,isManual,component)=>{
                            let isChecked = index!==1;
                            if(isManual){
                                this.data._tableExtra.isChecked = isChecked;
                            }
                            if(component.checkType === 0){
                                this.table.singleCheck(component.onCheck, isChecked, component);
                            }else{
                                this.table.mutiplyChildCheck(component.onCheck, isChecked, component);
                            }
                        })
                }
            />
        }

        return  null;
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
        let sortedColumns = this.sortedColumns;
        let data = this.data;
        let tdElements = [];
        sortedColumns.forEach((column,index)=>{
            let tdPropsHandle = column.tdPropsHandle;
            let props = null;
            if(tdPropsHandle){
                props = tdPropsHandle(data);
            }
            let checkElement = this.checkElement(data,column);
            if(checkElement){
                props = props ? {...props,children:checkElement} : {children: checkElement};
            }
            if(props!=null){
                tdElements.push(<td key={"td-"+index} className={"body-td"} {...props}/>)
            }
        });
        return tdElements;
    }

    domUnmount() {
        super.domUnmount();
        this.removeFromTable();
    }
}