import * as THREE from 'three';
import Event from 'Event';
import CameraRaycast from '../camera/camera-raycast';

export default class Drag {
    constructor(camera,renderer,domCrossEvent){
        this.declareVars(camera,renderer,domCrossEvent);
    }
    //----------------------------------------内部属性方法----------------------------------------
    declareVars(camera,renderer,domCrossEvent){
        this._cameraRaycast = new CameraRaycast(camera,renderer,domCrossEvent);
        // 平面射线检测
        this._raycastPlane = new THREE.Plane();
        // 拖动的目标物体
        this._dragTarget = null;
        this._dragMatrix = new THREE.Matrix4();
        this._dragOrignalPoint = new THREE.Vector3();
        this._dragCurrentPoint = new THREE.Vector3();
        this._dragOffset = new THREE.Vector3();
        this._event = new Event();
        // 事件绑定函数
        this._leftPointDownHandleBind = this.leftPointDownHandle.bind(this);
        this._leftPointMoveHandleBind = this.leftPointMoveHandle.bind(this);
        this._leftPointUpHandleBind = this.leftPointUpHandle.bind(this);
    }

    leftPointDownHandle(raycastEvent){
        this._dragTarget = raycastEvent.target;
        this._dragMatrix.getInverse(this._dragTarget.parent.matrixWorld);
        this._dragOrignalPoint.copy(raycastEvent.intersect.point).applyMatrix4(this._dragMatrix);

        // 设置射线检测平面
        this._raycastPlane.setFromNormalAndCoplanarPoint(
            this.camera.getWorldDirection(new THREE.Vector3()),
            raycastEvent.intersect.point
        );
        let _event = {
            type:"dragStart",
            target:this._dragTarget
        };
        this._event.dispatchEvent(_event);
        this._dragTarget._dragEvent.dispatchEvent(_event);
        this.domCrossEvent.addEventListener("pointOut",this._leftPointUpHandleBind);
        this.domCrossEvent.addEventListener("leftPointMove",this._leftPointMoveHandleBind);
        this.domCrossEvent.addEventListener("leftPointUp",this._leftPointUpHandleBind);
    }

    leftPointMoveHandle(event){
        if(!this._dragTarget){
            return;
        }
        this.dragMove();
        let _event = {
            type:"dragging",
            target:this._dragTarget
        };
        this._event.dispatchEvent(_event);
        this._dragTarget._dragEvent.dispatchEvent(_event);
    }

    leftPointUpHandle(event){
        if(!this._dragTarget){
            return;
        }
        this.domCrossEvent.removeEventListener("leftPointMove",this._leftPointMoveHandleBind);
        this.domCrossEvent.removeEventListener("leftPointUp",this._leftPointUpHandleBind);
        this.domCrossEvent.removeEventListener("pointOut",this._leftPointUpHandleBind);
        let _event = {
            type:"dragEnd",
            target:this._dragTarget
        };
        this._event.dispatchEvent(_event);
        this._dragTarget._dragEvent.dispatchEvent(_event);
        this._dragTarget = null;
    }

    dragMove(){
        this._cameraRaycast._raycaster.ray.intersectPlane(
            this._raycastPlane,this._dragCurrentPoint
        );
        this._dragCurrentPoint.applyMatrix4(this._dragMatrix);
        this._dragOffset.subVectors(this._dragCurrentPoint,this._dragOrignalPoint);
        this._dragOrignalPoint.copy(this._dragCurrentPoint);
        let dragArgs = this._dragTarget._dragArgs;
        // 自由拖动
        if(dragArgs){
            // 沿向量拖动
            if(dragArgs.length>1){
                let axis = dragArgs[0].clone();
                // 局部空间
                if(dragArgs[1]){
                    axis.transformDirection(new THREE.Matrix4().getInverse(this._dragTarget.matrixWorld));
                }
                axis.transformDirection(this._dragMatrix);
                this._dragOffset.projectOnVector(axis);
            }else{// 沿平面移动
                let normal = dragArgs[0].clone();
                normal.transformDirection(this._dragMatrix);
                this._dragOffset.projectOnPlane(normal);
            }
        }
        this._dragTarget.position.add(this._dragOffset);
    }

