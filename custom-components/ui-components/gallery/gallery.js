import React from 'react';
import UIComponent from 'UIComponent';
import Animation from 'Animation';
import Button from 'Button';
import CoolMath from "CoolMath";
import './default-style/gallery.scss';

/**
 * autoPlayTime {Number} 0表示不自动播放
 * transitionTime {Number} 0.3 过渡时间
 * index {Number} 0 开始显示的编号
 * onIndexChange {Function} (lastIndex,currentIndex, component)=>{}
 * menuConfig {Object} {showArrow:true, showSteps:true}
 */
export default class Gallery extends UIComponent{
    get className(){
        let className = super.className;
        return className?className:"default-gallery";
    }
    get isRegisterEvent(){
        return UIComponent.fns.TypesCheck.isBoolean(this.props.isRegisterEvent)?this.props.isRegisterEvent:false;
    }
    get controlledProps(){
        return [...super.controlledProps,...["autoPlayTime","transitionTime","index"]]
    }

    //----------------------------------------内部属性方法----------------------------------------
    declareVars(){
        super.declareVars();
        this._anims = null;
        this._oldIndex = null;
        this._animInterval = null;
    }

    get childrenCount(){
        if(UIComponent.fns.TypesCheck.isArray(this.children)){
            return this.children.length;
        }else if(this.children){
            return 1;
        }else{
            return 0;
        }
    }
    get menuConfig(){
        return this.props.menuConfig===undefined?{}:this.props.menuConfig;
    }
    get arrows(){
        let showArrow = UIComponent.fns.TypesCheck.isBoolean(this.menuConfig.showArrow)?this.menuConfig.showArrow:true;
        return showArrow?(UIComponent.fns.constElement(this,"_arrow",false,()=>{
            return (
                <div className="gallery-manual-container" key="manual-container" style={{pointerEvents:"none",position:'absolute',width:'100%',height:'100%'}}>
                    <Button className="gallery-manual-item" extraClass="cool-icon-7" style={{pointerEvents:"auto"}} onClick={
                        UIComponent.fns.constObject(this,"_previous_click",this.last.bind(this))
                    }/>
                    <Button className="gallery-manual-item" extraClass="cool-icon-8"  style={{pointerEvents:"auto"}} onClick={
                        UIComponent.fns.constObject(this,"_next_click",this.next.bind(this))
                    }/>
                </div>
            )
        })):null;
    }
    get steps(){
        let showSteps = UIComponent.fns.TypesCheck.isBoolean(this.menuConfig.showSteps)?this.menuConfig.showSteps:true;
        if(showSteps){
            return UIComponent.fns.constElement(this,"_step",("index" in this.changedState)||("children" in this.changedState),()=>{
                let items = [];
                for(let i=0;i<this.childrenCount;i++){
                    items.push(
                        <div className={i===this.index?"gallery-step-item gallery-step-item-active":"gallery-step-item"} key={"item-"+i}
                             onClick={
                                 UIComponent.fns.constObject(this,"_index_click"+i, ()=>{this.index = i;})
                             }
                        />
                    );
                }
                return (
                    <div className="gallery-steps" key="steps" style={{pointerEvents:"auto"}}>
                        {items}
                    </div>
                )
            })
        }
        return null;
    }
    last(){
        let lastIndex = this.index-1;
        this.index = lastIndex<0?this.childrenCount-1:lastIndex;
    }
    next(){
        let nextIndex = this.index+1;
        this.index = nextIndex===this.childrenCount?0:nextIndex;
    }
    animInit(){
        try{
            delete this._anims;
            this._anims = [];
            let childNodes = UIComponent.fns.getReactDOM(this.refs.container).childNodes;
            childNodes.forEach((item,index)=>{
                item.style.opacity = 1;
                item.style.display = "";
                item.style.position = "absolute";
                let anim = Animation.to(
                    item,{
                        opacity:0,
                        display:"none"
                    },{
                        duration:this.transitionTime
                    }
                );
                if(index!==this.index)
                    Animation.sample(anim,1);
                this._anims.push(anim);
            });
            if(this._oldIndex!== this.index){
                //触发indexChange事件
                if(this.props.onIndexChange){
                    this.props.onIndexChange(this._oldIndex,this.index,this);
                }
                this._oldIndex = this.index;
            }
        }catch (ex){}
    }
    transition(){
        if(this._oldIndex!== this.index){
            Animation.playForward(this._anims[this._oldIndex]);
            Animation.playBackward(this._anims[this.index]);
            //触发indexChange事件
            if(this.props.onIndexChange){
                this.props.onIndexChange(this._oldIndex,this.index,this);
            }
            this._oldIndex = this.index;
        }
    }
    autoPlay(){
       this.delAutoPlay();
        if(this.autoPlayTime>0){
            this._animInterval = setInterval(()=>{
                this.next();
            },this.autoPlayTime*1000);
        }
    }
    delAutoPlay(){
        clearInterval(this._animInterval);
    }

    //----------------------------------------对外属性----------------------------------------
    get autoPlayTime(){
        return UIComponent.fns.TypesCheck.isNumber(this.state.autoPlayTime)?this.state.autoPlayTime:0;
    }
    set autoPlayTime(autoPlayTime){
        this.setState({autoPlayTime:autoPlayTime});
    }
    get index(){
        if(UIComponent.fns.TypesCheck.isNumber(this.state.index)){
            return CoolMath.clamp(0,this.childrenCount,this.state.index);
        }
        return 0;
    }
    set index(index){
        this.setState({index:index});
    }
    get transitionTime(){
        return this.state.transitionTime || 0.3;
    }
    set transitionTime(transitionTime){
        this.setState({transitionTime:transitionTime});
    }

    //----------------------------------------组件结构----------------------------------------
    getChildren(){
        return [
            UIComponent.fns.constElement(this,"_container",(this.statesHasChanged("children")),
                ()=>{
                    return (
                        <div className="gallery-container" key="container" ref="container">
                            {this.children}
                        </div>
                    )
                }
            )
            ,
            this.arrows,
            this.steps
        ];
    }
    stateChanged(){
        super.stateChanged();
        if(this.statesHasChanged("transitionTime","children")){
            this.animInit();
        }
        if(this.statesHasChanged("index")){
            this.transition();
        }
        if(this.statesHasChanged("autoPlayTime")){
            this.autoPlay();
        }
    }
    domMount(){
        super.domMount();
        this.animInit();
        this.autoPlay();
    }
    domUnmount(){
        super.domUnmount();
        this.delAutoPlay();
    }
}