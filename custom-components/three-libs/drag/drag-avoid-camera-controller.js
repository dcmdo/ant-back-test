export default class DragAvoidCameraController {
    constructor(drag){
        this.declareVars(drag);
        this.setDragEvent();
    }

    //----------------------------------------内部属性方法----------------------------------------
    declareVars(drag){
        this._drag = drag;
        this._lastCanControlSet = [];
        this._cameraControllerSet = [];

        this._dragStartHandleBind = this.dragStartHandle.bind(this);
        this._dragEndHandleBind = this.dragEndHandle.bind(this);
    }

    dragStartHandle(event){
        this._lastCanControlSet = [];
        this._cameraControllerSet.forEach((controller)=>{
            this._lastCanControlSet.push(controller.canControl);
            controller.canControl = false;
        })
    }

    dragEndHandle(event){
        this._cameraControllerSet.forEach((controller,index)=>{
            controller.canControl = this._lastCanControlSet[index];
        })
    }

    setDragEvent(){
        this._drag.onDragStartHandle(null,this._dragStartHandleBind);
        this._drag.onDragEndHandle(null,this._dragEndHandleBind);
    }

    //----------------------------------------对外属性方法----------------------------------------
    get drag(){
        return this._drag;
    }

    addCameraControl(cameraController){
        let index = this._cameraControllerSet.indexOf(cameraController);
        if(index > -1){
            console.warn("已存在拖拽规避的摄像机控制，无需重复添加！");
            return;
        }
        this._cameraControllerSet.push(cameraController);
    }

    removeCameraControl(cameraController){
        let index = this._cameraControllerSet.indexOf(cameraController);
        if(index < 0){
            console.warn("不存在拖拽规避的摄像机控制，无需移除！");
            return;
        }
        this._cameraControllerSet.splice(index,1);
    }

    dispose(){
        this._drag.offDragStartHandle(null,this._dragStartHandleBind);
        this._drag.offDragEndHandle(null,this._dragEndHandleBind);
        this._cameraControllerSet = null;
        this._lastCanControlSet = null;
        this._drag = null;
    }
}