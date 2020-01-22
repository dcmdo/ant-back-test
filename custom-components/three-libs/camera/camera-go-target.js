import * as THREE from 'three';
import Coroutine from 'Coroutine';
import TypesCheck from 'TypesCheck';

export default class CameraGoTarget {
    constructor(cameraController,duration = 1){
        this.declareVars(cameraController,duration);
        this.setCoroutine();
    }
    
    //----------------------------------------内部属性方法----------------------------------------
    declareVars(cameraController,duration = 1){
        //----------私有----------
        this._cameraController = cameraController;
        this._duration = duration;

        // 初始信息变量
        this._initialPosition = (new THREE.Vector3()).copy(this.cameraController.cameraTarget.position);
        this._initialQuaternion = (new THREE.Quaternion()).copy(this.cameraController.cameraTarget.quaternion);
        this._initialDistance = this.cameraController.distance;
        this._initialSize = this.cameraController.size;

        //当前信息变量
        this._orignalPosition = null;
        this._orignalQuaternion = null;
        this._orignalDistance = null;
        this._orignalSize = null;

        //目标信息变量
        this._targetPosition = null;
        this._targetQuaternion = null;
        this._targetDistance = null;
        this._targetSize = null;

        this._coroutine = null;
    }

    setCoroutine (){
        this._coroutine = new Coroutine((delta)=>{
            if(this._time>this.duration){
                this._coroutine.stop();
                this.cameraController.canControl = this._orignalCanControl;
                this.cameraController.dispatchChange();
                setTimeout(()=>{
                    if(this._finishHandle){
                        this._finishHandle();
                    }
                },1)
            }else{
                this._time += delta;

                let interpolation = this._isForward?this._time/this.duration:1-(this._time/this.duration);
                interpolation = THREE.Math.clamp(interpolation,0,1);
                let hasChange = false;
                let cameraTarget = this.cameraController.cameraTarget;
                if(this._targetPosition){
                    if(!this._targetPosition.equals(this._orignalPosition)){
                        cameraTarget.position.lerpVectors(
                            this._orignalPosition,this._targetPosition,interpolation
                        );
                        hasChange = true;
                    }
                }
                if(this._targetQuaternion){
                    if(!this._targetQuaternion.equals(this._orignalQuaternion)){
                        THREE.Quaternion.slerp(
                            this._orignalQuaternion,this._targetQuaternion,
                            cameraTarget.quaternion,interpolation
                        );
                        hasChange = true;
                    }
                }
                if(this.cameraController.camera.isPerspectiveCamera && TypesCheck.isNumber(this._targetDistance)){
                    if(this._targetDistance!==this._orignalDistance){
                        this.cameraController.distance = THREE.Math.lerp(
                            this._orignalDistance,this._targetDistance,interpolation
                        );
                        hasChange = true;
                    }
                }
                if(this.cameraController.camera.isOrthographicCamera && TypesCheck.isNumber(this._targetSize)){
                    if(this._targetSize!==this._orignalSize){
                        this.cameraController.size = THREE.Math.lerp(
                            this._orignalSize,this._targetSize,interpolation
                        );
                        hasChange = true;
                    }
                }
                if(!hasChange){
                    this._coroutine.stop();
                    this.cameraController.canControl = this._orignalCanControl;
                    if(this._finishHandle){
                        this._finishHandle();
                    }
                }else{
                    this.cameraController.dispatchChange();
                }
            }
        });
    }

    //----------------------------------------对外属性及方法----------------------------------------
    // 摄像机控制
    get cameraController(){
        return this._cameraController;
    }

    //持续时间
    get duration(){
        return this._duration;
    }
    set duration(duration){
        this._duration = duration || 1;
    }

    get isForward(){
        return this._isForward;
    }

    //设置目标参数
    setTarget(targetPosition,targetQuaternion,targetDistance,targetSize){
        this._orignalPosition = (new THREE.Vector3()).copy(this.cameraController.cameraTarget.position);
        this._orignalQuaternion = (new THREE.Quaternion()).copy(this.cameraController.cameraTarget.quaternion);
        this._orignalDistance = this.cameraController.distance;
        this._orignalSize = this.cameraController.size;
        this._targetPosition = targetPosition;
        this._targetQuaternion = targetQuaternion;
        this._targetDistance = targetDistance;
        this._targetSize = targetSize;
    }

    //往目标运动
    goTarget( finishHandle ){
        this._finishHandle = finishHandle;
        this._time = 0;
        this._isForward = true;
        if(!this._coroutine.isPlay){
            this._orignalCanControl = this.cameraController.canControl;
        }
        this.cameraController.canControl = false;
        this._coroutine.start();
    }

    // 返回上一位置
    goBack( finishHandle ){
        this._finishHandle = finishHandle;
        this._time = 0;
        this._isForward = false;
        if(!this._coroutine.isPlay){
            this._orignalCanControl = this.cameraController.canControl;
        }
        this.cameraController.canControl = false;
        this._coroutine.start();
    }

    // 返回初始位置
    goInitial( finishHandle ){
        this.setTarget(this._initialPosition,this._initialQuaternion,this._initialDistance,this._initialSize);
        this.goTarget( finishHandle );
    }
}