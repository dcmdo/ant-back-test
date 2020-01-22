import * as THREE from 'three';
import TypesCheck from 'TypesCheck';
import Coroutine from 'Coroutine';
import Event from 'Event';

/**
 * paras说明
 * //----------透视摄像机参数----------
 * minDistance {Number} >0 最小距离
 * maxDistance {Number} >0 最大距离
 * distance {Number} >0 初始化距离 不赋值时等于 (minDistance + maxDistance) * 0.5;
 *
 * //----------正交摄像机参数----------
 * minSize {Number} >0 最小尺寸
 * maxSize {Number} >0 最大尺寸
 * size {Number} >0 当前尺寸
 *
 * //----------通用参数----------
 * canControl {Boolen} 是否可控制
 * canMove {Boolen} 是否可平移
 * canRotate {Boolen} 是否可旋转
 * canZoom {Boolen} 是否可缩放
 * canSmoothRotate {Boolen} 是否平滑旋转
 * hRotateRange {[-PI,PI]} 旋转的水平范围
 * vRotateRange {[0,PI]} 旋转的垂直范围
 */
export default class CameraController {
    constructor(camera,paras){
        if(!camera.viewport){
            console.error("" +
                "摄像机不包含viewport等关键信息，会导致部分功能不可用~！" +
                "请使用CameraWrap创建摄像机~！");
            return;
        }
        this.declareVars(camera,paras);
        this.setCameraInfo();
        this.setCameraTarget();
        this.setSmoothRotateCoroutine();
        this.setZoomCoroutine();
    }
    //----------------------------------------内部属性方法----------------------------------------
    declareVars(camera,paras){
        //----------私有----------
        this._camera = camera;
        this._cameraTarget = null;
        this._paras = paras?paras:{};
        this._event = new Event();

        this._canDoHandle = {
            move:this.canMove,
            rotate:this.canRotate,
            zoom:this.canZoom
        };
        
        this._startZoomDistance = this.distance;// 透视相机初始距离
        this._startZoomSize = this.size;// 正交相机初始屏幕尺寸

        this._spherical = new THREE.Spherical();// 球坐标

        // 旋转相关变量
        this._rotateSpeed = 0;// 根据屏幕尺寸决定旋转速度
        this._rotStartPoint = [0,0];// 旋转的开始坐标
        this._rotCurPoint = [0,0];// 旋转的当前坐标

        this._rotSmoothStartTime = 0;// 平滑旋转的开始时间
        this._rotSmoothTargetSpeed = [0,0];// 平滑旋转的目标速度
        this._rotSmoothCurrentSpeed = [0,0];// 平滑旋转的当前速度
        this._rotSmoothTag = [1,1];// 平滑旋转的阶段标识 -1表示降速，1表示升速
        this._smoothRotateCoroutine = null;

        // 缩放相关变量
        this._orignalZoom = null;
        this._targetZoom = null;
        this._zoomTime = 0;
        this._zoomStartLength = 0;
        this._zoomCoroutine = null;

        // 平移
        this._moveStartPoint = [0,0];// 开始平移时的坐标
        this._moveCurPoint = [0,0];// 当前平移时的坐标
    }

    // 设置摄像机信息
    setCameraInfo(){
        this.camera.name = "camera";
        this.camera.matrix.copy(new THREE.Matrix4());
        this.camera.updateMatrix();
        this.camera.position.z = this.distance;
        if(!this.isPerspectiveCamera){
            this.size = this.size;
        }
    }

    // 给3D物体添加释放组件
    addDisposeComponent(){
        this.cameraTarget._disposeComponents = this.cameraTarget._disposeComponents || [];
        this.cameraTarget._disposeComponents.push(this);
    }

    // 设置摄像机目标点
    setCameraTarget(){
        this._cameraTarget = new THREE.Group();
        this._cameraTarget.name = "camera-target";
        this._cameraTarget.add(this.camera);
        this.addDisposeComponent();
    }

