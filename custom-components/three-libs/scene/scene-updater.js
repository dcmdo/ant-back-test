import Coroutine from 'Coroutine';
import throttle from "throttle";
import * as THREE from 'three';
//----------场景实时渲染刷新----------
export default class SceneUpdater{
    constructor(renderer,sceneInfos,debug=false){
        this.declareVars(renderer,sceneInfos);
        this.setCoroutine();
        this.initDebug(debug);
    }
    //----------------------------------------内部属性方法----------------------------------------
    declareVars(renderer,sceneInfos){
        //----------私有----------
        this._renderer = renderer;
        this._sceneInfos = sceneInfos || [];
        this._rendererSizeTemp = new THREE.Vector2();
        this._coroutine = null;

        this._debugDom = null;
        this._debugRate = 0;
        this._debugRateCount = 0;
        this._debugHandle = throttle(()=>{
            this._debugDom.innerText = (this._debugRate/this._debugRateCount).toFixed(1);
            this._debugRate = 0;
            this._debugRateCount = 0;
        },200,{leading:true,trailing:false});
    }

    setCoroutine(){
        this._coroutine = new Coroutine((delta)=>{
            if(this._debugDom){
                this._debugRate += 1/delta;
                this._debugRateCount += 1;
                this._debugHandle();
            }
            if(!this._renderer){
                return;
            }
            this._renderer.clear();
            this.sceneInfos.forEach((sceneInfo)=>{
                if(sceneInfo.camera.viewportParas){
                    this._renderer.setViewport(...sceneInfo.camera.viewportParas);
                }else{
                    let _size = this._renderer.getSize(this._rendererSizeTemp);
                    this._renderer.setViewport(0,0,_size.width,_size.height);
                }
                this._renderer.render(sceneInfo.scene,sceneInfo.camera);
            });
        });
        this._coroutine.start();
    }

    initDebug(debug){
        if(!debug){
            return;
        }
        this._debugDom = document.createElement("span");
        this._debugDom.style.position = "fixed";
        this._debugDom.style.backgroundColor = "black";
        this._debugDom.style.zIndex = "10000";
        this._debugDom.style.color = "white";
        document.body.appendChild(this._debugDom);
    }
    //----------------------------------------对外属性及方法----------------------------------------
    get renderer(){
        return this._renderer;
    }
    get sceneInfos(){
        return this._sceneInfos;
    }
    set sceneInfos(sceneInfos){
        this._sceneInfos = sceneInfos || [];
    }
    start(){
        this._coroutine.start();
    }
    stop(){
        this._coroutine.stop();
    }
}