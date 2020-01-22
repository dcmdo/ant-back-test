import React from 'react';
import UIComponent from 'UIComponent';
import Toggle from 'Toggle';
import Slider from 'Slider';
import Button from 'Button';
import Image from 'Image';
import Poster from './default-style/load.gif';
import './default-style/video-player.scss';
import FullScreen from 'FullScreen';
import Animation from 'Animation';

/**
 * src {String} url
 * srcs {Array} urls
 * poster {String} posterUrl
 * autoPlay {Boolean} false
 * showControl {Boolean} 显示控制面板
 * showClose {Boolean} 显示关闭
 * isLoop {Boolean} 是否循环
 * onQuit {Boolean} 退出事件 (tagName)=>{}
 * //以下三个属性属于私有属性，无需在意。
 * onTimeUpdate {Function} (tagName,time,isManual)=>{}
 * onAnimationForward {Function} ()=>{}
 * onAnimationBackward {Function} ()=>{}
 */
export default class VideoPlayer extends UIComponent{
    get className(){
        let className = super.className;
        return className?className:'default-video-player';
    }
    get controlledProps(){
        return [...super.controlledProps,...["src","srcs","poster"]];
    }
    awake(){
        super.awake();
        this.initTimeUpdate();
    }

    //-------------------------------------------------内部属性及方法-------------------------------------------------
    declareVars(){
        super.declareVars();
        //----------公有----------
        this.isPlay = this.autoPlay;
        //----------私有----------
        this._playButton = null;
        //声音按钮
        this._voiceButton = null;

        this._timeUpdate = null;
        this._waitingOpenTimeOut = null;
        this._toolbarAnim = null;
        this._clickPlayTimeOut = null;
        this._toolbarTimeOut = null;
    }

    initTimeUpdate(){
        let timeUpdateDelay = UIComponent.fns.throttle(()=>{
            try{
                this.setState({currentTime:this.video.currentTime});
            }catch (ex){}
        },100,{leading:false});
        this._timeUpdate=()=>{
            timeUpdateDelay();
        };
    }

    //视频组件
    get video(){
        return this.refs.video;
    }
    //视频源
    get sources(){
        return UIComponent.fns.constElement(this,"_sources",("srcs" in this.changedState),
            ()=>{
                let sources = [];
                if(UIComponent.fns.TypesCheck.isArray(this.srcs)){
                    this.srcs.forEach((item,index)=>{
                        sources.push(<source src={item} key={"source-"+index}/>)
                    })
                }
                return sources;
            }
        )
    }
    //显示控制条
    get showControl (){
        return UIComponent.fns.TypesCheck.isBoolean(this.props.showControl)?this.props.showControl:true;
    }
    //显示关闭按钮
    get showClose(){
        return UIComponent.fns.TypesCheck.isBoolean(this.props.showClose)?this.props.showClose:true;
    }
    //是否循环播放
    get isLoop(){
        return UIComponent.fns.TypesCheck.isBoolean(this.props.isLoop)?this.props.isLoop:true;
    }
    //自动播放
    get autoPlay(){
        return UIComponent.fns.TypesCheck.isBoolean(this.props.autoPlay)?this.props.autoPlay:false;
    }
    //时间转换
    timeTransfer(second){
        let s = parseInt(second);
        let m;
        let h;
        m = parseInt(s/60);
        s = parseInt(s%60).toString().padStart(2,"0");
        h = parseInt(m/60).toString().padStart(2,"0");
        m = parseInt(m%60).toString().padStart(2,"0");
        return h+":"+m+":"+s;
    }
    //内部事件
    loadedMetaData(metaData){
        this.setState({currentTime:0,duration:this.video.duration});
    }
    play_pause(tagName,isTrue,isManual){
        if(isManual){
            this.isPlay = isTrue;
        }
        if(!isTrue){
            this.video.pause();
        }else{
            if(this.video.readyState<3){
                this._playButton.isTrue = false;
                return;
            }
            this.video.play();
        }
    }
    end(){
        this.isPlay = this.autoPlay;
        if(this.isLoop){
            this.video.currentTime = 0;
        }
        this._playButton.isTrue = false;
    };
    fullScreen(){
        if(FullScreen.isFull()){
            FullScreen.off();
        }else{
            FullScreen.on(this.refs.full);
        }
    };
    sliderChange(tagName,sliderValue,step,isManual){
        if(isManual){
            this.video.currentTime = sliderValue;
            this.setState({currentTime:sliderValue});
        }
        if(this.props.onTimeUpdate){
            this.props.onTimeUpdate(tagName,sliderValue,isManual);
        }
    };
    volumeChange(tagName,sliderValue){
        try{
            this.video.volume = sliderValue;
            if(sliderValue === 0)
            {
                this._voiceButton.isTrue = false;
            }else{
                this._voiceButton.isTrue = true;
            }
        }catch (ex){}
    };
    mutedChange(tagName,isTrue){
        this.video.muted = !isTrue;
    };
    waiting(){
        if(this._waitingOpenTimeOut)
            return;
        this._playButton.isTrue = false;
        this._waitingOpenTimeOut = setTimeout(()=>{
            this.setState({waiting:true});
        },2000);
    };
    canPlay(){
        this.setState({waiting:false});
        clearTimeout(this._waitingOpenTimeOut);
        this._waitingOpenTimeOut = null;
        if(this.isPlay){
            this._playButton.isTrue = true;
        }
    };
    error(){
        this.setState({error:true});
    };
    stalled(){
        this.setState({stalled:true});
    }