    // 设置平滑旋转的协同程序
    setSmoothRotateCoroutine(){
        this._smoothRotateCoroutine = new Coroutine((interval)=>{
            if(!this.canRotate){
                this._rotSmoothCurrentSpeed = [0,0];
                this._smoothRotateCoroutine.stop();
                return;
            }

            let upSpeed = interval * Math.PI * 2;
            let downSpeed = interval * Math.PI * 0.5;

            for(let i=0;i<2;i++){
                let tag = this._rotSmoothTag[i];
                if(tag===1){
                    if(this._rotSmoothTargetSpeed[i]<0){
                        this._rotSmoothCurrentSpeed[i] -= upSpeed;
                        if(this._rotSmoothCurrentSpeed[i]<this._rotSmoothTargetSpeed[i]){
                            this._rotSmoothCurrentSpeed[i] = this._rotSmoothTargetSpeed[i];
                            this._rotSmoothTag[i] = -1;
                        }
                    }else if(this._rotSmoothTargetSpeed[i]>0){
                        this._rotSmoothCurrentSpeed[i] += upSpeed;
                        if(this._rotSmoothCurrentSpeed[i]>this._rotSmoothTargetSpeed[i]){
                            this._rotSmoothCurrentSpeed[i] = this._rotSmoothTargetSpeed[i];
                            this._rotSmoothTag[i] = -1;
                        }
                    }
                }else{
                    if(this._rotSmoothCurrentSpeed[i]<0){
                        this._rotSmoothCurrentSpeed[i] += downSpeed;
                        if(this._rotSmoothCurrentSpeed[i]>=0){
                            this._rotSmoothCurrentSpeed[i] = 0;
                            this._rotSmoothTargetSpeed[i] = 0;
                        }
                    }else if(this._rotSmoothCurrentSpeed[i]>0){
                        this._rotSmoothCurrentSpeed[i] -= downSpeed;
                        if(this._rotSmoothCurrentSpeed[i]<=0){
                            this._rotSmoothCurrentSpeed[i] = 0;
                            this._rotSmoothTargetSpeed[i] = 0;
                        }
                    }
                }
            }
            if(this._rotSmoothCurrentSpeed[0]===0 && this._rotSmoothCurrentSpeed[1]===0){
                this._smoothRotateCoroutine.stop();
            }else{
                this.rotateHandle([
                    this._rotSmoothCurrentSpeed[0]*interval,
                    this._rotSmoothCurrentSpeed[1]*interval
                ]);
            }
        });
    }

    // 设置缩放的协同程序
    setZoomCoroutine(){
        this._zoomCoroutine = new Coroutine((interval)=>{
            this._zoomTime += interval * 3;
            if(this._zoomTime < 1){
                if(this.isPerspectiveCamera){
                    this.distance = THREE.Math.lerp(this._orignalZoom,this._targetZoom,this._zoomTime);
                }else{
                    this.size = THREE.Math.lerp(this._orignalZoom,this._targetZoom,this._zoomTime);
                }
                this.dispatchChange();
            }else{
                this._zoomCoroutine.stop();
            }
        });
    }

    // 旋转的处理函数
    rotateHandle(rotateDelta){
        let hRotateRange = this.hRotateRange;
        let vRotateRange = this.vRotateRange;
        let camPos = this.camera.getWorldPosition(new THREE.Vector3());
        let targetPos = this.cameraTarget.getWorldPosition(new THREE.Vector3());
        this._spherical.setFromVector3(camPos.sub(targetPos));
        this._spherical.theta = THREE.Math.clamp(this._spherical.theta-rotateDelta[0],hRotateRange[0],hRotateRange[1]);
        this._spherical.phi = THREE.Math.clamp(this._spherical.phi-rotateDelta[1],vRotateRange[0],vRotateRange[1]);
        this._spherical.makeSafe();
        let lookAtPos = new THREE.Vector3().setFromSpherical(this._spherical).add(targetPos);
        this.cameraTarget.lookAt(lookAtPos);
        this.cameraTarget.updateMatrixWorld(true);
        this.dispatchChange();
    }

    // 平滑旋转的处理函数
    smoothRotateHandle(){
        this._smoothRotateCoroutine.start();
    }

    //平移的处理函数
    moveHandle(moveDelta){
        let viewportParas = this.camera.viewportParas;
        let width = viewportParas[2];
        let height = viewportParas[3];
        let moveX=0;
        let moveY=0;
        if(this.isPerspectiveCamera){
            let tan = Math.tan(THREE.Math.degToRad(this.camera.fov*0.5))*this.distance;
            moveX = -2 * moveDelta[0] * tan / height;
            moveY = 2 * moveDelta[1] * tan / height;
        }else{
            let ratio = this.size / (width > height ? height : width);
            moveX = -moveDelta[0] * ratio;
            moveY = moveDelta[1] * ratio;
        }
        let transDir = new THREE.Vector3(moveX,moveY,0);
        let distance = transDir.length();
        transDir.normalize();
        this.cameraTarget.translateOnAxis(transDir,distance);
        this.dispatchChange();
    }

    // 鼠标缩放的处理函数
    mouseZoomHandle(orignal,target){
        this._orignalZoom = orignal;
        this._targetZoom = target;
        this._zoomTime = 0;
        this._zoomCoroutine.start();
    }

