import React from 'react';
import UIComponent from 'UIComponent';
import CoolMath from 'CoolMath';
import RateSVG from './rate-svg';
import Increment from "Increment";
import './default-style/rate.scss';

const type = ["star","heart"];
const increment = new Increment();

/**
 * count {Number} 5
 * score {Number} 0
 * type {String} star heart
 * activeColor {String} #ffa032
 * inactiveColor {String} #c0c0c0
 * readOnly {Boolean} false
 * onScoreChange {Function} (tagName,score,component)=>{}
 * onScoreDecide {Function} (tagName,score,component)=>{}
 */
export default class Rate extends UIComponent{
    get className(){
        let className = super.className;
        return className?className:"default-rate";
    }
    get controlledProps(){
        return [...super.controlledProps,...["count","score","type","readOnly"]];
    }
    //-------------------------------------------------内部属性及方法-------------------------------------------------
    declareVars(){
        super.declareVars();
        // this._scoreUpdate = null;
        // this._decideScoreDelay = null;
        this._isScoreDecide = true;
        this._decideScore = this.score;
        this._oldScore = null;
        this._increment = increment.increment();
        this._scoreDelay = UIComponent.fns.throttle(()=>{
            if(this._oldScore !== this.score){
                if(this.props.onScoreChange){
                    this.props.onScoreChange(this.tagName,this.score.toFixed(2),this);
                }
                this._oldScore = this.score;
            }
            if(this._isScoreDecide){
                this._isScoreDecide = false;
                if(this.props.onScoreDecide){
                    this.props.onScoreDecide(this.tagName,this.score.toFixed(2),this);
                }
            }
        },300,{leading:false})
    }

    get activeColor(){
        return this.props.activeColor?this.props.activeColor:"#ffa032";
    }
    get inactiveColor(){
        return this.props.inactiveColor?this.props.inactiveColor:"#c0c0c0";
    }

    //-------------------------------------------------对外属性-------------------------------------------------
    get count(){
        if(!UIComponent.fns.TypesCheck.isNumber(this.state.count)){
            this.state.count = 5;
        }else{
            this.state.count = this.state.count<0?1:parseInt(this.state.count);
        }
        return this.state.count;
    }
    set count(count){
        this.setState({count:count});
    }
    get score(){
        if(!UIComponent.fns.TypesCheck.isNumber(this.state.score)){
            this.state.score = 0;
        }else{
            this.state.score = CoolMath.clamp(0,this.count,this.state.score);
        }
        return this.state.score;
    }
    set score(score){
        this.setState({score:score});
    }
    get type(){
        this.state.type = type.indexOf(this.state.type) === -1?"star":this.state.type;
        return this.state.type;
    }
    set type(type){
        this.setState({type:type});
    }
    get readOnly(){
        this.state.readOnly = UIComponent.fns.TypesCheck.isBoolean(this.state.readOnly)?this.state.readOnly:false;
        return this.state.readOnly;
    }
    set readOnly(readOnly){
        this.setState({readOnly:readOnly});
    }

    //-------------------------------------------------组件结构-------------------------------------------------
    getChildren(){
        return UIComponent.fns.constElement(this,"_svgs",this.statesHasChanged("score","count","type","readOnly"),
            ()=>{
                let svgs = [];
                for(let i=0,len=this.count;i<len;i++){
                    svgs.push(
                        <RateSVG key={"svg-"+i} tagName={this._increment+"-"+i} index={i} score={this.score} type={this.type}
                                 activeColor={this.activeColor}
                                 inactiveColor = {this.inactiveColor}
                                 readOnly = {this.readOnly}
                                 onScoreChange = {UIComponent.fns.constObject(this,"_score_change",
                                     (score)=>{
                                        this.score = score;
                                     }
                                 )}
                                 onScoreDecide = {UIComponent.fns.constObject(this,"_score_decide",
                                     (score)=>{
                                        this._isScoreDecide = true;
                                        this._decideScore = score;
                                        this.forceUpdate();
                                     }
                                 )}
                        />
                    )
                }
                return svgs;
            })
    }

    domDidChange() {
        super.domDidChange();
        this._scoreDelay();
    }

    pointOut(e) {
        super.pointOut(e);
        e.preventDefault();
        e.stopPropagation();
        if(this.score!==this._decideScore){
            this.score = this._decideScore;
        }
    }
}