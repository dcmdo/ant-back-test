import * as THREE from 'three';
import Coroutine from 'Coroutine';
import Event from 'Event';

export default class Animation{
    constructor(object3D){
        this.declareVars(object3D);
        this.addDisposeComponent();
        this.setMixer();
        this.setCoroutine();
    }
    //----------------------------------------内部属性变量----------------------------------------
    declareVars(object3D){
        //----------私有----------
        this._object3D = object3D;
        this._mixer;// 动画混合组件
        this._actions = {};
        this._currentAction = null;
        this._coroutine;
        this._event = new Event();
    }

    // 给3D物体添加释放组件
    addDisposeComponent(){
        this.object3D._disposeComponents = this.object3D._disposeComponents || [];
        this.object3D._disposeComponents.push(this);
    }

    // 定义动画混合组件
    setMixer(){
        this._mixer = new THREE.AnimationMixer(this.object3D);

        this._mixer.addEventListener("finished",(e)=>{
            this._event.dispatchEvent({
                type:"finished",
                action:e.action
            })
        });
    }

    //定义协同组件
    setCoroutine(){
        this._coroutine = new Coroutine((deltaTime)=>{
            if(this._currentAction){
                if(this._currentAction.isRunning()){
                    this._event.dispatchEvent({
                        type: "update",
                        interpolation:this._currentAction.time / this._currentAction.getClip().duration,
                        action:this._currentAction,
                    })
                }
            }
            this._mixer.update(deltaTime);
        });
    }

    // 对象在被移除或销毁时自动释放资源，无需手动调用
    _dispose(){
        this._coroutine.stop();
        this._event.clear();
    }
    
    //----------------------------------------对外属性变量----------------------------------------
    get object3D(){
        return this._object3D;
    }

    get speed(){
        if(this._currentAction){
            return this._currentAction.timeScale;
        }
        return 0;
    }

    set speed(speed){
        if(this._currentAction){
            this._currentAction.timeScale = speed;
        }
    }

    setSpeed(name,speed){
        let action = this._actions[name];
        if(action){
            action.timeScale = speed;
        }
    }

    getSpeed(name){
        let action = this._actions[name];
        if(action){
            return  action.timeScale;
        }
        return 0;
    }

    // 手动移除动画组件
    dispose(){
        let index = this.object3D._disposeComponents.indexOf(this);
        this.object3D._disposeComponents.splice(index,1);
        this._dispose();
    }
    
    // 添加动画片段
    addClip(name,clip){
        let action = this._mixer.clipAction(clip);
        action.name = name;
        this._actions[name] = action;
        return action;
    }
    
    // 移除动画片段
    removeClip(name){
        delete this._actions[name];
    }

    get currentAction(){
        return this._currentAction;
    }

    // 获取action
    getAction(name){
        return this._actions[name];
    }
    
    // 播放动画
    play(name){
        let targetAction = this._actions[name];
        if(targetAction.loop===THREE.LoopOnce){
            targetAction.clampWhenFinished = true;
        }
        targetAction.play();
        this._coroutine.start();
        this._currentAction = targetAction;
    }
    
    // 停止动画
    stop(name){
        this._actions[name].stop();
        if(this._currentAction.name===name){
            this._currentAction = null;
            this._coroutine.stop();
        }
    }
    
    // 动画过渡
    crossFade(targetName,fadeTime){
        if(!this._currentAction){
            this.play(targetName);
            return;
        }
        if(targetName===this._currentAction.name)
            return;
        let targetAction = this._actions[targetName];
        targetAction.reset();
        this._currentAction.crossFadeTo(targetAction,fadeTime,false);
        this.play(targetName);
    }
    
    //----------------------------------------事件----------------------------------------

    // 添加更新动画
    onUpdateHandle(handle){
        this._event.addEventListener("update", handle);
    }

    // 关闭更新动画
    offUpdateHandle(handle){
        this._event.removeEventListener("update", handle);
    }

    // 添加结束动画
    onFinishedHandle(handle){
        this._event.addEventListener("finished", handle);
    }
    onceFinishedHandle(handle){
        this._event.addEventListenerOnce("finished", handle);
    }

    // 关闭结束动画
    offFinishedHandle(handle){
        this._event.removeEventListener("finished", handle);
    }
}