    // 触摸缩放的处理函数
    touchZoomHandle(zoomValue){
        if(this.isPerspectiveCamera){
            this.distance = this._startZoomDistance * zoomValue;
        }else{
            this.size = this._startZoomSize * zoomValue;
        }
        this.dispatchChange();
    }

    // 对象在被移除或销毁时自动释放资源，无需手动调用
    _dispose(){
        this._smoothRotateCoroutine.stop();
        this._zoomCoroutine.stop();
        this._event.clear();
    }

    //----------------------------------------对外属性方法----------------------------------------
    makeSafe(){
        if(this.isPerspectiveCamera){
            this.distance = this.camera.position.z;
        }else{
            this.size = 1 / this.camera.zoom;
        }
    }

    // 摄像机
    get camera(){
        return this._camera;
    }

    // 摄像机目标点
    get cameraTarget(){
        return this._cameraTarget;
    }

    // 是否透视
    get isPerspectiveCamera(){
        return this.camera.isPerspectiveCamera;
    }

    // 是否可控制
    get canControl(){
        return this._paras.canControl===false?false:true;
    }
    set canControl(canControl){
        if(!canControl){
            this._canDoHandle = {
                move: false,
                rotate: false,
                zoom: false
            };
        }
        this._paras.canControl = canControl;
    }

    // 是否可平移
    get canMove(){
        let _canMove = this._paras.canMove===false?false:true;
        return _canMove && this.canControl;
    }
    set canMove(canMove){
        if(!canMove){
            this._canDoHandle.move = false;
        }
        this._paras.canMove = canMove;
    }

    // 是否可旋转
    get canRotate(){
        let _canRotate = this._paras.canRotate===false?false:true;
        return _canRotate && this.canControl;
    }
    set canRotate(canRotate){
        if(!canRotate){
            this._canDoHandle.rotate = false;
        }
        this._paras.canRotate = canRotate;
    }

    // 是否可缩放
    get canZoom(){
        let _canZoom = this._paras.canZoom===false?false:true;
        return _canZoom && this.canControl;
    }
    set canZoom(canZoom){
        if(!canZoom){
            this._canDoHandle.zoom = false;
        }
        this._paras.canZoom = canZoom;
    }

    // 是否平滑旋转
    get canSmoothRotate(){
        return this._paras.canSmoothRotate===true?true:false;
    }
    set canSmoothRotate(canSmoothRotate){
        this._paras.canSmoothRotate = canSmoothRotate;
    }

    // 水平旋转范围
    get hRotateRange(){
        if(!TypesCheck.isArray(this._paras.hRotateRange)){
            this._paras.hRotateRange = [-Infinity,Infinity];
        }else{
            if(!TypesCheck.isNumber(this._paras.hRotateRange[0])){
                this._paras.hRotateRange[0] = -Infinity;
            }else if(this._paras.hRotateRange[0]<-Math.PI){
                this._paras.hRotateRange[0] = -Infinity;
            }
            if(!TypesCheck.isNumber(this._paras.hRotateRange[1])){
                this._paras.hRotateRange[1] = Infinity;
            }else if(this._paras.hRotateRange[0]>Math.PI){
                this._paras.hRotateRange[1] = Infinity;
            }
        }
        return this._paras.hRotateRange;
    }
    set hRotateRange(range){
        this._paras.hRotateRange = range;
    }

    // 垂直旋转范围
    get vRotateRange(){
        if(!TypesCheck.isArray(this._paras.vRotateRange)){
            this._paras.vRotateRange = [0,Math.PI];
        }else{
            if(!TypesCheck.isNumber(this._paras.vRotateRange[0])){
                this._paras.vRotateRange[0] = 0;
            }else if(this._paras.vRotateRange[0]<0){
                this._paras.vRotateRange[0] = 0;
            }
            if(!TypesCheck.isNumber(this._paras.vRotateRange[1])){
                this._paras.vRotateRange[1] = Math.PI;
            }else if(this._paras.vRotateRange[0]>Math.PI){
                this._paras.vRotateRange[1] = Math.PI;
            }
        }
        return this._paras.vRotateRange;
    }
    set vRotateRange(range){
        this._paras.hRotateRange = range;
    }

