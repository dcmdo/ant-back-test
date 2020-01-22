import Tween from 'Tween';

export default class RippleTween {
    /**
     * 构造函数
     * @param paras {Object} 参数见下面注释
     * 1. playType {String} 播放类型 once loop pingPong
     * 2. duration {Number} 播放时长 1
     * 3. ease {Function} 可从Ease类获取
     * 4. rippleCount {Number} 涟漪数
     * 5. onUpdate {Function} 播放中回调 (rippleIndex, delta)=>{}
     */
    constructor(paras){
        this.declareVars(paras);
        this.initTween();
        this.setRippleTimes();
    }

    //----------------------------------------内部属性变量----------------------------------------
    declareVars(paras){
        //----------私有----------
        this._rippleCount = paras.rippleCount || 3;
        this._tweenParas = {
            playType: paras.playType || RippleTween.playType.loop,
            duration: paras.duration,
            ease:paras.ease,
            onUpdate:(delta)=>{
                this.updateHandle(delta);
            }
        };
        this._tween = null;
        this._rippleTimes = null;
        this._onUpdate = paras.onUpdate;
    }

    initTween(){
        this._tween = new Tween(this._tweenParas);
    }

    setRippleTimes(){
        this._rippleTimes = [];
        for(let i = 0; i < this._rippleCount; i++){
            this._rippleTimes.push(i/this._rippleCount);
        }
    }

    updateHandle(delta){
        this._rippleTimes.forEach((time, index)=>{
            let _delta = time + delta;
            if(_delta > 1){
                _delta -= 1;
            }
            this.dispatchOnUpdate(index,_delta);
        })
    }

    dispatchOnUpdate(rippleIndex, delta){
        if(this._onUpdate){
            this._onUpdate(rippleIndex,delta);
        }
    }

    //----------------------------------------对外属性方法----------------------------------------
    get isPlay(){
        return this._tween.isPlay;
    }

    get duration(){
        return this._tween.duration;
    }

    set duration(duration){
        this._tween.duration = duration;
    }

    //----------播放类型----------
    get playType(){
        return this._tween.playType;
    }
    set playType(playType){
        this._tween.playType = playType;
    }

    get rippleCount(){
        return this._rippleCount;
    }

    set rippleCount(rippleCount){
        this._rippleCount = rippleCount || this._rippleCount;
    }


    //----------播放控制----------
    playForward(){
        this._tween.playForward();
    }
    playBackward(){
        this._tween.playBackward();
    }
    play(){
        this._tween.play();
    }

    pause(){
        this._tween.pause();
    }

    stop(){
        this._tween.stop();
        this.setRippleTimes();
    }
}
RippleTween.ease = Tween.ease;
RippleTween.playType = Tween.playType;