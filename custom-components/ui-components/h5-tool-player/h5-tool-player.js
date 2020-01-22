import React from 'react';
import UIComponent from 'UIComponent';
import Button from 'Button';
import FullScreen from 'FullScreen';
import './default-style/h5-tool-player.scss';

/**
 * title {String}
 * menuConfig {Object} {showToolbar:true, showFullScreen:true showClose:true}
 * src {String}
 * onQuit {Function} (tagName)=>{}
 */
export default class H5ToolPlayer extends UIComponent{
    get className(){
        let className=super.className;
        return className?className:"default-h5-tool-player";
    }
    get isRegisterEvent(){
        return UIComponent.fns.TypesCheck.isBoolean(this.props.isRegisterEvent)?this.props.isRegisterEvent:false;
    }
    get controlledProps(){
        return [...super.controlledProps,...["src","title"]]
    }
    //-------------------------------------------------对外属性方法-------------------------------------------------
    get src(){
        return this.state.src;
    }
    set src(src){
        console.log(src);
        this.setState({src:src});
    }
    get title(){
        return this.state.title;
    }
    set title(title){
        this.setState({title:title});
    }
    //-------------------------------------------------内部属性及方法-------------------------------------------------
    get menuConfig(){
        let menuConifg = this.props.menuConfig===undefined?{}:this.props.menuConfig;
        menuConifg.showToolbar = UIComponent.fns.TypesCheck.isBoolean(menuConifg.showToolbar)?menuConifg.showToolbar:true;
        menuConifg.showFullScreen = UIComponent.fns.TypesCheck.isBoolean(menuConifg.showFullScreen)?menuConifg.showFullScreen:true;
        menuConifg.showClose = UIComponent.fns.TypesCheck.isBoolean(menuConifg.showClose)?menuConifg.showClose:true;
        return menuConifg;
    }
    fullScreen(){
        if(FullScreen.isFull()){
            FullScreen.off();
        }else{
            FullScreen.on(this.refs.iframe);
        }
    }
    quit(){
        this.isRender = false;
        if(this.props.onQuit){
            this.props.onQuit(this.tagName);
        }
    }
    //-------------------------------------------------组件结构-------------------------------------------------
    get toolbar(){
        if(this.menuConfig.showToolbar){
            return UIComponent.fns.constElement(this,"_toolbar",this.statesHasChanged("title"),()=>{
                return (
                    <div className="player-tool-bar" key="tool-bar">
                        <span className="player-title">{this.title}</span>
                        <div className="player-button-container">
                            {
                                this.menuConfig.showFullScreen?
                                    <Button className="player-button" extraClass="icon-font"
                                            onClick={UIComponent.fns.constObject(this,"_full_click", ()=>{this.fullScreen();})}>
                                        <i className="cool-icon-13"/>
                                    </Button> : null
                            }
                            {
                                this.menuConfig.showClose?
                                    <Button className="player-button" extraClass="icon-font"
                                            onClick={UIComponent.fns.constObject(this,"_close_click",()=>{this.quit()})}>
                                        <i className="cool-icon-30"/>
                                    </Button> : null
                            }
                        </div>
                    </div>
                );
            })
        }
        return null;
    }
    get frame(){
        console.log(this.src);
        return UIComponent.fns.constElement(this,"_iframe",this.statesHasChanged("src"),()=>{
            return <div className="html-container" key="container" style={!this.menuConfig.showToolbar?{
                top:"0rem"
            }:{}}>
                <iframe ref="iframe" src={this.src} style={{border:'none',width:"100%",height:"100%"}}/>
            </div>
        })
    }
    getChildren(){
        return[
            this.toolbar,
            this.frame
        ];
    }
    domUnmount(){
        super.domUnmount();
        try{
            this.refs.iframe.src='about:blank';
            this.refs.iframe.contentWindow.document.write('');
            this.refs.iframe.contentWindow.document.clear();
        }catch(e){}
    }
}
