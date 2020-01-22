import * as THREE from "three";
import Shape from "./shape";
import CoolMath from "CoolMath";

/**
 * paras:{
 *     radius1:0.5
 *     radius2:1
 *     emitType: base || volume,
 * }
 */
export default class ConeShape extends Shape{
    constructor(paras){
        super(paras);
    }

    initDefaultProps(){
        super.initDefaultProps();
        this.radius1 = this.radius1;
        this.radius2 = this.radius2;
        this.emitType = this.emitType;
    }

    bornShapeInfo() {
        let circleDir = new THREE.Vector3(CoolMath.randomFloat(-1,1),0,CoolMath.randomFloat(-1,1)).normalize();
        let pos1 = new THREE.Vector3();
        let pos2 = new THREE.Vector3();
        if(this.emitType==="base"){
            pos1 = new THREE.Vector3().copy(circleDir).multiplyScalar(this.radius1);
            pos2 = new THREE.Vector3().copy(circleDir).multiplyScalar(this.radius2);
            pos2.y = 1;
        }else{
            let radiusRatio = CoolMath.randomFloat(0.000001,1);
            pos1 = new THREE.Vector3().copy(circleDir).multiplyScalar(CoolMath.lerp(0.000001,this.radius1,radiusRatio));
            pos2 = new THREE.Vector3().copy(circleDir).multiplyScalar(CoolMath.lerp(0.000001,this.radius2,radiusRatio));
            pos2.y = 1;
        }
        let initDir = new THREE.Vector3().subVectors(pos2,pos1).normalize().add(this.randomDir()).normalize();
        return {
            dir : initDir,
            pos : pos1
        }
    }
    //----------------------------------------对外属性方法----------------------------------------
    get radius1(){
        return this._paras.radius1;
    }
    set radius1(radius1){
        this._paras.radius1 = radius1 || 0.5;
    }

    get radius2(){
        return this._paras.radius2;
    }
    set radius2(radius2){
        this._paras.radius2 = radius2 || 1;
    }

    get emitType(){
        return this._paras.emitType;
    }
    set emitType(emitType){
        this._paras.emitType = emitType === "volume" ? "volume" : "base";
    }

    clone(){
        return new ConeShape({...this._paras});
    }

    copy(source){
        this._paras = {...source._paras};
        this.initDefaultProps();
        return this;
    }
}