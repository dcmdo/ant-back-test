import React from 'react';
import UIComponent from 'UIComponent';
import './default-style/search-bar-style.scss';
import TextField from 'TextField'
import Button from 'Button';

/**
 * placeholder {String} 请输入关键字
 * keyword {String} ""
 * showClear {Boolean} false
 * searchTitle {String} 搜索按钮文字
 * onSearch {Function} (tagName,keyword,component)=>{}
 * onValueChange {Function} (tagName,keyword,isManual,component)=>{}
 */
export default class SearchBar extends UIComponent{
    get className(){
        let className = super.className;
        return className?className:"default-search-bar";
    }
    get isRegisterEvent(){
        return UIComponent.fns.TypesCheck.isBoolean(this.props.isRegisterEvent)?this.props.isRegisterEvent:false;
    }
    get controlledProps(){
        return [...super.controlledProps,...["keyword","placeholder","searchTitle"]];
    }

    //-------------------------------------------------对外属性-------------------------------------------------
    declareVars(){
        super.declareVars();
        this._textField = null;
    }
    get keyword(){
        return this.state.keyword;
    }
    set keyword(keyword){
        this.setState({keyword:keyword});
    }
    get placeholder(){
        return this.state.placeholder?this.state.placeholder:"请输入关键字";
    }
    set placeholder(placeholder){
        this.setState({placeholder:placeholder});
    }
    get searchTitle(){
        return this.state.searchTitle?this.state.searchTitle:<i className="cool-icon-20"/>;
    }
    set searchTitle(searchTitle){
        this.setState({searchTitle:searchTitle});
    }

    //-------------------------------------------------内部属性-------------------------------------------------
    get showClear(){
        return UIComponent.fns.TypesCheck.isBoolean(this.props.showClear)?this.props.showClear:true;
    }

    //-------------------------------------------------组件结构-------------------------------------------------
    getChildren(){
        return [
            UIComponent.fns.constElement(this,"_text",this.statesHasChanged("placeholder","keyword"),
                ()=>{
                    return (
                        <TextField className="search-bar-input"
                                   key="textField"
                                   callbackComponent={
                                       UIComponent.fns.constObject(this,"_text_callback",(component)=>{
                                           this._textField = component;
                                       })
                                   }
                                   placeholder={this.placeholder}
                                   text = {this.keyword}
                                   onValueChange={
                                       UIComponent.fns.constObject(this,"_text_change",(tagName,text,isOK,info,isManual)=>{
                                           this.state.keyword = text;
                                           if(this.props.onValueChange){
                                               this.props.onValueChange(this.tagName,this.keyword,isManual,this);
                                           }
                                       })
                                   }
                                   onKeyUp={
                                       UIComponent.fns.constObject(this,"_text_key",(tagName,event)=>{
                                           if(event.keyCode==13){
                                               if(this.props.onSearch){
                                                   this.props.onSearch(this.tagName,this.keyword,this);
                                               }
                                           }
                                       })
                                   }

                        />
                    );
                }),
            UIComponent.fns.constElement(this,"_clear",false,()=>{
                return this.showClear?(
                    <Button className="clear-button"
                            key="clear-button"
                            onClick={
                                UIComponent.fns.constObject(this,"_clear_click",()=>{
                                    this._textField.text = "";
                                })
                            }
                    >{<i className="cool-icon-30"/>}</Button>
                ):null
            }),
            UIComponent.fns.constElement(this,"_search",this.statesHasChanged("searchTitle"),()=>{
                return (
                    <Button className="search-button" key="search-button"
                            onClick={UIComponent.fns.constObject(this,"_search_click",
                                (tagName)=>{
                                    if(this.props.onSearch){
                                        this.props.onSearch(this.tagName,this.keyword,this);
                                    }
                                })
                            }
                    >{this.searchTitle}</Button>
                );
            })
        ];
    }
}