    //透视参数相关参数
    get minDistance(){
        if(!this.canZoom){
            return 0;
        }
        if(!TypesCheck.isNumber(this._paras.minDistance)){
            this._paras.minDistance = 0;
        }else{
            this._paras.minDistance = this._paras.minDistance<0?0:this._paras.minDistance;
        }
        return this._paras.minDistance;
    }
    set minDistance(minDistance){
        this._paras.minDistance = minDistance;
    }
    get maxDistance(){
        if(!this.canZoom){
            return Infinity;
        }
        let minDistance = this.minDistance;
        if(!TypesCheck.isNumber(this._paras.maxDistance)){
            this._paras.maxDistance = minDistance+10;
        }else{
            this._paras.maxDistance = this._paras.maxDisance<minDistance?minDistance+10:this._paras.maxDistance;
        }
        return this._paras.maxDistance;
    }
    set maxDistance(maxDistance){
        this._paras.maxDistance = maxDistance;
    }
    get distance(){
        let minDistance = this.minDistance;
        let maxDistance = this.maxDistance;
        if(!TypesCheck.isNumber(this._paras.distance)){
            this._paras.distance = THREE.Math.lerp(minDistance,maxDistance,0.5);
        }else{
            this._paras.distance = THREE.Math.clamp(this._paras.distance,minDistance,maxDistance);
        }
        return this._paras.distance;
    }
    set distance(distance){
        this._paras.distance = distance;
        this.camera.position.z = this.distance;
    }

    //正交相关参数
    get minSize(){
        if(!this.canZoom){
            return 0;
        }
        if(!TypesCheck.isNumber(this._paras.minSize)){
            this._paras.minSize = 0;
        }else{
            this._paras.minSize = this._paras.minSize<0?0:this._paras.minSize;
        }
        return this._paras.minSize;
    }
    set minSize(minSize){
        this._paras.minSize = minSize;
    }
    get maxSize(){
        if(!this.canZoom){
            return Infinity;
        }
        let minSize = this.minSize;
        if(!TypesCheck.isNumber(this._paras.maxSize)){
            this._paras.maxSize = minSize+10;
        }else{
            this._paras.maxSize = this._paras.maxSize<minSize?minSize+10:this._paras.maxSize;
        }
        return this._paras.maxSize;
    }
    set maxSize(maxSize){
        this._paras.maxSize = maxSize;
    }
    get size(){
        let minSize = this.minSize;
        let maxSize = this.maxSize;
        if(!TypesCheck.isNumber(this._paras.size)){
            this._paras.size = THREE.Math.lerp(minSize,maxSize,0.5);
        }else{
            this._paras.size = THREE.Math.clamp(this._paras.size,minSize,maxSize);
        }
        return this._paras.size;
    }
    set size(size){
        this._paras.size = size;
        this.camera.zoom = 1/this.size;
        this.camera.updateProjectionMatrix();
    }

    // 添加至场景：添加后方能生效
    addToScene(scene){
        scene.add(this.cameraTarget);
    }

    // 旋转的dom事件函数
    rotateStart(event){
        if(!this.canRotate){
            return;
        }
        this._canDoHandle.rotate = true;

        //初始化旋转速度
        this._rotateSpeed = Math.PI/Math.min(this.camera.viewportParas[2],this.camera.viewportParas[3]);

        //记录初始位置
        if(event.isMouse){
            this._rotStartPoint = [event.clientX,event.clientY];
        }else if(event.isTouch){
            let touch = event.touches[0];
            this._rotStartPoint = [touch.clientX,touch.clientY];
        }

        //平滑旋转的前提下，根据当前速度重设目标旋转速度
        if(this.canSmoothRotate){
            this._rotSmoothTargetSpeed = [this._rotSmoothCurrentSpeed[0], this._rotSmoothCurrentSpeed[1]];
        }
    }

    //持续旋转的dom事件函数
    rotating(event){
        if(!this.canRotate){
            return;
        }

        if(!this._canDoHandle.rotate){
            return;
        }

        //记录当前旋转坐标
        if(event.isMouse){
            this._rotCurPoint = [event.clientX,event.clientY];
        }else if(event.isTouch){
            let touch = event.touches[0];
            this._rotCurPoint = [touch.clientX,touch.clientY];
        }

        // 计算旋转步长
        let rotateDelta = [
            (this._rotCurPoint[0]-this._rotStartPoint[0])*this._rotateSpeed,
            (this._rotCurPoint[1]-this._rotStartPoint[1])*this._rotateSpeed
        ];

        this._rotStartPoint = this._rotCurPoint;

        if(this.canSmoothRotate){
            let deltaSpeed = [rotateDelta[0],rotateDelta[1]];
            // 计算平滑旋转的目标速度及旋转标识
            for(let i = 0; i < 2; i++){
                //如果反向
                if(this._rotSmoothTargetSpeed[i] * deltaSpeed[i] < 0){
                    this._rotSmoothTargetSpeed[i] = THREE.Math.clamp(
                        this._rotSmoothTargetSpeed[i]+deltaSpeed[i]*4,
                        -Math.PI*2,Math.PI*2
                    );
                }else{// 如果同向
                    this._rotSmoothTag[i] = 1;
                    this._rotSmoothTargetSpeed[i] = THREE.Math.clamp(
                        this._rotSmoothTargetSpeed[i]+deltaSpeed[i],
                        -Math.PI*2,Math.PI*2
                    );
                }
            }
            this.smoothRotateHandle();
        }else{
            this.rotateHandle(rotateDelta);
        }
    }

