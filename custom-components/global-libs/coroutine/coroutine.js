import Increment from 'Increment';

const increment = new Increment();
const coroutineSet = [];
let _last = performance.now();
const update = ()=>{
    let _now = performance.now();
    let _interval = _now - _last;
    if(_interval>100){
        _interval = 16.7;
    }
    _interval/=1000;
    coroutineSet.forEach((coroutine)=>{
        coroutine.update(_interval);
    });
    requestAnimationFrame(update);
    _last = _now;
};
const play = (coroutine)=>{
    if(coroutineSet.indexOf(coroutine)!==-1){
        return;
    }
    coroutineSet.push(coroutine);
    coroutineSet.sort((a,b)=>{
        return a._orderID - b._orderID;
    });
};
const stop = (coroutine)=>{
    let index = coroutineSet.indexOf(coroutine);
    if(index===-1){
        return;
    }
    coroutineSet.splice(index,1);
};

update();

export default class Coroutine {
    //updateCallback:(delta)=>{}
    constructor(updateCallback){
        this.declareVars(updateCallback);
    }

    //----------------------------------------内部属性及方法----------------------------------------
    //声明变量
    declareVars(updateCallback){
        //更新回调
        this._updateCallback = updateCallback;
        //排序值
        this._orderID = increment.increment();
    }

    update(deltaTime){
        this._updateCallback(deltaTime);
    }

    //----------------------------------------对外属性及方法----------------------------------------
    //是否播放
    get isPlay(){
        return coroutineSet.indexOf(this)!==-1;
    }

    //----------播放控制----------
    start(){
        play(this);
    }

    stop(){
        stop(this);
    }
    
    //----------静态协成控制----------
    static startCoroutine(updateCallback){
        let coroutine = new Coroutine(updateCallback);
        coroutine.start();
        return coroutine;
    }
    static stopCoroutine(coroutine){
        coroutine.stop();
    }
}