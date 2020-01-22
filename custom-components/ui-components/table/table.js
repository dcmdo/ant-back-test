import React from 'react';
import UIComponent from 'UIComponent';
import Increment from 'Increment';
import TableHead from './table-head';
import TableBody from './table-body';
import ClassNames from "classnames";
import './default-style/table.scss';

//----------全局默认stateIndex相关属性----------
const defaultStateRender = (index) => {
    switch (index) {
        case 1:
            return null;
        case 2:
            return <i className={"cool-icon-31"}/>;
        case 3:
            return <i className={"cool-icon-33"}/>;
    }
};
const defaultStateRule = (index) => {
    if (index === 1 || index === 3)
        return 2;
    if (index === 2)
        return 1;
};

/**
 * 属性说明
 * colgroup:<colgroup></colgroup>
 * tableHeadProps:{}
 * tableBodyProps:{}
 * datas:[{}，{}]
 * columns:[
 *   //第一行
 *   [{
 *       props:{},//thProps
 *       //----------check相关----------
 *       check:{
 *              checkType: 0单选1多选
 *              //data === undefined 表示表头选择组件
 *              checkPropsHandle:(data)=>{
 *                  return {
 *                      props:{} stateIndexProps
 *                      canCheck:true or false
 *                      isChecked:true or false
 *                      canCancel:true or false //单选时决定是否可取消
 *                  }
 *              }
 *              onCheck:()=>{} //type===0时 参数为 uncheckedData,chechedData；//type===1时 参数为 checkedSet:[]
 *       }
 *       //----------数据渲染相关----------
 *       tdPropsHandle:(data)=>{
 *                       return tdProps;
 *                   },
 *       renderIndex:渲染顺序
 *   }],
 *   ...第N行
 * ]
 * headTRPropsHandle:(trIndex)=>{
 *   return headTRProps;
 * }
 * bodyTRPropsHandle:(trIndex)=>{
 *  return bodyTRProps;
 * }
 */
export default class Table extends UIComponent {
    get className() {
        let className = super.className;
        return className ? className : "default-table";
    }

    get isRegisterEvent() {
        return false;
    }

    get controlledPropsWithClone() {
        return [...super.controlledPropsWithClone,"datas"];
    }

    //-------------------------------------------------内部属性方法-------------------------------------------------
    // 声明内部变量
    declareVars() {
        super.declareVars();
        // 自增模块
        this._increment = new Increment();
        this._sortedColumns;// 按渲染顺序排列的表头列

        this._rows = [];//数据行

        this._singleCheckedComponent = null;// 当前被单选的组件
        this._lastSingleCheckedComponent = null;

        this._parentCheckComponent = null;// 多选父节点
        this._childCheckComponents = []; // 多选子节点集合

        this._isCheckedComponents = [];//被多选的组件列表
        this._lastCheckedComponentsImmutable = null;//上次被选择对象的不可变值


        //多选延迟处理函数 提升性能
        this._mutiplyCheckDelayHandle = UIComponent.fns.throttle((onCheck) => {
            const Immutable = UIComponent.fns.Immutable;
            let curCheckedComponentsImmutable = Immutable.fromJS(this._isCheckedComponents);
            if (!Immutable.is(curCheckedComponentsImmutable, this._lastCheckedComponentsImmutable)) {
                if (onCheck) {
                    let checkedDataSet = [];
                    this._isCheckedComponents.forEach((checkComponent)=>{
                        checkedDataSet.push(checkComponent.data);
                    });
                    onCheck(checkedDataSet);
                }
                this._lastCheckedComponentsImmutable = curCheckedComponentsImmutable;
            }
        }, 100, {leading: false});

        //单选延迟处理函数 提升性能
        this._singleCheckDelayHandle = UIComponent.fns.throttle((onCheck) => {
            if (this._lastSingleCheckedComponent !== this._singleCheckedComponent) {
                if (onCheck) {
                    let removeData = this._lastSingleCheckedComponent === null ? null : this._lastSingleCheckedComponent.data;
                    let addData = this._singleCheckedComponent === null ? null : this._singleCheckedComponent.data;
                    const Immutable = UIComponent.fns.Immutable;
                    if (!Immutable.is(Immutable.fromJS(removeData), Immutable.fromJS(addData))) {
                        onCheck(removeData, addData);
                    }
                }
                this._lastSingleCheckedComponent = this._singleCheckedComponent;
            }
        }, 100, {leading: false});
    }

    //表头属性
    get tableHeadProps() {
        return this.props.tableHeadProps || {};
    }

    //表头行属性函数
    get headTRPropsHandle() {
        return this.props.headTRPropsHandle || UIComponent.fns.constObject(this, "_head_tr_props_handle",
            (trIndex) => {
                    return {};
                }
            );
    }

    //表体属性
    get tableBodyProps() {
        return this.props.tableBodyProps || {};
    }

    //数据行属性
    get bodyTRPropsHandle() {
        return this.props.bodyTRPropsHandle ||
            UIComponent.fns.constObject(this, "_body_tr_props_handle",
                (trIndex) => {
                    return {};
                });
    }

    // 表头列数组
    get columns() {
        return this.props.columns || [];
    }

    //表头列的行数
    get columnCount() {
        return this.columns.length;
    }

    //根据renderIndex排序的表头列
    get sortedColumns() {
        if (!this._sortedColumns) {
            this._sortedColumns = [];
            let columns = [...this.columns];
            columns.forEach((column) => {
                column.forEach((col) => {
                    if (col.renderIndex !== undefined) {
                        this._sortedColumns.splice(col.renderIndex, 0, col);
                    } else {
                        this._sortedColumns.push(col);
                    }
                })
            });
        }
        return this._sortedColumns;
    }