    //-------------------------------------------------对外属性-------------------------------------------------
    get src(){
        return this.state.src;
    }
    set src(src){
        this.setState({src:src});
    }
    get srcs(){
        return this.state.srcs;
    }
    set srcs(srcs){
        this.setState({srcs:srcs});
    }
    get poster(){
        return this.state.poster;
    }
    set poster(poster){
        this.setState({poster:poster});
    }
    play(){
        this._playButton.isTrue = true;
        this.isPlay = true;
    }
    pause(){
        this._playButton.isTrue = false;
        this.isPlay = false;
    }
    setTime(time){
        this.video.currentTime = time;
    }
    hideControl(){
        if(this.props.onAnimationForward){
            this.props.onAnimationForward();
        }
        Animation.playForward(this._toolbarAnim);
    }
    displayControl(){
        if(this.props.onAnimationBackward){
            this.props.onAnimationBackward();
        }
        Animation.playBackward(this._toolbarAnim);
    }

    //-------------------------------------------------组件结构-------------------------------------------------
    initState() {
        let state = super.initState();
        state.currentTime = 0;
        state.duration = 0;
        state.waiting = true;
        return state;
    }
    domMount(){
        super.domMount();
        this._toolbarAnim = Animation.to(
            [this.refs.control,UIComponent.fns.getReactDOM(this.refs.close)],
            {opacity:0},
            {duration:0.5, delay:2, autoPlay:true}
        );
    }
    domDidChange(){
        super.domDidChange();
        if(this.statesHasChanged("src","srcs")){
            this.setState({currentTime:0,duration:0});
            this.waiting();
        }
    }
    getChildren(){
        return <div ref="full">
            {
                UIComponent.fns.constElement(this,"_video",(this.statesHasChanged("src","srcs","poster")),
                    ()=>{
                        return (
                            <video src={this.src} ref="video" key="video" style={{position:'absolute',left:'0',top:'0',width:'100%',height:'100%',objectFit:"contain"}}
                                   poster={this.poster} preload="auto" onLoadedMetadata={this.loadedMetaData.bind(this)}
                                   onTimeUpdate={this._timeUpdate} onWaiting={this.waiting.bind(this)} onCanPlay={this.canPlay.bind(this)}
                                   onEnded={this.end.bind(this)} onError={this.error.bind(this)} onStalled={this.stalled.bind(this)}
                                   controls = {false} webkit-playsinline="true" playsInline="true" x-webkit-airplay="allow"
                                   x5-video-player-type="h5" x5-video-player-fullscreen="false" x5-video-orientation="portraint"
                                   muted="muted"
                            >
                                {this.sources}
                            </video>
                        );
                    }
                )
            }
            {
                UIComponent.fns.constElement(this,"_wait",this.statesHasChanged("waiting"),
                    ()=>{
                        return (
                            this.state.waiting?<div style={{position:'absolute',pointerEvents:"none",left:'0',top:'0',width:'100%',height:'100%',backgroundColor:'#262626'}}>
                                <Image src={Poster} style={{position:'absolute',left:'30%',top:'30%',width:'40%',height:'40%'}}/>
                            </div>:null
                        );
                    }
                )
            }
            {
                UIComponent.fns.constElement(this,"_control",this.propsHasChanged("showControl")||this.statesHasChanged("duration","currentTime"),
                    ()=>{
                        return (
                            <div className="video-control" ref="control" key="control" style={this.showControl?{}:{display:"none"}}>
                                {
                                    UIComponent.fns.constElement(this,"_play",false,()=>{
                                        return (
                                            <Toggle className="video-play" extraClass="icon-font"
                                                    callBackComponent={(component)=>{this._playButton = component;}}
                                                    trueChild={<i className="cool-icon-17"/>}
                                                    falseChild={<i className="cool-icon-16"/>}
                                                    isTrue={false}
                                                    onValueChange={this.play_pause.bind(this)}
                                            />
                                        );
                                    })
                                }
                                <Slider className="video-progress" minValue={0} maxValue={this.state.duration} sliderValue={this.state.currentTime}
                                        stopPropagationList = {["pointClick"]}
                                        onValueChange={UIComponent.fns.constObject(this,"_progress_cahnge",this.sliderChange.bind(this))}
                                />
                                <span className="video-time">{this.timeTransfer(this.state.currentTime)+"/"+this.timeTransfer(this.state.duration)}</span>
                                {
                                    UIComponent.fns.constElement(this,"_voice",false,()=>{
                                        return (
                                            <Toggle className="video-voice" extraClass="icon-font" isTrue={true}
                                                    trueChild= {<i className="cool-icon-15"/>}
                                                    falseChild= {<i className="cool-icon-14"/>}
                                                    callBackComponent={(component)=>{this._voiceButton = component;}}
                                                    onValueChange={this.mutedChange.bind(this)}
                                            />
                                        );
                                    })
                                }
                                {
                                    UIComponent.fns.constElement(this,"_volume",false,()=>{
                                        return (
                                            <Slider className="video-volume" minValue={0} maxValue={1} sliderValue={0.5}
                                                    stopPropagationList = {["pointClick"]}
                                                    onValueChange={this.volumeChange.bind(this)}/>
                                        );
                                    })
                                }
                                {
                                    UIComponent.fns.constElement(this,"_full_screen",false,()=>{
                                        return (
                                            <Button className="video-fullscreen" extraClass="cool-icon-13" onClick={this.fullScreen.bind(this)}/>
                                        );
                                    })
                                }
                            </div>
                        )
                    }
                )
            }
            {
                UIComponent.fns.constElement(this,"_close",this.propsHasChanged("showClose"),
                    ()=>{
                        return (
                            <Button ref="close" className="close-button" extraClass = "cool-icon-30"
                                    isVisible={this.showControl&&this.showClose}
                                    onClick={UIComponent.fns.constObject(this,"_quit_click",()=>{
                                        this.isRender = false;
                                        if(this.props.onQuit){
                                            this.props.onQuit(this.props.tagName);
                                        }
                                    })}
                            />
                        );
                    }
                )
            }
            {
                UIComponent.fns.constElement(this,"_children_container",this.statesHasChanged("children"),
                    ()=>{
                        return <div className="children-container" style={{pointerEvents:"none"}}>
                            {this.children}
                        </div>
                    }
                )
            }
        </div>
    }
    pointClick(e){
        super.pointClick(e);
        e.stopPropagation();
        if(e.target===this.video){
            clearTimeout(this._clickPlayTimeOut);
            this._clickPlayTimeOut = setTimeout(()=>{
                this.isPlay = !this._playButton.isTrue;
                this._playButton.setState({isTrue:this.isPlay});
            },500);
        }
    }
    pointDoubleClick(e){
        super.pointDoubleClick(e);
        e.stopPropagation();
        if(e.target === this.video){
            clearTimeout(this._clickPlayTimeOut);
            this.fullScreen();
        }
    }
    pointEnter(e){
        super.pointEnter(e);
        this.displayControl();
        clearTimeout(this._toolbarTimeOut);
        this._toolbarTimeOut = setTimeout(()=>{
            this.hideControl();
        },5000);
    }
    pointOut(e){
        super.pointOut(e);
        clearTimeout(this._toolbarTimeOut);
        this._toolbarTimeOut = setTimeout(()=>{
            this.hideControl();
        },5000)
    }
}