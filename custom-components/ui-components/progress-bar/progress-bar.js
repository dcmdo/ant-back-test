import React from 'react';
import UIComponent from 'UIComponent';
import CoolMath from 'CoolMath';
import './default-style/progress-bar.scss';

/**
 * progress {Number} 0-1
 * onValueChange {Function} (tagName,progress,component)=>{}
 */
export default class ProgressBar extends UIComponent{
    get className(){
        let className = super.className;
        return className?className:"default-progress-bar";
    }
    get style(){
        return {...super.style, overflow:'hidden', pointerEvents:'none'};
    }
    get controlledProps(){
        return [...super.controlledProps,...["progress"]];
    }

    //----------------------------------------内部属性方法----------------------------------------
    //计算进度条
    getProgressString(){
        let value = this.progress;
        return value*100+"%";
    }

    //-------------------------------------------------对外属性-------------------------------------------------
    get progress(){
        if(UIComponent.fns.TypesCheck.isNumber(this.state.progress)){
            this.state.progress = CoolMath.clamp(0,1,this.state.progress);
        }else{
            this.state.progress = 0;
        }
        return this.state.progress;
    }
    set progress(progress){
        this.setState({progress:progress});
    }

    //-------------------------------------------------组件结构-------------------------------------------------
    //初始化子元素
    getChildren(){
        return (
            UIComponent.fns.constElement(this,"_front",this.statesHasChanged("progress"),()=>{
                return (
                    <div className="progress-bar-front" style={{
                        width:this.getProgressString()
                    }}/>
                )
            })
        );
    }

    stateChanged() {
        super.stateChanged();
        if(this.statesHasChanged("progress")){
            if(this.props.onValueChange){
                this.props.onValueChange(this.tagName,this.progress,this)
            }
        }
    }
}
