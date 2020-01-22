import * as THREE from 'three';
import Event from 'Event';
import ForceOrientation from 'ForceOrientation';
import throttle from 'throttle';

export default class CameraRaycast {
    constructor(camera,renderer,domCrossEvent){
        this.declareVars(camera,renderer,domCrossEvent);
        this.setCrossEvent();
        this.setGlobalChangeEvent();
    }
    //-------------------------------------------------内部属性及方法-------------------------------------------------
    declareVars(camera,renderer,domCrossEvent){
        //----------私有----------
        this._renderer = renderer;
        this._camera = camera;
        this._domCrossEvent = domCrossEvent;
        this._canvasClientRect = ForceOrientation.orientationClientRect(
            this.renderer.domElement.getBoundingClientRect()
        );
        this._raycasyCoords = new THREE.Vector2();
        this._raycaster = new THREE.Raycaster();

        this._object3DSets = [];//检测对象集
        this._intersectSet = [];//射线相交集合
        this._intersectObjects = [];//射线相交对象集合
        this._leftDownIntersectObjects = [];//左键、单指按下时相交的集合

        this._pointMoveBind = this.pointMoveHandle.bind(this);
        this._leftPointDownHandleBind = this.leftPointDownHandle.bind(this);
        this._leftPointUpHandleBind = this.leftPointUpHandle.bind(this);
        this._globalChangeHandleDelay = throttle(()=>{
            this.globalChangeHandle();
        },100,{leading:false});
    }

    pointMoveHandle(e){
        let newIntersectSet = [];
        if(e.isMouse){
            newIntersectSet = this.detectRaycast(e);
        }else if(e.isTouch && e.touches.length===1){
            newIntersectSet = this.detectRaycast(e.touches[0]);
        }

        //已存在的相交集合
        let keepIntersectSet = [];
        let keepIntersectObjects = [];

        newIntersectSet.forEach((intersect,index)=>{
            let raycastObject = intersect.target;
            if(raycastObject._isRaycastAll || index===0){
                let keepIndex = this._intersectObjects.indexOf(raycastObject);
                //新增对象
                if(keepIndex === -1){
                    raycastObject._cameraRaycastEvent.dispatchEvent({
                        type:"pointEnter",
                        target:raycastObject,
                        intersect:intersect
                    })
                }else{//已有对象
                    raycastObject._cameraRaycastEvent.dispatchEvent({
                        type:"pointMove",
                        target: raycastObject,
                        intersect: intersect
                    });
                }
                keepIntersectSet.push(intersect);
                keepIntersectObjects.push(raycastObject);
            }
        });

        this._intersectSet.forEach((intersect)=>{
            let keepIndex = keepIntersectObjects.indexOf(intersect.target);
            if(keepIndex === -1){
                intersect.target._cameraRaycastEvent.dispatchEvent({
                    type:"pointOut",
                    target: intersect.target,
                    intersect: intersect
                });
            }
        });

        this._intersectSet = [...keepIntersectSet];
        this._intersectObjects = [...keepIntersectObjects];
    }

    leftPointDownHandle(e){
        if(e.isTouch){
            let newIntersectSet = this.detectRaycast(e.touches[0]);
            this._intersectSet = [];
            this._intersectObjects = [];
            newIntersectSet.forEach((intersect,index)=>{
                let raycastObject = intersect.target;
                if(raycastObject._isRaycastAll || index===0){
                    this._intersectSet.push(intersect);
                    this._intersectObjects.push(raycastObject);
                    raycastObject._cameraRaycastEvent.dispatchEvent({
                        type:"pointEnter",
                        target: raycastObject,
                        intersect: intersect
                    })
                }
            });
        }

        this._leftDownIntersectObjects = [];
        this._intersectSet.forEach((intersect)=>{
            this._leftDownIntersectObjects.push(intersect.target);
        });

        // 触发pointDown事件
        this._intersectSet.forEach((intersect,index)=>{
            intersect.target._cameraRaycastEvent.dispatchEvent({
                type:"pointDown",
                target:intersect.target,
                intersect:intersect
            })
        });
    }

