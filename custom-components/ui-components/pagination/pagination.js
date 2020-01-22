import React from 'react';
import UIComponent from 'UIComponent';
import Button from 'Button';
import SelectGrid from 'SelectGrid';
import SelectGroup from 'SelectGroup';
import DropDown from 'DropDown';
import NumInput from 'NumInput';
import CoolMath from 'CoolMath';
import './default-style/pagination.scss';

const pageSizes = [10,20,30,40,50];
/**
 * pageCount {Number} 1 总共多少页
 * showCount {Number} 1 最多显示多少页
 * pageSize {Number} 10 每页显示的条数
 * index {Number} 0 当前页码
 * config {Object} {showSizeSelected:true,showGoTo:true} 配置项
 * onPageSizeChange {Function} (pageSize)=>{}
 * onIndexChange {Function} (tagName,index,component)=>{}
 */
export default class Pagination extends UIComponent{
    get className(){
        let className = super.className;
        return className?className:"default-pagination";
    }
    get isRegisterEvent() {
        return false;
    }
    get controlledProps() {
        return [...super.controlledProps, ...["pageCount", "showCount","pageSize","index"]];
    }

    //-------------------------------------------------内部属性及方法-------------------------------------------------
    declareVars(){
        super.declareVars();
        this._startButton = null;
        this._previousButton = null;
        this._nextButton = null;
        this._endButton = null;
        this._indexInput = null;
        this._oldIndex = null;
    }
    get config(){
        let config = this.props.config;
        if(config === undefined){
            config = {};
        }
        return config;
    }
    get pageSizeIndex(){
        return pageSizes.indexOf(this.pageSize);
    }
    goStart(){
        this.index = 1;
    };
    goPrevious(){
        this.index = this.index - 1;
    };
    goNext(){
        this.index = this.index + 1;
    };
    goEnd(){
        this.index = this.pageCount;
    };
    goIndex(_index){
        if(UIComponent.fns.TypesCheck.isNumber(_index)){
            this.index = _index;
        }
    }
    get segmentSplite(){
        let pageCount = this.pageCount;
        let showCount = this.showCount;
        let index = this.index;
        let spliteCount = Math.floor(showCount/2);
        let startCount = index-spliteCount;
        let endCount = index+spliteCount;
        if(showCount%2===0){
            startCount+=1;
        }
        if(startCount<1){
            startCount = 1;
            endCount = startCount-1+showCount;
        }
        if(endCount>pageCount){
            endCount=pageCount;
            startCount = pageCount+1-showCount;
        }
        return {startCount:startCount,endCount:endCount};
    }
    buttonEnableDecide(){
        let isFirst = this.index !== 1;
        let isLast = this.index !== this.pageCount;
        this._startButton.isEnable = isFirst;
        this._previousButton.isEnable = isFirst;
        this._nextButton.isEnable = isLast;
        this._endButton.isEnable = isLast;
    }
    //-------------------------------------------------对外属性-------------------------------------------------
    get pageCount(){
        if(UIComponent.fns.TypesCheck.isNumber(this.state.pageCount)){
            if(this.state.pageCount<1)
                this.state.pageCount = 1;
        }else{
            this.state.pageCount = 1;
        }
        return this.state.pageCount;
    }
    set pageCount(pageCount){
        this.setState({pageCount:pageCount});
    }
    get showCount(){
        if(UIComponent.fns.TypesCheck.isNumber(this.state.showCount)){
            if(this.state.showCount<1)
                this.state.showCount=1;
        }else{
            this.state.showCount = 1;
        }
        return this.state.showCount>this.pageCount?this.pageCount:this.state.showCount;
    }
    set showCount(showCount){
        this.setState({showCount:showCount});
    }
    get pageSize(){
        if(pageSizes.indexOf(this.state.pageSize)===-1){
            this.state.pageSize = pageSizes[0];
        }
        return this.state.pageSize;
    }
    set pageSize(pageSize){
        this.setState({pageSize:pageSize});
    }
    get index(){
        if(!UIComponent.fns.TypesCheck.isNumber(this.state.index)){
            this.state.index = 1;
        }
        this.state.index = CoolMath.clamp(1,this.pageCount,this.state.index);
        return this.state.index;
    }
    set index(index){
        this.setState({index:index});
    }
    //-------------------------------------------------组件结构-------------------------------------------------
    getChildren(){
        return [
            UIComponent.fns.constElement(this,"_start_button",false,()=>{
                return <Button key="start_button" className="pagination-item" extraClass="cool-icon-11"
                               callbackComponent = {
                                   UIComponent.fns.constObject(this,"_start_callback",(component)=>{
                                       this._startButton = component;
                                   })
                               }
                               onClick={
                                   UIComponent.fns.constObject(this,"_start_click",()=>{
                                       this.goStart();
                                   })
                               }
                />
            }),
            UIComponent.fns.constElement(this,"_previous_button",false,()=>{
                return <Button key="previous_button" className="pagination-item" extraClass="cool-icon-3"
                               callbackComponent = {
                                   UIComponent.fns.constObject(this,"_previous_callback",(component)=>{
                                       this._previousButton = component;
                                   })
                               }
                               onClick={
                                   UIComponent.fns.constObject(this,"_previous_click",()=>{
                                       this.goPrevious();
                                   })
                               }
                />
            }),
            UIComponent.fns.constElement(this,"_num_select",this.statesHasChanged("index","showCount","pageCount"),
                ()=>{
                    let pages = [];
                    let segment = this.segmentSplite;
                    for(let i=segment.startCount;i<=segment.endCount;i++){
                        pages.push(<SelectGrid className="pagination-item" key={"item-"+i} tagName={i}>{i}</SelectGrid>);
                    }
                    return <SelectGroup key="num_select" selectedTagName={this.index}
                                        onValueChange={
                                            UIComponent.fns.constObject(this,"_num_select_change",(remove,add,isManual)=>{
                                            if(isManual){
                                                this.index = add;
                                            }
                                        })}>
                        {pages}
                    </SelectGroup>
            }),
            UIComponent.fns.constElement(this,"_next_button",false,()=>{
                return <Button key="next_button" className="pagination-item" extraClass="cool-icon-4"
                               callbackComponent = {
                                   UIComponent.fns.constObject(this,"_next_callback",(component)=>{
                                       this._nextButton = component;
                                   })
                               }
                               onClick={
                                   UIComponent.fns.constObject(this,"_next_click",()=>{
                                       this.goNext();
                                   })
                               }
                />
            }),
            UIComponent.fns.constElement(this,"_end_button",false,()=>{
                return <Button key="end_button" className="pagination-item" extraClass="cool-icon-12"
                               callbackComponent = {
                                   UIComponent.fns.constObject(this,"_end_callback",(component)=>{
                                       this._endButton = component;
                                   })
                               }
                               onClick={UIComponent.fns.constObject(this,"_end_click",()=>{
                                   this.goEnd();
                               })}
                />
            }),
            UIComponent.fns.constElement(this,"_page_size",("pageSize" in this.changedState),()=>{
                if(this.config.showSizeSelected){
                    return(
                        <DropDown key="page_size" className="pagination-page-size" json={pageSizes}
                                  index = {this.pageSizeIndex}
                                  textRender={
                                      UIComponent.fns.constObject(this,"_page_size_render",(data)=>{
                                          return data+"/页";
                                      })
                                  }
                                  onValueChange = {
                                      UIComponent.fns.constObject(this,"_page_size_change",(tagName,jsonNode,index,isManual)=>{
                                          this.state.pageSize = jsonNode;
                                          if(this.props.onPageSizeChange){
                                              this.props.onPageSizeChange(jsonNode);
                                          }
                                      })
                                  }
                        />
                    )
                }
                return null;
            }),
            UIComponent.fns.constElement(this,"_go_to",false,()=>{
                if(this.config.showGoTo){
                    return (
                        <div key="go_to" style={{display:"flex"}}>
                            <NumInput className="pagination-item" callbackComponent={
                               UIComponent.fns.constObject(this,"_go_to_input_callback", (component)=>{
                                   this._indexInput = component;
                               })
                            }
                                      min={1} max={this.pageCount}/>
                            <Button className="pagination-item"
                                    onClick={
                                        UIComponent.fns.constObject(this,"_go_to_click",()=>{
                                            this.goIndex(this._indexInput.filter);
                                            this._indexInput.num = "";
                                        })
                                    }
                            >GO</Button>
                        </div>
                    )
                }
                return null;
            })
        ];
    }
    domDidChange(){
        super.domDidChange();
        this.buttonEnableDecide();
        this.valueChange();
    }
    valueChange(){
        if(!UIComponent.fns.ObjectFns.isEqual(this._oldIndex,this.index)){
            if(this.props.onIndexChange){
                this.props.onIndexChange(this.tagName, this.index, this);
            }
            this._oldIndex = this.index;
        }
    }
}