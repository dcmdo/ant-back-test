import React from 'react';
import UIComponent from 'UIComponent';
import Button from 'Button';
import FullScreen from 'FullScreen';
import Increment from 'Increment';
import './default-style/flash-player.scss';

/**
 * title {String}
 * src {String}
 * onQuit {Function} ()=>{}
 */

export default class FlashPlayer extends UIComponent{
    get className(){
        let className=super.className;
        return className?className:"default-flash-player";
    }
    get isRegisterEvent(){
        return UIComponent.fns.TypesCheck.isBoolean(this.props.isRegisterEvent)?this.props.isRegisterEvent:false;
    }
    get controlledProps(){
        return [...super.controlledProps,...["src"]];
    }

    //-------------------------------------------------内部属性方法-------------------------------------------------
    declareVars(){
        super.declareVars();
        this._increment = new Increment();
    }
    fullScreen(){
        FullScreen.on(UIComponent.fns.getReactDOM(this.refs.container));
    }
    quit(){
        this.isRender = false;
        if(this.props.onQuit){
            this.props.onQuit(this.props.tagName);
        }
    }
    //-------------------------------------------------对外属性方法-------------------------------------------------
    get src(){
        return this.state.src;
    }
    set src(src){
        this.setState({src:src});
    }
    //-------------------------------------------------组件结构-------------------------------------------------
    getChildren(){
        return[
            UIComponent.fns.constElement(this,"_title",this.propsHasChanged("title"),()=>{
                return <div className="player-tool-bar" key="tool-bar" ref="tool-bar">
                    <span className="player-title">{this.props.title}</span>
                    <div className="player-button-container">
                        <Button className="player-button" extraClass="icon-font"
                                onClick={
                                    UIComponent.fns.constObject(this,"_quit_click",()=>{this.quit()})
                                }>
                            <i className="cool-icon-30"/>
                        </Button>
                    </div>
                </div>
            }),
            UIComponent.fns.constElement(this,"_container",this.statesHasChanged("src"),()=>{
                return <div className="flash-container" ref="container" key="container">
                    <object>
                        <embed src={this.src} width="100%" height="100%" key={this._increment.increment()}/>
                    </object>
                </div>
            })
        ];
    }
}