    _dispose(object3D){
        this.removeObject3D(object3D);
    }

    //----------------------------------------对外属性方法----------------------------------------
    get camera(){
        return this._cameraRaycast.camera;
    }
    get renderer(){
        return this._cameraRaycast.renderer;
    }
    get domCrossEvent(){
        return this._cameraRaycast.domCrossEvent;
    }
    get dragTarget(){
        return this._dragTarget;
    }

    /**
     * 添加拖拽物体
     * @param object3D
     */
    addObject3D(object3D){
        // 初始化拖拽事件
        object3D._dragEvent = new Event();
        // 添加自动释放
        object3D._disposeComponents = object3D._disposeComponents || [];
        object3D._disposeComponents.push(this);
        //添加射线检测及按下事件
        this._cameraRaycast.addObject3D(object3D);
        this._cameraRaycast.onPointDownHandle(object3D,this._leftPointDownHandleBind);
    }

    /**
     * 配置拖拽
     * @param object3D
     * @param args
     * 如果是自由拖拽则args为null或者undefined
     * 如果是沿轴拖拽则args为(axis:vector3,isLocal:false)
     * 如果是沿面拖拽则args为(normal:vector3)
     */
    confgDrag(object3D,...args){
        if(this._cameraRaycast._object3DSets.indexOf(object3D)===-1){
            console.warn("请先添加可拖拽物体，再配置拖动参数！");
            return;
        }
        object3D._dragArgs = args;
    }

    /**
     * 移除拖拽物体
     * @param object3D
     */
    removeObject3D(object3D){
        delete object3D._dragArgs;
        object3D._dragEvent.clear();
        object3D._dragEvent = null;
        try{
            let index = object3D._disposeComponents.indexOf(this);
            object3D._disposeComponents.splice(index,1);
        }catch (e) {}
        this._cameraRaycast.removeObject3D(object3D);
    }

    // 停止拖拽
    stop(){
        this.leftPointUpHandle({});
    }

    // 释放拖拽功能模块
    dispose(){
        for(let i = this._cameraRaycast._object3DSets.length-1; i>-1; i--){
            this._dispose(this._cameraRaycast._object3DSets[i]);
        }
        this._event.clear();
        this._event = null;
    }
    
    //----------------------------------------添加事件----------------------------------------
    onDragStartHandle(object3D,handle){
        if(object3D){
            object3D._dragEvent.addEventListener("dragStart",handle);
        }else{
            this._event.addEventListener("dragStart",handle)
        }
    }
    onceDragStartHandle(object3D,handle){
        if(object3D){
            object3D._dragEvent.addEventListenerOnce("dragStart",handle);
        }else{
            this._event.addEventListenerOnce("dragStart",handle);
        }
    }
    offDragStartHandle(object3D,handle){
        if(object3D){
            object3D._dragEvent.removeEventListener("dragStart",handle);
        }else{
            this._event.removeEventListener("dragStart",handle);
        }
    }

    onDraggingHandle(object3D,handle){
        if(object3D){
            object3D._dragEvent.addEventListener("dragging",handle);
        }else{
            this._event.addEventListener("dragging",handle);
        }
    }
    onceDraggingHandle(object3D,handle){
        if(object3D){
            object3D._dragEvent.addEventListenerOnce("dragging",handle);
        }else{
            this._event.addEventListenerOnce("dragging",handle);
        }
    }
    offDraggingHandle(object3D,handle){
        if(object3D){
            object3D._dragEvent.removeEventListener("dragging",handle);
        }else{
            this._event.removeEventListener("dragging",handle);
        }
    }

    onDragEndHandle(object3D,handle){
        if(object3D){
            object3D._dragEvent.addEventListener("dragEnd",handle);
        }else{
            this._event.addEventListener("dragEnd",handle);
        }
    }
    onceDragEndHandle(object3D,handle){
        if(object3D){
            object3D._dragEvent.addEventListenerOnce("dragEnd",handle);
        }else{
            this._event.addEventListenerOnce("dragEnd",handle);
        }
    }
    offDragEndHandle(object3D,handle){
        if(object3D){
            object3D._dragEvent.removeEventListener("dragEnd",handle);
        }else{
            this._event.removeEventListener("dragEnd",handle);
        }
    }
}