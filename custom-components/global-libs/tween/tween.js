import Ease from '../ease/ease';
import Coroutine from 'Coroutine';
import CoolMath from 'CoolMath';
import TypesCheck from 'TypesCheck';

export default class Tween{
    /**
     * 构造函数
     * @param paras {Object} 参数见下面注释
     * 1. playType {String} 播放类型 once loop pingPong
     * 2. duration {Number} 时长
     * 3. speed {Number} 速度
     * 3. ease {Function} 可从Ease类获取
     * 4. onStart {Function} 开始播放回调 仅playType===once是有效
     * 5. onEnd {Function} 播放结束回调 仅playType===once是有效
     * 6. onUpdate {Function} 播放中回调
     */
    constructor(paras){
        this.declareVars(paras);
        this.initCoroutine();
    }
    //----------------------------------------内部属性变量----------------------------------------
    declareVars(paras){
        //----------私有----------
        this._paras = paras || {};
        this._playType = Tween.playType[this._paras.playType] || Tween.playType.once;
        this._duration = this._paras.duration > 0 ? this._paras.duration : 1;
        this._speed = TypesCheck.isNumber(paras.speed) ? paras.speed : 1;
        this._ease = this._paras.ease || Ease.none;
        this._onStart = this._paras.onStart;
        this._onEnd = this._paras.onEnd;
        this._onUpdate = this._paras.onUpdate;

        this._direction = "none";
        this._totalTime = 0;


        this._coroutine = null;
    }


    initCoroutine(){
        this._coroutine = new Coroutine((delta)=>{
            if(this._playType===Tween.playType.once){
                if(this._totalTime <= 0){
                    this._totalTime = 0;
                    if(this._direction === "forward"){
                        this.dispatchOnStart();
                        this.dispatchOnUpdate(0);
                    }else if(this._direction === "backward"){
                        this.dispatchOnUpdate(0);
                        this.dispatchOnEnd();
                        this.stop();
                    }
                }else if(this._totalTime >= this._duration){
                    this._totalTime = this._duration;
                    if(this._direction === "forward"){
                        this.dispatchOnUpdate(1);
                        this.dispatchOnEnd();
                        this.stop();
                    }else if(this._direction === "backward"){
                        this.dispatchOnStart();
                        this.dispatchOnUpdate(1);
                    }
                }else {
                    this.dispatchOnUpdate(this._totalTime / this._duration);
                }
            }else{
                if(this._playType === Tween.playType.loop){
                    if(this._direction === "forward"){
                        if(this._totalTime > this._duration){
                            this._totalTime -= this._duration;
                        }
                    }else{
                        if(this._totalTime < 0){
                            this._totalTime += this._duration;
                        }
                    }
                }else{
                    if(this._direction === "forward"){
                        if(this._totalTime >= this._duration){
                            this._direction = "backward";
                        }
                    }else{
                        if(this._totalTime <= 0){
                            this._direction = "forward";
                        }
                    }
                }
                this.dispatchOnUpdate(this._totalTime / this._duration);
            }
            if(this._direction === "forward"){
                this._totalTime += (delta * this._speed);
            }else{
                this._totalTime -= (delta * this._speed);
            }
        });
    }

    dispatchOnStart(){
        if(this._onStart){
            this._onStart();
        }
    }

    dispatchOnEnd(){
        if(this._onEnd){
            this._onEnd();
        }
    }

    dispatchOnUpdate(delta){
        if(this._onUpdate){
            this._onUpdate(this._ease(CoolMath.clamp(0,1,delta)));
        }
    }

    //----------------------------------------对外函数及属性----------------------------------------
    //是否播放
    get isPlay(){
        return this._coroutine.isPlay;
    }
    
    //----------播放速度----------
    get speed(){
        return this._speed;
    }
    set speed(speed){
        this._speed = TypesCheck.isNumber(speed) ? speed : this._speed;
    }

    //----------播放时长----------
    get duration(){
        return this._duration;
    }
    set duration(duration){
        this._duration = duration > 0? duration : 1;
    }

    //----------播放类型----------
    get playType(){
        return this._playType;
    }
    set playType(playType){
        this._playType = Tween.playType[playType] || Tween.playType.once;
    }

    //----------播放控制----------
    playForward(){
        if(this.isPlay && this._direction==="forward"){
            return;
        }
        this._direction = "forward";
        this._coroutine.start();
    }
    playBackward(){
        if(this.isPlay && this._direction==="backward"){
            return;
        }
        this._direction = "backward";
        this._coroutine.start();
    }
    play(){
        if(this.isPlay){
            return;
        }
        if(this._direction==="backward"){
            this.playBackward();
        }else{
            this.playForward();
        }
    }
    pause(){
        this._coroutine.stop();
    }
    stop(){
        this._coroutine.stop();
        this._direction = "none";
        this._totalTime = 0;
    }

    //0-1
    sample(normalTime){
        if(!this.isPlay){
            return;
        }
        let _normalTime = CoolMath.clamp(0,1,normalTime);
        this._totalTime = this._duration * _normalTime;
        this.dispatchOnUpdate(_normalTime);
    }
}

Tween.ease = Ease;
Tween.playType = {
    once:"once",
    loop:"loop",
    pingPong:"pingPong"
};
