import React from 'react';
import UIComponent from 'UIComponent';
import CoolMath from 'CoolMath';
import SVGAddon from 'SVGAddon';

/**
 * index {Number}
 * score {Number}
 * type {String} star || heart
 * activeColor {String} #ffa032
 * inactiveColor {String} #c0c0c0
 * readOnly {Boolean} false
 * onScoreChange {Function} (score)=>{}
 * onScoreDecide {Function} (score)=>{}
 */
export default class RateSVG extends UIComponent{
    get className(){
        return "rate-path";
    }

    //-------------------------------------------------内部属性方法-------------------------------------------------
    declareVars(){
        super.declareVars();
        this._pointMoveDelay = (bbox,localPoint)=>{
            if(this.props.onScoreChange){
                this.props.onScoreChange(
                    this.computeScore(bbox,localPoint)
                );
            }
        };
    }
    get starPath(){
        return "M113.5,51.3c-0.6-1.7-1.6-3.2-3-4.4c-1.4-1.2-3-1.9-4.7-2.2l-22.8-3.5L72.7,19.6c-0.8-1.8-2-3.2-3.7-4.1"+
            "c-1.6-1-3.2-1.4-5-1.4c-1.8,0-3.5,0.5-5,1.4c-1.6,1-2.9,2.3-3.7,4.1L45.1,41.3l-22.8,3.5c-1.8,0.3-3.4,1-4.7,2.2"+
            "c-1.4,1.2-2.4,2.6-3,4.4c-0.6,1.7-0.7,3.5-0.3,5.2s1.2,3.3,2.5,4.6l16.8,17.2l-4,24.3c-0.4,3,0.3,5.6,2.2,7.9"+
            "c1.9,2.3,4.4,3.4,7.4,3.4c1.6,0,3.2-0.4,4.7-1.2L64,101.6l20.2,11.2c1.5,0.8,3,1.2,4.7,1.2c3,0,5.4-1.1,7.4-3.4"+
            "c1.9-2.3,2.7-4.9,2.2-7.9l-4-24.3l16.8-17.2c1.3-1.3,2.1-2.9,2.5-4.6C114.2,54.8,114.1,53.1,113.5,51.3L113.5,51.3z"
    }
    get heartPath(){
        return "M64,108.7c-0.4,0-0.9-0.1-1.3-0.3c-0.5-0.3-12.2-6.9-24.2-17.6c-7.1-6.4-12.7-12.9-16.8-19.4C16.6,63.2,14,54.9,14,46.9"+
            "c0-15.2,12.4-27.6,27.6-27.6c5.2,0,10.6,1.9,15.4,5.4c2.8,2.1,5.2,4.5,6.9,7.2c1.8-2.6,4.1-5.1,6.9-7.2c4.8-3.5,10.3-5.4,15.4-5.4"+
            "c15.2,0,27.6,12.4,27.6,27.6c0,8-2.6,16.3-7.8,24.5c-4.1,6.5-9.7,13-16.7,19.4c-11.9,10.8-23.7,17.3-24.2,17.6"+
            "C64.9,108.6,64.4,108.7,64,108.7L64,108.7z"
    }
    get index (){
        return this.props.index;
    }
    get score(){
        return this.props.score;
    }
    get type(){
        return this.props.type;
    }
    get readOnly(){
        return this.props.readOnly;
    }
    get activeColor(){
        return this.props.activeColor;
    }
    get inactiveColor(){
        return this.props.inactiveColor;
    }
    get linearGradient(){
        if(this.score<=this.index){
            return (
                <linearGradient id={"color-"+this.tagName}>
                    <stop offset={"0%"} style={{stopColor:this.inactiveColor}}/>
                    <stop offset={"100%"} style={{stopColor:this.inactiveColor}}/>
                </linearGradient>
            );
        }else if(this.score>=(this.index+1)){
            return (
                <linearGradient id={"color-"+this.tagName}>
                    <stop offset={"0%"} style={{stopColor:this.activeColor}}/>
                    <stop offset={"100%"} style={{stopColor:this.activeColor}}/>
                </linearGradient>
            );
        }else{
            let rate = this.score - this.index;
            rate = rate*100+"%";
            return (
                <linearGradient id={"color-"+this.tagName}>
                    <stop offset={"0%"} style={{stopColor:this.activeColor}}/>
                    <stop offset={rate} style={{stopColor:this.activeColor}}/>
                    <stop offset={rate} style={{stopColor:this.inactiveColor}}/>
                    <stop offset={"100%"} style={{stopColor:this.inactiveColor}}/>
                </linearGradient>
            );
        }
    }
    computeScore(bbox,localPoint){
        return (localPoint.x-bbox.x)/bbox.width + this.index;
    }
    //-------------------------------------------------组件结构-------------------------------------------------
    render(){
        if(!this.isRender){
            return null;
        }
        return(
            <svg ref='parent' className={this.className} style={this.readOnly?{pointerEvents:"none"}:{}}
                 viewBox="0 0 128 128">
                <defs>
                    {this.linearGradient}
                </defs>
                <path ref="path" d={this.type==="star"?this.starPath:this.heartPath}
                      style={{fill:"url(#color-"+this.tagName+")",pointerEvents:"none"}}/>
            </svg>
        );
    }
    pointMove(e){
        super.pointMove(e);
        e.preventDefault();
        e.stopPropagation();
        let point = {};
        if(e.isMouse){
            point.x = e.clientX;
            point.y = e.clientY;
        }else if(e.isTouch){
            point.x = e.touches[0].clientX;
            point.y = e.touches[0].clientY;
        }
        this._pointMoveDelay(this.refs.path.getBBox(),SVGAddon.screen2local(this.refs.parent,point));
    }

    pointClick(e) {
        super.pointClick(e);
        e.preventDefault();
        e.stopPropagation();
        let point = {};
        if(e.isMouse){
            point.x = e.clientX;
            point.y = e.clientY;
        }else if(e.isTouch){
            point.x = e.touches[0].clientX;
            point.y = e.touches[0].clientY;
        }
        if(this.props.onScoreDecide){
            this.props.onScoreDecide(this.computeScore(this.refs.path.getBBox(),SVGAddon.screen2local(this.refs.parent,point)));
        }
    }
}