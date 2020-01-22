import React from 'react';
import UIComponent from 'UIComponent';
import Button from 'Button';
import './default-style/drag-window.scss';

/**
 * title
 * onClose
 * isLimitParent
 * canDrag
 */
export default class DragWindow extends UIComponent{
    get className(){
        let className = super.className;
        return className?className:"default-drag-window";
    }
    get style(){
        return {...super.style, position : 'absolute'};
    }
    get controlledProps(){
        return [...super.controlledProps,...["title","canDrag"]];
    }

    awake() {
        super.awake();
        this.initDragHandle();
    }
    //-------------------------------------------------内部方法-------------------------------------------------
    declareVars(){
        super.declareVars();
        this._dragEventAdded = false;
        this._startPos = null;
        this._rectPos = null;
        this._endPos = null;
        this._movePos = null;
        this._dragEvent = null;
        this._windowDragEvent = null;
        this._dragStart = null;
        this._dragging = null;
        this._dragEnd = null;
        this._limitRange = null;//{minX,maxX,minY,maxY}
        this._startWindowRange = null;//{minX,maxX,minY,maxY}
    }

    initDragHandle(){
        this._dragStart = (e)=>{
            let limitRect = null;
            if(this.isLimitParent){
                limitRect = UIComponent.fns.getBoundingClientRect( this.refs.parent.parentNode );
            }else{
                limitRect = UIComponent.fns.getBoundingClientRect( document.body );
            }

            if(limitRect){
                this._limitRange = {
                    minX:limitRect.x,
                    maxX:limitRect.x+limitRect.width,
                    minY:limitRect.y,
                    maxY:limitRect.y+limitRect.height
                };
            }else{
                this._limitRange = null;
            }

            let windowRect = UIComponent.fns.getBoundingClientRect(this.refs.parent);
            if(windowRect){
                this._startWindowRange = {
                    minX:windowRect.x,
                    maxX:windowRect.x+windowRect.width,
                    minY:windowRect.y,
                    maxY:windowRect.y+windowRect.height
                };
            }else{
                this._startWindowRange = null;
            }

            if(e.isMouse){
                this._startPos = {x:e.pageX,y:e.pageY};
            }else if(e.isTouch){
                this._startPos = {x:e.touches[0].pageX,y:e.touches[0].pageY}
            }
            this._rectPos = {left:this.refs.parent.offsetLeft,top:this.refs.parent.offsetTop};
            this._endPos = this._startPos;
            this._movePos = {x:0,y:0};
            this._windowDragEvent.start();
        };
        this._dragging = (e)=>{
            if(e.isMouse){
                this._endPos = {x:e.pageX,y:e.pageY};
            }else if(e.isTouch){
                this._endPos = {x:e.touches[0].pageX,y:e.touches[0].pageY}
            }
            this._movePos = {x:this._endPos.x-this._startPos.x,y:this._endPos.y-this._startPos.y};
            if(this._limitRange && this._startWindowRange){
                let windowRange = {
                    minX:this._startWindowRange.minX + this._movePos.x,
                    maxX:this._startWindowRange.maxX + this._movePos.x,
                    minY:this._startWindowRange.minY + this._movePos.y,
                    maxY:this._startWindowRange.maxY + this._movePos.y
                };
                if(windowRange.minX < this._limitRange.minX){
                    this._movePos.x += (this._limitRange.minX - windowRange.minX);
                }else if(windowRange.maxX > this._limitRange.maxX){
                    this._movePos.x -= (windowRange.maxX - this._limitRange.maxX);
                }
                if(windowRange.minY < this._limitRange.minY){
                    this._movePos.y += (this._limitRange.minY - windowRange.minY);
                }else if(windowRange.maxY > this._limitRange.maxY){
                    this._movePos.y -= (windowRange.maxY - this._limitRange.maxY);
                }
            };
            this.refs.parent.style.transform = "translate("+this._movePos.x+"px,"+this._movePos.y+"px)";
        };
        this._dragEnd = (e)=>{
            this.refs.parent.style.left = UIComponent.fns.convertToRem(this._rectPos.left+this._movePos.x)+"rem";
            this.refs.parent.style.top = UIComponent.fns.convertToRem(this._rectPos.top+this._movePos.y)+"rem";
            this.refs.parent.style.transform = "";
            this._windowDragEvent.end();
        };
    }
    //----------添加拖动事件----------
    addDragEvent(){
        if(this._dragEventAdded)
            return;
        if(!this.isRender)
            return;
        this._dragEventAdded = true;
        let eventType = UIComponent.fns.DOMCrossPlatformEvent.eventType;
        this._dragEvent = UIComponent.fns.DOMCrossPlatformEvent.createEvent(this.refs.parent);
        this._dragEvent.addEventListener(eventType.leftPointDown,this._dragStart);
        this._dragEvent.start();
        this._windowDragEvent = UIComponent.fns.DOMCrossPlatformEvent.createEvent(window);
        this._windowDragEvent.addEventListener(eventType.leftPointMove,this._dragging);
        this._windowDragEvent.addEventListener(eventType.leftPointUp,this._dragEnd);
    }
    //----------移除拖动事件----------
    removeDragEvent(){
        if(!this._dragEventAdded)
            return;
        if(!this.isRender)
            return;
        this._dragEventAdded = false;
        this._dragEvent.dispose();
        this._windowDragEvent.dispose();
        this._dragEvent = null;
        this._windowDragEvent = null;
    }

    get isLimitParent(){
        return this.props.isLimitParent === false ? false : true;
    }
    //-------------------------------------------------对外属性-------------------------------------------------
    get title(){
        return this.state.title;
    }
    set title(title){
        this.setState({title:title});
    }
    get canDrag(){
        this.state.canDrag = UIComponent.fns.TypesCheck.isBoolean(this.state.canDrag)?this.state.canDrag:false;
        return this.state.canDrag;
    }
    set canDrag(canDrag){
        this.setState({canDrag:canDrag});
    }

    //-------------------------------------------------组件结构-------------------------------------------------
    getChildren(){
        return [
            UIComponent.fns.constElement(this,"_title",this.statesHasChanged("isVisible","title"),()=>{
                return (
                    <div className="title" key="title">
                        <span className="title-text">{this.title}</span>
                        <Button className="close" extraClass="cool-icon-30"
                                onClick={
                                    UIComponent.fns.constObject(this,"_close_click",()=>{
                                        this.isVisible = false;
                                        if(this.props.onClose)
                                            this.props.onClose();
                                    })
                                }
                        />
                    </div>
                )
            }),
            UIComponent.fns.constElement(this,"_container",this.statesHasChanged("children"),()=>{
                return <div className="container" key="container">{this.children}</div>
            })
        ];
    }
    domDidChange(){
        super.domDidChange();
        if(this.canDrag){
            this.addDragEvent();
        }else{
            this.removeDragEvent();
        }
    }
    domMount(){
        super.domMount();
        if(this.canDrag){
            this.addDragEvent();
        }
    }
    domUnmount(){
        super.domUnmount();
        if(this.canDrag){
            this.removeDragEvent();
        }
    }
}