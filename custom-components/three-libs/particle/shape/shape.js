import * as THREE from "three";
import CoolMath from "CoolMath";

/**
 * paras:{
 *     isRandom : false,
 *     isSphere : false
 * }
 */
export default class Shape {
    constructor(paras){
        this.declareVars(paras);
        this.initDefaultProps();
    }
    //----------------------------------------内部属性方法----------------------------------------
    declareVars(paras){
        this._paras = paras || {};
    }

    initDefaultProps(){
        this.isRandom = this.isRandom;
        this.isSphere = this.isSphere;
    }

    randomDir(){
        let randomDir = this.isRandom ? [
            CoolMath.randomFloat(-1,1),
            CoolMath.randomFloat(-1,1),
            CoolMath.randomFloat(-1,1)
        ]:[0,0,0];
        randomDir = new THREE.Vector3(...randomDir).normalize();
        return randomDir;
    }

    sphereDir(x, y, z){
        let sphereDir = this.isSphere?[x,y,z]:[0,0,0];
        sphereDir = new THREE.Vector3(...sphereDir).normalize();
        return sphereDir;
    }

    // 必须重写
    bornShapeInfo(){

    }
    //----------------------------------------对外属性方法----------------------------------------
    get isRandom(){
        return this._paras.isRandom;
    }
    set isRandom(isRandom){
        this._paras.isRandom = isRandom === true ? true : false;
    }

    get isSphere(){
        return this._paras.isSphere;
    }
    set isSphere(isSphere){
        this._paras.isSphere = isSphere === true ? true : false;
    }
}