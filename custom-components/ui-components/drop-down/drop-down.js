import React from 'react';
import UIComponent from 'UIComponent';
import SelectGrid from 'SelectGrid';
import SelectGroup from 'SelectGroup';
import './default-style/drop-down.scss';

// 当前打开的DropDown组件，用以做互斥关闭
let uniqueDropDown = null;

/**
 * 下拉菜单组件
 * json {Array} 用以配置下拉组件的数据
 * textKey {String} 显示下拉项文字的键
 * textRender {Function} 用方法来动态生成显示组件 (data)=>{ return element }
 * index {Number} 当前选择项的下标
 * onSwitch {Function} 下拉表单打开或关闭时触发 (tagName, isShow, component)=>{}
 * onValueChange {Function} 选择更改时触发 (tagName, jsonNode, index, isManual, component)=>{}
 */
export default class DropDown extends UIComponent{
    get className(){
        let className = super.className;
        return className?className:"default-drop-down";
    }
    get controlledProps(){
        return [...super.controlledProps,...["json","index","textKey"]];
    }

    //----------------------------------------内部属性及方法----------------------------------------
    declareVars(){
        super.declareVars();
        //私有
        this._selectGroup = null;
        this._isManual = false;
        this._oldNodeImmutable = null;
        this._windowEvent = null;

        this._valueChangeDelay = UIComponent.fns.throttle((isManual)=>{
            let Immutable = UIComponent.fns.Immutable;
            let newImmutable = Immutable.fromJS(this.currentJson);
            if(!Immutable.is(this._oldNodeImmutable,newImmutable)){
                if (this.props.onValueChange) {
                    this.props.onValueChange(this.tagName, this.currentJson, this.index, isManual, this);
                }
                this._oldNodeImmutable = newImmutable;
            }
        },100,{leading:false});
    }

    get listTop(){
        if(this.clientRect){
            this._selectGroup.resizeChange();
            if((this.clientRect.bottom + this._selectGroup.clientRect.height)>document.documentElement.clientHeight){
                return UIComponent.fns.convertToRem(-this._selectGroup.clientRect.height)+"rem";
            }
            return UIComponent.fns.convertToRem(this.clientRect.height)+"rem";
        }else{
            return 0+"rem";
        }
    }
    showText(data){
        if(data){
            if(this.props.textRender){
                return this.props.textRender(data);
            }
            return data[this.textKey]+"";
        }
        return null+"";
    }
    get initList(){
        let children = [];
        this.json.forEach((item,index)=>{
            children.push(<SelectGrid className="dropdown-list-item" tagName={index+""} key={"option-"+index}
                                      stopPropagationList={["pointDown"]}
            >
                <span>{this.showText(item)}</span>
            </SelectGrid>);
        });
        let list = <SelectGroup className="dropdown-list" key="list" selectedTagName={this.index+""}
                                isVisible={false}
                                onValueChange={
                                    UIComponent.fns.constObject(this,"_group_change",this.selectChange.bind(this))
                                }
                                onStateChanged={
                                    UIComponent.fns.constObject(this,"_group_state_changed",
                                        (component)=>{
                                            if(component.statesHasChanged("isVisible")){
                                                if(component.isVisible){
                                                    try{
                                                        uniqueDropDown.isVisible = false;
                                                    }catch (ex){}
                                                    uniqueDropDown = component;
                                                }else{
                                                    if(uniqueDropDown===component){
                                                        uniqueDropDown = null;
                                                    }
                                                }
                                                if(this.props.onSwitch){
                                                    this.props.onSwitch(this.tagName, component.isVisible, this);
                                                }
                                            }
                                        }
                                    )
                                }
                                callbackComponent={
                                    UIComponent.fns.constObject(this,"_group_callback",(component)=>{
                                        this._selectGroup = component;
                                    })
                                }
        >
            {children}
        </SelectGroup>;
        return list;
    }
    showList(){
        if(!this._selectGroup.isVisible){
            this.resizeChange();
        }
        this._selectGroup.isVisible = !this._selectGroup.isVisible;
        if(this._selectGroup.isVisible){
            this._selectGroup.style = {
                position:'absolute',
                width:"100%",
                height:'auto',
                overflow:'auto',
                left:0,
                top:this.listTop,
                zIndex:10
            }
        }
    }
    selectChange(remove,add,isManual){
        this._isManual = isManual;
        this.index = parseInt(add);
        this._selectGroup.isVisible = false;
    }
    valueChange(){
        this._valueChangeDelay(this._isManual);
        this._isManual = false;
    }

    addWindowEvent(){
        this._windowEvent = UIComponent.fns.DOMCrossPlatformEvent.createEvent(window);
        this._windowEvent.addEventListener("pointClick",(e)=>{
            if(this._selectGroup.isVisible){
                this._selectGroup.isVisible = false;
            }
        });
        this._windowEvent.start();
    }
    removeWindowEvent(){
        this._windowEvent.dispose();
        this._windowEvent = null;
    }

    //----------------------------------------对外属性方法----------------------------------------
    get json(){
        if(!UIComponent.fns.TypesCheck.isArray(this.state.json)){
            this.state.json = [{text:"option1"},{text:"option2"},{text:"option3"}];
        }
        return this.state.json;
    }
    set json(json){
        this.setState({json:json});
    }

    get index(){
        return this.state.index || 0;
    }
    set index(index) {
        this.setState({index:index});
    }

    get currentJson(){
        if(this.json.length===0)
            return null;
        return this.json[this.index];
    }

    get textKey(){
        return this.state.textKey===undefined?"text":this.state.textKey;
    }
    set textKey(textKey){
        this.setState({textKey:textKey});
    }
    //----------------------------------------组件结构----------------------------------------
    getChildren(){
        return [
            UIComponent.fns.constElement(
                this, "_show_text", this.statesHasChanged("index", "textKey", "json"),
                () => {
                    return <span className="dropdown-show-text" key="show-text">
                        {this.showText(this.currentJson)}
                        </span>
                }
            ),
            UIComponent.fns.constElement(
                this, "_icon", false, () => {
                    return <span className="cool-icon-2 dropdown-icon" key="icon"/>;
                }
            ),
            UIComponent.fns.constElement(
                this, "_list", this.statesHasChanged("json", "textKey"), () => {
                    return this.initList;
                }
            )];
    }
    pointClick(e){
        super.pointClick(e);
        e.stopPropagation();
        this.showList();
    }
    stateChanged(){
        super.stateChanged();
        if(this.statesHasChanged("index","json")){
            this._selectGroup.selectedTagName = this.index+"";
        }
    }
    domDidChange(){
        super.domDidChange();
        this.valueChange();
    }
    domMount(){
        super.domMount();
        this.addWindowEvent();
    }
    domUnmount(){
        super.domUnmount();
        this.removeWindowEvent();
    }
}