    // 平移的dom事件函数
    moveStart(event){
        if(!this.canMove){
            return;
        }
        this._canDoHandle.move = true;

        // 记录开始平移的坐标
        if(event.isMouse){
            this._moveStartPoint = [event.clientX,event.clientY];
        }else if(event.isTouch){
            let touch1 = [event.touches[0].clientX,event.touches[0].clientY];
            let touch2 = [event.touches[1].clientX,event.touches[1].clientY];
            this._moveStartPoint = [(touch1[0]+touch2[0])*0.5,(touch1[1]+touch2[1])*0.5];
        }
    }

    // 持续平移的dom事件函数
    moving(event){
        if(!this.canMove){
            return;
        }

        if(!this._canDoHandle.move){
            return;
        }

        //记录当前平移位置
        if(event.isMouse){
            this._moveCurPoint = [event.clientX,event.clientY];
        }else if(event.isTouch){
            let touch1 = [event.touches[0].clientX,event.touches[0].clientY];
            let touch2 = [event.touches[1].clientX,event.touches[1].clientY];
            this._moveCurPoint = [(touch1[0]+touch2[0])*0.5,(touch1[1]+touch2[1])*0.5];
        }

        // 计算平移步长
        let moveDelta = [
            (this._moveCurPoint[0]-this._moveStartPoint[0]),
            (this._moveCurPoint[1]-this._moveStartPoint[1])
        ];
        this._moveStartPoint = this._moveCurPoint;

        this.moveHandle(moveDelta);
    }

    // 缩放的dom事件函数仅针对触摸
    zoomStart(event){
        if(event.isMouse){
            return;
        }

        if(!this.canZoom){
            return;
        }

        this._canDoHandle.zoom = true;

        if(this.isPerspectiveCamera){
            this._startZoomDistance = this.distance;
        }else{
            this._startZoomSize = this.size;
        }

        // 计算初始双指长度
        let v1 = new THREE.Vector2(event.touches[0].clientX,event.touches[0].clientY);
        let v2 = new THREE.Vector2(event.touches[1].clientX,event.touches[1].clientY);
        this._zoomStartLength = new THREE.Vector2().subVectors(v1,v2).length();
    }

    //持续缩放的dom事件函数
    zooming(event){
        if(!this.canZoom)
            return;

        if(event.isMouse){
            if(!event.deltaY){
                return;
            }
            let deltaY = 0;
            let orignal = 0;
            let target = 0;
            if(this.isPerspectiveCamera){
                deltaY = event.deltaY < 0 ? -0.2 * this._startZoomDistance : 0.2 * this._startZoomDistance;
                orignal = this.distance;
                target = THREE.Math.clamp(orignal + deltaY, this.minDistance,this.maxDistance);
            }else{
                deltaY = event.deltaY < 0 ? -0.2 * this._startZoomSize : 0.2 * this._startZoomSize;
                orignal = this.size;
                target = THREE.Math.clamp(orignal + deltaY, this.minSize,this.maxSize);
            }
            this.mouseZoomHandle(orignal,target);
        }else if(event.isTouch){
            if(!this._canDoHandle.zoom){
                return;
            }
            let v1 = new THREE.Vector2(event.touches[0].clientX,event.touches[0].clientY);
            let v2 = new THREE.Vector2(event.touches[1].clientX,event.touches[1].clientY);
            let zoomCurLength = new THREE.Vector2().subVectors(v1,v2).length();
            this.touchZoomHandle(this._zoomStartLength/zoomCurLength);
        }
    }

    // 事件
    onChangeHandle(handle){
        this._event.addEventListener("onChange",handle);
    }
    onceChangeHandle(handle){
        this._event.addEventListenerOnce("onChange",handle);
    }
    offChangeHandle(handle){
        this._event.removeEventListener("onChange",handle);
    }
    dispatchChange(){
        this._event.dispatchEvent({type:"onChange"});
    }

    // 释放当前对象
    dispose(){
        let index = this.cameraTarget._disposeComponents.indexOf(this);
        this.cameraTarget._disposeComponents.splice(index,1);
        this._dispose();
    }
}