    leftPointUpHandle(e){
        // 触发pointUp事件
        this._intersectSet.forEach((intersect,index)=>{
            intersect.target._cameraRaycastEvent.dispatchEvent({
                type:"pointUp",
                target:intersect.target,
                intersect:intersect
            });
            if(e.isTouch){
               setTimeout(()=>{
                   intersect.target._cameraRaycastEvent.dispatchEvent({
                       type:"pointOut",
                       target:intersect.target,
                       intersect:intersect
                   })
               },1);
            }
            if(this._leftDownIntersectObjects.indexOf(intersect.target) !== -1){
                intersect.target._cameraRaycastEvent.dispatchEvent({
                    type:"pointClick",
                    target:intersect.target,
                    intersect:intersect
                })
            }
        });
    }

    globalChangeHandle(e){
        this._canvasClientRect = ForceOrientation.orientationClientRect(
            this.renderer.domElement.getBoundingClientRect()
        );
    }

    // 全局尺寸及朝向改变事件添加
    setGlobalChangeEvent(){
        window.addEventListener("resize",this._globalChangeHandleDelay,{ passive: false });
        ForceOrientation.onChangeHandle(this._globalChangeHandleDelay);
    }

    // 初始化跨平台交互事件
    setCrossEvent(){
        this._domCrossEvent.addEventListener("pointMove",this._pointMoveBind);
        this._domCrossEvent.addEventListener("leftPointDown",this._leftPointDownHandleBind);
        this._domCrossEvent.addEventListener("leftPointUp",this._leftPointUpHandleBind);
    }

    // 可视及层过滤
    frustumLayerFilter(frustum,intersect){
        let res = null;
        for(let i = 0; i < intersect.length; i++){
            let _intersect = intersect[i];
            if(this._camera.layers.test(_intersect.object.layers)){
                if(frustum.containsPoint(_intersect.point)){
                    res = _intersect;
                    break;
                }
            }
        }
        return res;
    }

    /**
     * 射线检测
     * @param point
     * @returns newIntersectSet {Array}
     */
    detectRaycast(point){
        //获取摄像机视椎体
        let frustum = new THREE.Frustum().setFromMatrix(
            new THREE.Matrix4().multiplyMatrices( this._camera.projectionMatrix, this._camera.matrixWorldInverse )
        );

        let newIntersectSet = [];

        let cr = this._canvasClientRect;
        this._raycasyCoords.x = ((point.clientX - cr.x)/cr.width) * 2 - 1;
        this._raycasyCoords.y = -((point.clientY - cr.y)/cr.height) * 2 + 1;

        this._raycaster.setFromCamera(this._raycasyCoords,this.camera);

        //获取新的射线相交集合
        this._object3DSets.forEach((object3D)=>{
            if(this._camera.layers.test(object3D.layers)){
                let intersect = this._raycaster.intersectObject(object3D,true);

                if(intersect.length){
                    let _intersect = this.frustumLayerFilter(frustum,intersect);
                    if(_intersect){
                        _intersect.target = object3D;
                        newIntersectSet.push(_intersect);
                    }
                }
            }
        });
        newIntersectSet.sort((a,b)=>{
            return a.distance - b.distance;
        });

        return newIntersectSet;
    };

    _dispose(object3D){
        this.removeObject3D(object3D);
    }
    //-------------------------------------------------对外属性及方法-------------------------------------------------
    get camera(){
        return this._camera;
    }
    get renderer(){
        return this._renderer;
    }
    get domCrossEvent(){
        return this._domCrossEvent;
    }

