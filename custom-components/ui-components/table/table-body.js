import React from 'react';
import UIComponent from 'UIComponent';
import ClassNames from "classnames";
import BodyTR from './body-tr';

/**
 * //以下属性被动添加无需手动赋值
 * table
*/
export default class TableBody extends UIComponent{
    get className() {
        let className = super.className;
        return className?className:"table-tbody";
    }
    get isRegisterEvent() {
        return false;
    }
    //-------------------------------------------------内部属性方法-------------------------------------------------
    get table(){
        return this.props.table;
    }
    get bodyTRProps(){
        let table = this.table;
        let handle = table.bodyTRPropsHandle;
        let dataCount = table.dataCount;
        let props = [];
        for(let i = 0;i < dataCount;i++){
            props.push(handle(i));
        }
        return props;
    }
    //-------------------------------------------------组件结构-------------------------------------------------
    render() {
        if(!this.isRender){
            return null;
        }
        return(
            <tbody {...this.orignalProps} ref='parent' className={ClassNames(this.getClassName())} style={this.style}>
                {this.getChildren()}
            </tbody>
        );
    }
    getChildren() {
        let bodyTRProps = this.bodyTRProps;
        let trElements = [];
        bodyTRProps.forEach((props,index)=>{
            trElements.push(
                <BodyTR key={"tr-"+index} {...props} table={this.table} dataIndex={index}/>
            );
        });
        return trElements;
    }
}