import React from 'react';
import UIComponent from 'UIComponent';
import './default-style/modal-window.scss';
import Animation from "Animation";

/**
 * isShow {Boolean} false
 * animType {String} zoom topMove bottomMove leftMove rightMove topExpand bottomExpand leftExpand rightExpand
 */
export default class ModalWindow extends UIComponent{
    get className(){
        let className = super.className;
        return className?className:"default-modal-window";
    }
    get isRegisterEvent() {
        return UIComponent.fns.TypesCheck.isBoolean(this.props.isRegisterEvent) ? this.props.isRegisterEvent : false;
    }
    get style(){
        return {
            ...super.style,
            position:'fixed',
            overflow:'hidden',
            top:0,
            bottom:0,
            right:0,
            left:0,
            zIndex:1000
        };
    }
    get controlledProps(){
        return [...super.controlledProps,...["isShow"]];
    }
    initState(){
        let state = super.initState();
        state.inner_style = {};
        return state;
    }

    awake(){
        super.awake();
        this.initFrameAdapter();
    }

    //-------------------------------------------------内部属性及方法-------------------------------------------------
    declareVars(){
        super.declareVars();
        this._animation = null;
        this._iframeAdapter = null;
    }

    initFrameAdapter(){
        this._iframeAdapter = ()=>{
            // if(this.isShow && this.refs.parent){
            //     let iframes = window.parent.document.getElementsByTagName("iframe");
            //     let iframe;
            //     for(let i = 0;i<iframes.length;i++){
            //         if(iframes[0].contentWindow === window){
            //             iframe = iframes[0];
            //             break;
            //         }
            //     }
            //     if(iframe){
            //         let topOffset = (window.parent.innerHeight + 2*window.parent.pageYOffset)-this.refs.parent.clientHeight - iframe.offsetTop*2;
            //         let leftOffset = (window.parent.innerWidth + 2*window.parent.pageXOffset)-this.refs.parent.clientWidth - iframe.offsetLeft*2;
            //         this.setState({inner_style:{marginTop:topOffset,marginLeft:leftOffset}})
            //     }
            // }
        }
    }

    get animStyle(){
        return this.props.animType?this.props.animType:'zoom';
    }
    initAnim(){
        if(this._animation)
            return;
        let element = UIComponent.fns.getReactDOM(this.refs.parent);
        let animProps = {};
        switch (this.animStyle){
            case 'zoom':
                animProps = {
                    scaleX:0,
                    scaleY:0
                };
                break;
            case 'topMove':
                animProps={
                    top:'-100%',
                    bottom:'100%'
                };
                break;
            case 'bottomMove':
                animProps={
                    top:'100%',
                    bottom:'-100%'
                };
                break;
            case 'leftMove':
                animProps={
                    left:'-100%',
                    right:'100%'
                };
                break;
            case 'rightMove':
                animProps={
                    left:'100%',
                    right:'-100%'
                };
                break;
            case 'topExpand':
                animProps={
                    bottom:'100%'
                };
                break;
            case 'bottomExpand':
                animProps={
                    top:'100%'
                };
                break;
            case 'leftExpand':
                animProps={
                    right:'100%'
                };
                break;
            case 'rightExpand':
                animProps={
                    left:'100%'
                };
                break;
        }
        this._animation = Animation.to(element,animProps,
            {
                duration:0.5,
                ease:Animation.ease.easeInOutQuad
            }) ;
        if(this.isShow){
            Animation.sample(this._animation,0);
        }
        else{
            Animation.sample(this._animation,1);
        }
    }

    //-------------------------------------------------对外属性-------------------------------------------------
    get isShow(){
        return UIComponent.fns.TypesCheck.isBoolean(this.state.isShow)?this.state.isShow:false;
    }
    set isShow(isShow){
        this.setState({isShow:isShow});
    }

    //-------------------------------------------------组件结构-------------------------------------------------

    getChildren(){
        return <div ref="inner_container" style={this.state.inner_style}>
            {this.children}
        </div>
    }
    domMount(){
        super.domMount();
        this.initAnim();
        if(window.parent){
            window.parent.addEventListener("scroll",this._iframeAdapter,{ passive: false });
            window.parent.addEventListener("resize",this._iframeAdapter,{ passive: false });
        }
    }
    domUnmount(){
        super.domUnmount();
        if(window.parent){
            window.parent.removeEventListener("scroll",this._iframeAdapter);
            window.parent.removeEventListener("resize",this._iframeAdapter);
        }
    }
    domDidChange(){
        super.domDidChange();
        if(this.statesHasChanged("isShow")){
            if(this._animation){
                if(this.isShow){
                    Animation.playBackward(this._animation);
                }else{
                    Animation.playForward(this._animation);
                }
            }
        }
    }
}