    //添加检测对象
    addObject3D(object3D, isRaycastAll = false){
        if(this._object3DSets.indexOf(object3D)!==-1){
            console.warn("已存在需要射线检测的对象~！");
            return;
        }
        object3D._isRaycastAll = isRaycastAll;

        //给物体添加射线检测事件
        object3D._cameraRaycastEvent = new Event();
        this._object3DSets.push(object3D);

        object3D._disposeComponents = object3D._disposeComponents || [];
        object3D._disposeComponents.push(this);
    }

    //移除检测对象
    removeObject3D(object3D){
        let index = this._object3DSets.indexOf(object3D);
        if(index===-1){
            console.warn("不存在需要移除的射线检测对象~！");
            return;
        }
        this._object3DSets.splice(index,1);

        //清除附加参数
        object3D._cameraRaycastEvent.clear();
        object3D._cameraRaycastEvent = null;
        delete object3D._isRaycastAll;
        try{
            let index = object3D._disposeComponents.indexOf(this);
            object3D._disposeComponents.splice(index,1);
        }catch (e) {}
    }

    dispose(){
        for(let i = this._object3DSets.length-1; i>-1; i--){
            this._dispose(this._object3DSets[i]);
        }
        this._domCrossEvent.removeEventListener("pointMove",this._pointMoveBind);
        this._domCrossEvent.removeEventListener("leftPointDown",this._leftPointDownHandleBind);
        this._domCrossEvent.removeEventListener("leftPointUp",this._leftPointUpHandleBind);
        window.removeEventListener("resize",this._globalChangeHandleDelay);
        ForceOrientation.offChangeHandle(this._globalChangeHandleDelay);
    }

    //----------事件----------
    onPointEnterHandle(object3D,handle){
        object3D._cameraRaycastEvent.addEventListener("pointEnter",handle);
    }
    oncePointEnterHandle(object3D,handle){
        object3D._cameraRaycastEvent.addEventListenerOnce("pointEnter",handle);
    }
    offPointEnterHandle(object3D,handle){
        object3D._cameraRaycastEvent.removeEventListener("pointEnter",handle);
    }

    onPointOutHandle(object3D,handle){
        object3D._cameraRaycastEvent.addEventListener("pointOut",handle);
    }
    oncePointOutHandle(object3D,handle){
        object3D._cameraRaycastEvent.addEventListenerOnce("pointOut",handle);
    }
    offPointOutHandle(object3D,handle){
        object3D._cameraRaycastEvent.removeEventListener("pointOut",handle);
    }

    onPointDownHandle(object3D,handle){
        object3D._cameraRaycastEvent.addEventListener("pointDown",handle);
    }
    oncePointDownHandle(object3D,handle){
        object3D._cameraRaycastEvent.addEventListenerOnce("pointDown",handle);
    }
    offPointDownHandle(object3D,handle){
        object3D._cameraRaycastEvent.removeEventListener("pointDown",handle);
    }

    onPointUpHandle(object3D,handle){
        object3D._cameraRaycastEvent.addEventListener("pointUp",handle);
    }
    oncePointUpHandle(object3D,handle){
        object3D._cameraRaycastEvent.addEventListenerOnce("pointUp",handle);
    }
    offPointUpHandle(object3D,handle){
        object3D._cameraRaycastEvent.removeEventListener("pointUp",handle);
    }

    onPointMoveHandle(object3D,handle){
        object3D._cameraRaycastEvent.addEventListener("pointMove",handle);
    }
    oncePointMoveHandle(object3D,handle){
        object3D._cameraRaycastEvent.addEventListenerOnce("pointMove",handle);
    }
    offPointMoveHandle(object3D,handle){
        object3D._cameraRaycastEvent.removeEventListener("pointMove",handle);
    }

    onPointClickHandle(object3D,handle){
        object3D._cameraRaycastEvent.addEventListener("pointClick",handle);
    }
    oncePointClickHandle(object3D,handle){
        object3D._cameraRaycastEvent.addEventListenerOnce("pointClick",handle);
    }
    offPointClickHandle(object3D,handle){
        object3D._cameraRaycastEvent.removeEventListener("pointClick",handle);
    }
}