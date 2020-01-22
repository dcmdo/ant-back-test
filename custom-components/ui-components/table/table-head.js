import React from 'react';
import UIComponent from 'UIComponent';
import ClassNames from "classnames";
import HeadTR from './head-tr';
/**
 * //以下属性被动添加无需手动赋值
 * table
*/
export default class TableHead extends UIComponent{
    get className() {
        let className = super.className;
        return className?className:"table-thead";
    }
    get isRegisterEvent() {
        return false;
    }
    awake() {
        super.awake();
    }
    //-------------------------------------------------内部属性方法-------------------------------------------------
    get table(){
        return this.props.table;
    }
    get headTRProps(){
        let table = this.table;
        let handle = table.headTRPropsHandle;
        let columnCount = table.columnCount;
        let props = [];
        for(let i = 0;i < columnCount;i++){
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
            <thead {...this.orignalProps} ref='parent' className={ClassNames(this.getClassName())} style={this.style}>
                {this.getChildren()}
            </thead>
        );
    }
    getChildren() {
        let headTRProps = this.headTRProps;
        let trElements = [];
        headTRProps.forEach((props,index)=>{
            trElements.push(
                <HeadTR key={"tr-"+index} {...props} table={this.table} trIndex={index}/>
            );
        });
        return trElements;
    }
}