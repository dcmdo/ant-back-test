import * as THREE from "three";
import Shape from "./shape";
import CoolMath from "CoolMath";

/**
 * paras:{
 *     radius:0.5,
 *     isHalf:false,
 *     emitType:base || volume,
 * }
 */
export default class SphereShape extends Shape{
    constructor(paras){
        super(paras);
    }

    initDefaultProps(){
        super.initDefaultProps();
        this.radius = this.radius;
        this.isHalf = this.isHalf;
        this.emitType = this.emitType;
    }

    bornShapeInfo() {
        let initDir = new THREE.Vector3(CoolMath.randomFloat(-1,1),CoolMath.randomFloat(-1,1),CoolMath.randomFloat(-1,1)).normalize();

        let r = this.emitType==="base" ? this.radius : CoolMath.randomFloat(0.000001,this.radius);
        let pos = new THREE.Vector3().copy(initDir).multiplyScalar(r);
        initDir = initDir.add(this.randomDir()).normalize();

        return {
            dir : initDir,
            pos : pos
        }
    }
    //----------------------------------------对外属性方法----------------------------------------
    get radius(){
        return this._paras.radius;
    }
    set radius(radius){
        this._paras.radius = radius || 0.5;
    }

    get isHalf(){
        return this._paras.isHalf;
    }
    set isHalf(isHalf){
        return this._paras.isHalf = isHalf === true ? true : false;
    }

    get emitType(){
        return this._paras.emitType;
    }
    set emitType(emitType){
        this._paras.emitType = emitType === "volume" ? "volume" : "base";
    }

    get isSphere(){
        return this._paras.isSphere;
    }
    set isSphere(isSphere){
        this._paras.isSphere = isSphere === false ? false : true;
    }

    clone(){
        return new SphereShape({...this._paras});
    }

    copy(source){
        this._paras = {...source._paras};
        this.initDefaultProps();
        return this;
    }
}