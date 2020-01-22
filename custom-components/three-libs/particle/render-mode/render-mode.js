import * as THREE from 'three';
import throttle from 'throttle';
import ObjectFns from "ObjectFns";
/**
 * paras:{
 *     type: plane || geometry,
 *     geometry: BoxBufferGeometry,// 仅type===geometry 时有效
 *     pivot:[x,y,z] [0,0,0],
 *     scale:[x,y,z] [1,1,1],
 *     algin:"view" || "local" || "speed" || "stretched"
 * }
 */
export default class RenderMode {
    constructor(paras){
        this.declareVars(paras);
        this.initDefaultProps();
        this.refreshGeometry();
        this._firstInit = false;
    }
    //----------------------------------------内部属性方法----------------------------------------
    declareVars(paras){
        this._firstInit = true;
        this._paras = paras || {};
        this._refGeometry = null;
        this.updateHandle = null;
        this._updateDelay = throttle(()=>{
            this.refreshGeometry();
            if(this.updateHandle){
                this.updateHandle();
            }
        },10,{leading:false})
    }

    // 属性设置时过滤及设置默认值，有助于粒子系统的性能提升
    initDefaultProps(){
        this.type = this.type;
        this.geometry = this.geometry;
        this.pivot = this.pivot;
        this.scale = this.scale;
        this.algin = this.algin;
    }

    refreshGeometry(){
        this._refGeometry = this.geometry.clone();
        let matrix4 = new THREE.Matrix4().compose(
            new THREE.Vector3(...this.pivot),
            new THREE.Quaternion(),
            new THREE.Vector3(...this.scale)
        );
        matrix4.applyToBufferAttribute(this._refGeometry.attributes.position);
        this._refGeometry.computeVertexNormals();
    }
    //----------------------------------------对外属性及方法----------------------------------------
    get type(){
        return this._paras.type;
    }
    set type(type){
        let _type = type || "plane";
        if(this._paras.type !== _type){
            this._paras.type = _type;
            if(!this._firstInit){
                this.geometry = this.geometry || null;
            }
        }
    }

    get geometry(){
        return this._paras.geometry;
    }
    set geometry(geometry){
        if(this.type === "plane"){
            this._paras.geometry = new THREE.PlaneBufferGeometry(1,1);
        }else{
            this._paras.geometry = geometry || new THREE.BoxBufferGeometry(1, 1);
        }
        if(!this._firstInit){
            this._updateDelay();
        }
    }

    get refGeometry(){
        return this._refGeometry;
    }

    get pivot(){
        return this._paras.pivot;
    }
    set pivot(pivot){
        let _pivot = pivot || [0,0,0];
        if(!ObjectFns.isEqual(this._paras.pivot, _pivot)){
            this._paras.pivot = _pivot;
            if(!this._firstInit){
                this._updateDelay();
            }
        }
    }

    get scale(){
        return this._paras.scale;
    }
    set scale(scale){
        let _scale = scale || [1,1,1];
        if(!ObjectFns.isEqual(this._paras.scale, _scale)){
            this._paras.scale = _scale;
            if(!this._firstInit){
                this._updateDelay();
            }
        }
    }

    get algin(){
        return this._paras.algin;
    }
    set algin(algin){
        let _algin = algin || "view";
        if(this._paras.algin !== _algin){
            this._paras.algin = _algin || "view";
        }
    }

    clone(){
        return new RenderMode()
    }

    copy(source){
        let paras = source._paras;
        this._paras = {
            type: paras.type,
            geometry: paras.geometry,// 仅type===geometry 时有效
            pivot:ObjectFns.clone(paras.pivot),
            scale:ObjectFns.clone(paras.scale),
            algin:paras.algin
        };
        this.initDefaultProps();
        this.refreshGeometry();
        return this;
    }
}