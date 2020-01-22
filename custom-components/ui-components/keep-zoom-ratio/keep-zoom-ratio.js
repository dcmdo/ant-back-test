import React from 'react';
import UIComponent from 'UIComponent';
import './default-style/keep-zoom-ratio.scss';

/**
 * widthHeightRadio
 */
export default class KeepZoomRatio extends UIComponent{
    get className(){
        let className = super.className;
        return className?className:"default-keep-zoom-ratio";
    }
    get isRegisterEvent(){
        return UIComponent.fns.TypesCheck.isBoolean(this.props.isRegisterEvent)?this.props.isRegisterEvent:false;
    }

    //-------------------------------------------------内部属性-------------------------------------------------
    declareVars(){
        super.declareVars();
        this._resizeInterval = null;
    }
    get widthHeightRadio(){
        return this.props.widthHeightRadio?this.props.widthHeightRadio:1;
    }
    //-------------------------------------------------组件结构-------------------------------------------------
    initState() {
        let state = super.initState();
        state.width = 1;
        state.height = 1;
        return state;
    }
    getChildren(){
        return UIComponent.fns.constElement(this,"_keep_zoom_ratio", this.statesHasChanged("width","height","children"),
            ()=>{
                return <div style={{position:"relative",width:this.state.width,height:this.state.height}}>
                    {this.children}
                </div>
            }
        )
    }
    domMount(){
        super.domMount();
        this._resizeInterval = setInterval(()=>{
            this.resizeChange();
        },100);
    }
    domUnmount(){
        super.domUnmount();
        clearInterval(this._resizeInterval);
    }
    clientRectChange(){
        let client = this.clientRect;
        if((client.width/client.height)<this.widthHeightRadio){
            this.setState({width:client.width,height:client.width/this.widthHeightRadio});
        }else{
            this.setState({width:client.height*this.widthHeightRadio,height:client.height});
        }
    }
}