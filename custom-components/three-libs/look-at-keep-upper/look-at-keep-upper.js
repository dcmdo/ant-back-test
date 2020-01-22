import * as THREE from 'three';
import Coroutine from 'Coroutine';
export default class LookAtKeepUpper {
    constructor(object3DSet,target,cameraController=null){
        this.declareVars(object3DSet,target,cameraController);
        this.initDisposeComponents();
        this.lookAt();
        this.start();
    }
    //----------------------------------------内部属性方法----------------------------------------
    declareVars(object3DSet,target,cameraController = null){
        this._start = false;
        this._object3DSet = object3DSet || [];
        this._cameraController = cameraController;
        this._target = cameraController ? cameraController.camera : target;
        this._lookAtHandle = this.lookAt.bind(this);
        this._oldPos = this._target.getWorldPosition(new THREE.Vector3());
        this._coroutine = new Coroutine(()=>{
            let currentPos = target._target.getWorldPosition(new THREE.Vector3());
            if(!this._oldPos.equals(currentPos)){
                this._oldPos = currentPos;
                this.lookAt();
            }
        });
    }

    initDisposeComponents(){
        this._object3DSet.forEach((object3D)=>{
            object3D._disposeComponents = object3D._disposeComponents || [];
            object3D._disposeComponents.push(this);
        })
    }

    _dispose(object3D){
        this.removeObject3D(object3D);
    }
    //----------------------------------------对外属性方法----------------------------------------
    addObject3D(object3D){
        if(this._object3DSet.indexOf(object3D) !== -1){
            console.warn("已存在LookAtUpper对象~！");
            return;
        }

        object3D._disposeComponents = object3D._disposeComponents || [];
        object3D._disposeComponents.push(this);

        this._object3DSet.push(object3D);
    }

    removeObject3D(object3D){
        let index = this._object3DSet.indexOf(object3D);
        if(index === -1){
            console.warn("不存在需要移除的LookAtUpper对象~！");
            return;
        }
        this._object3DSet.splice(index, 1);

        try{
            index = object3D._disposeComponents.indexOf(this);
            object3D._disposeComponents.splice(index, 1);
        }catch(e){}
    }

    start(){
        if(this._start){
            return;
        }
        if(this._cameraController){
            this._cameraController.onChangeHandle(this._lookAtHandle);
        }else{
            this._coroutine.start();
        }
        this._start = true;
    }

    stop(){
        if(!this._start){
            return;
        }
        if(this._cameraController){
            this._cameraController.offChangeHandle(this._lookAtHandle);
        }else{
            this._coroutine.stop();
        }
        this._start = false;
    }

    lookAt(){
        if(this._target && this._object3DSet){
            this._object3DSet.forEach((object)=>{
                let targetDir = this._target.getWorldPosition(new THREE.Vector3())
                    .sub(object.getWorldPosition(new THREE.Vector3()))
                    .projectOnPlane(new THREE.Vector3(0,1,0)).normalize();
                object.quaternion.setFromUnitVectors(
                    new THREE.Vector3(0,0,1),
                    targetDir
                );
            });
        }
    }

    dispose(){
        for(let i = this._object3DSet.length-1; i>-1; i--){
            this._dispose(this._object3DSet[i]);
        }
    }
}