    //重置有序表头列 当重新渲染时
    resetSortedColumns() {
        this._sortedColumns = undefined;
    }

    //数据行数
    get dataCount() {
        return this.datas.length;
    }

    /**
     * 返回check组件默认的(StateSelect的stateRender函数)
     * 主要是为了避免重复创建该函数从而提升性能
     */
    get defaultStateRender() {
        return defaultStateRender;
    }

    /**
     * 返回check组件默认的(StateSelect的stateRender函数)
     * 主要是为了避免重复创建该函数从而提升性能
     */
    get defaultStateRule() {
        return defaultStateRule;
    }

    //----------check相关属性方法----------
    setParentCheckComponent(component, isAdd){
        if(isAdd){
            this._parentCheckComponent = component;
            this.parentCheckDecide();
        }else{
            if(this._parentCheckComponent === component){
                this._parentCheckComponent = null;
            }
        }
    }

    setChildCheckComponent(component, isAdd){
        let index = this._childCheckComponents.indexOf(component);
        if(isAdd){
            if(index === -1){
                this._childCheckComponents.push(component);
            }
        }else{
            if(index !== -1){
                this._childCheckComponents.splice(index, 1);
            }
        }
    }

    mutiplyParentCheck(isChecked){
        this._childCheckComponents.forEach((component) => {
            if (component.isEnable) {
                let index = isChecked ? 2 : 1;
                if (component.index !== index) {
                    component.index = index;
                }
            }
        })
    }

    mutiplyChildCheck(onCheck, isChecked, component){
        let index = this._isCheckedComponents.indexOf(component);
        if (isChecked) {
            if (index === -1) {
                this._isCheckedComponents.push(component);
                this._mutiplyCheckDelayHandle(onCheck);
            }
        } else {
            if (index !== -1) {
                this._isCheckedComponents.splice(index, 1);
                this._mutiplyCheckDelayHandle(onCheck);
            }
        }
        this.parentCheckDecide();
    }

    //子节点的选择决定父节点的状态
    parentCheckDecide() {
        let hasFalse = false;
        let hasTrue = false;
        this._childCheckComponents.forEach((component) => {
            if (component.isEnable) {
                if (component.index === 1) {
                    hasFalse = true;
                } else {
                    hasTrue = true;
                }
            }
        });
        if (hasFalse && hasTrue) {
            if (this._parentCheckComponent.index !== 3) {
                this._parentCheckComponent.index = 3;
            }
        } else if (hasFalse && !hasTrue) {
            if (this._parentCheckComponent.index != 1) {
                this._parentCheckComponent.index = 1;
            }
        } else if (hasTrue && !hasFalse) {
            if (this._parentCheckComponent.index != 2) {
                this._parentCheckComponent.index = 2;
            }
        }
    }

    singleCheck(onCheck, isChecked, component){
        if (isChecked) {
            if (this._singleCheckedComponent !== component) {
                if (this._singleCheckedComponent !== null) {
                    this._singleCheckedComponent.index = 1;
                }
                this._singleCheckedComponent = component;
                this._singleCheckDelayHandle(onCheck);
            }
        } else {
            if (this._singleCheckedComponent === component) {
                if (component.canCancel) {
                    this._singleCheckedComponent = null;
                    this._singleCheckDelayHandle(onCheck);
                } else {
                    component.index = 2;
                    return;
                }
            }
        }
    }

    setRows(row, isAdd){
        let index = this._rows.indexOf(row);
        if(isAdd){
            if(index === -1){
                this._rows.push( row );
            }
        }else{
            if(index !== -1){
                this._rows.splice(index, 1);
            }
        }
    }

    //-------------------------------------------------对外属性方法-------------------------------------------------
    get datas() {
        return this.state.datas ? this.state.datas : [];
    }

    set datas(datas) {
        this.setState({datas: datas});
    }

    /**
     * 获取表节点
     * @param selectHandle:(row)=>{ return true or false }
     * return rows:[]
     */
    getTableRows(selectHandle){
        let rows = [];
        this._rows.forEach((row)=>{
            if(selectHandle(row)){
                rows.push(row);
            }
        });
        return rows;
    }
    //-------------------------------------------------组件结构-------------------------------------------------
    render() {
        if (!this.isRender) {
            return null;
        }

        // 如需重新渲染，重置表头列
        this.resetSortedColumns();
        return (
            <table {...this.orignalProps} ref='parent' className={ClassNames(this.getClassName())} style={this.style}>
                {this.props.colgroup?this.props.colgroup:null}
                {this.getChildren()}
            </table>
        );
    }

    getChildren() {
        return <React.Fragment>
            {
                UIComponent.fns.constElement(this, "_table_head", this.propsHasChanged("tableHeadProps","headTRPropsHandle","columns","checkColumn"),
                    () => {
                        return <TableHead key={"table_head_"+this._increment.increment()} {...this.tableHeadProps} table={this}/>
                    })
            }
            {
                UIComponent.fns.constElement(this, "_table_body", this.propsHasChanged("tableBodyProps","bodyTRPropsHandle","columns","checkColumn") || this.statesHasChanged("datas"),
                    () => {
                        return <TableBody key={"table_body_"+this._increment.increment()} {...this.tableBodyProps} table={this}/>
                    })
            }
        </React.Fragment>
    }
}