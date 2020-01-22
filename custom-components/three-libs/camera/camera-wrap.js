import * as THREE from 'three';

const CameraWrap = {
    /**
     * 为透视摄像机扩充以下属性及方法
     *  renderer THREE.js renderer
     *  viewport:{x,y,width,height}
     *  viewportParas:[x,y,width,height]
     *  resize:()=>{} 视口大小更改时调用，用以完成自适应刷新
     */
    createPerspectiveCamera:(renderer,viewport={x:0,y:0,width:1,height:1},fov=60,near=0.1,far=100)=>{
        if(!renderer){
            console.error("未指定合法的renderer，创建透视摄像机失败！");
            return undefined;
        }
        let size = new THREE.Vector2();
        renderer.getSize(size);
        let aspect = (size.width*viewport.width)/(size.height*viewport.height);
        let pCamera = new THREE.PerspectiveCamera(fov,aspect,near,far);
        //指定renderer
        Object.defineProperty(pCamera,"renderer",{value:renderer});
        //定义视口相关参数
        Object.defineProperty(pCamera,"_viewport",{value:viewport});
        Object.defineProperty(pCamera,"viewport",{
            get:function () {
                return this._viewport;
            },
            set:function (viewport) {
                this._viewport = viewport;
                if(this.renderer){
                    this.renderer.getSize(size);
                    let _viewport = this.viewport;
                    this.aspect = (_viewport.width * size.width)/(_viewport.height * size.height);
                    this.updateProjectionMatrix();
                }
            }
        });
        Object.defineProperty(pCamera,"viewportParas",{
            get:function () {
                this.renderer.getSize(size);
                let _viewport = this.viewport;
                return [
                    _viewport.x * size.width,
                    _viewport.y * size.height,
                    _viewport.width * size.width,
                    _viewport.height * size.height
                ];
            }
        });
        //屏幕大小改变时调用用以刷新摄像机视口
        Object.defineProperty(pCamera,"resize",{
            value:function () {
                if(!this.renderer){
                    console.error("resize错误：未指定renderer，无法获取渲染尺寸！");
                    return;
                }
                this.renderer.getSize(size);
                let _viewport = this.viewport;
                this.aspect = (_viewport.width * size.width)/(_viewport.height * size.height);
                this.updateProjectionMatrix();
            }
        });
        return pCamera;
    },

    /**
     * 为正交摄像机扩充以下属性及方法
     *  renderer THREE.js renderer
     *  viewport:{x,y,width,height}
     *  viewportParas:[x,y,width,height]
     *  resize:()=>{} 视口大小更改时调用，用以完成自适应刷新
     */
    createOrthographicCamera:(renderer,viewport={x:0,y:0,width:1,height:1},near=0,far=100)=>{
        if(!renderer){
            console.error("未指定合法的renderer，创建正交摄像机失败！");
            return undefined;
        }
        let size = new THREE.Vector2();
        renderer.getSize(size);
        let width = size.width * viewport.width;
        let height = size.height * viewport.height;
        let frustumSize = width>height?height:width;
        width = width/frustumSize*0.5;
        height = height/frustumSize*0.5;
        let oCamera = new THREE.OrthographicCamera(-width,width,height,-height,near,far);
        oCamera.zoom = 1/5;
        oCamera.updateProjectionMatrix();
        //指定renderer
        Object.defineProperty(oCamera,"renderer",{value:renderer});
        //定义视口相关参数
        Object.defineProperty(oCamera,"_viewport",{value:viewport});
        Object.defineProperty(oCamera,"viewport",{
            get:function () {
                return this._viewport;
            },
            set:function (viewport) {
                this._viewport = viewport;
                if(this.renderer){
                    this.renderer.getSize(size);
                    let _viewport = this.viewport;
                    let _width = size.width * _viewport.width;
                    let _height = size.height * _viewport.height;
                    let _frustumSize = _width>_height?_height:_width;
                    _width = _width/_frustumSize*0.5;
                    _height = _height/_frustumSize*0.5;
                    this.left = -_width;
                    this.right = _width;
                    this.top = _height;
                    this.bottom = -_height;
                    this.updateProjectionMatrix();
                }
            }
        });
        Object.defineProperty(oCamera,"viewportParas",{
            get:function () {
                this.renderer.getSize(size);
                let _viewport = this.viewport;
                return [
                    _viewport.x * size.width,
                    _viewport.y * size.height,
                    _viewport.width * size.width,
                    _viewport.height * size.height
                ];
            }
        });
        //屏幕大小改变时调用用以刷新摄像机视口
        Object.defineProperty(oCamera,"resize",{
            value:function () {
                if(!this.renderer){
                    console.error("resize错误：未指定renderer，无法获取渲染尺寸！");
                    return;
                }
                this.renderer.getSize(size);
                let _viewport = this.viewport;
                let _width = size.width * _viewport.width;
                let _height = size.height * _viewport.height;
                let _frustumSize = _width>_height?_height:_width;
                _width = _width/_frustumSize*0.5;
                _height = _height/_frustumSize*0.5;
                this.left = -_width;
                this.right = _width;
                this.top = _height;
                this.bottom = -_height;
                this.updateProjectionMatrix();
            }
        });
        return oCamera;
    }
};

export default CameraWrap;