import React from 'react';
import UIComponent from 'UIComponent';
import './default-style/bubble.scss';

// 箭头方向的可用集合
const dirArray = ["left","right","top","bottom"];

/**
 * 气泡弹出组件
 * arrowDir {String} 箭头方向 left,right,top,bottom
 * arrowPosOffset {String} 箭头位置偏移 0rem
 * arrowColor {String} 箭头颜色 #2C3E50
 * arrowSize {String} 箭头尺寸 1rem
 */
export default class Bubble extends UIComponent{
    get className(){
        let className = super.className;
        return className?className:"default-bubble";
    }
    get isRegisterEvent(){
        return false;
    }
    get controlledProps(){
        return [...super.controlledProps,...["arrowDir","arrowPosOffset","arrowColor","arrowSize"]];
    }

    //----------------------------------------内部属性及变量----------------------------------------
    // svg箭头样式
    get svgStyle(){
        let size = UIComponent.fns.splitCssValue(this.arrowSize);
        let style = {
            position:"absolute",
            fill:this.arrowColor
        };
        switch (this.arrowDir){
            case "left":
                style.top = this.arrowPosOffset;
                style.right = "100%";
                style.width = size[0]/2+size[1];
                style.height = size[0]+size[1];
                break;
            case "right":
                style.top = this.arrowPosOffset;
                style.left = "100%";
                style.width = size[0]/2+size[1];
                style.height = size[0]+size[1];
                break;
            case "top":
                style.left = this.arrowPosOffset;
                style.bottom = "100%";
                style.width = size[0]+size[1];
                style.height = size[0]/2+size[1];
                break;
            case "bottom":
                style.left = this.arrowPosOffset;
                style.top = "100%";
                style.width = size[0]+size[1];
                style.height = size[0]/2+size[1];
                break;
        }
        return style;
    }

    //----------------------------------------对外属性及变量----------------------------------------
    //----------箭头方向----------
    get arrowDir(){
        return dirArray.indexOf(this.state.arrowDir)!==-1?this.state.arrowDir:"left";
    }
    set arrowDir(arrowDir){
        this.setState({arrowDir:arrowDir});
    }
    
    //----------箭头位置偏移----------
    get arrowPosOffset(){
        return this.state.arrowPosOffset || "0.5rem";
    }
    set arrowPosOffset(arrowPosOffset){
        this.setState({arrowPosOffset:arrowPosOffset});
    }
    
    //----------箭头颜色----------
    get arrowColor(){
        return this.state.arrowColor?this.state.arrowColor:"#2C3E50";
    }
    set arrowColor(arrowColor){
        this.setState({arrowColor:arrowColor});
    }
    
    //----------箭头尺寸----------
    get arrowSize(){
        return this.state.arrowSize || "1rem";
    }
    set arrowSize(arrowSize){
        return this.setState({arrowSize:arrowSize});
    }

    //-------------------------------------------------组件结构生命周期-------------------------------------------------
    // 箭头组件
    get arrow(){
        switch (this.arrowDir){
            case "left":
                return <polygon points="0,0.5 1,0 1,1"/>;
            case "right":
                return <polygon points="1,0.5 0,1 0,0"/>;
            case "top":
                return <polygon points="0.5,0 0,1 1,1"/>;
            case "bottom":
                return <polygon points="0,0 1,0 0.5,1"/>;
        }
    }

    // 组件结构
    getChildren(){
        return <React.Fragment>
            {
                UIComponent.fns.constElement(this,"_children",this.statesHasChanged("children"),
                    ()=>{
                    return <div className="container">{this.children}</div>;
                })
            }
            {
                UIComponent.fns.constElement(this,"_arrow",this.statesHasChanged("arrowDir","arrowPos","arrowColor","arrowSize"),
                    ()=>{
                        return (
                            <svg viewBox="0,0,1,1" style={this.svgStyle}
                                 preserveAspectRatio="none"
                                 className="arrow"
                            >
                                {this.arrow}
                            </svg>
                        )
                    })
            }
        </React.Fragment>
    }
}