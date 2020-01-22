import * as THREE from "three";
import Shape from "./shape";
import CoolMath from "CoolMath";

/**
 * paras:{
 *     direction:[0, 1, 0],
 *     emitType: base || point,
 *     width: 1
 * }
 */
export default class EdgeShape extends Shape{
    constructor(paras){
        super(paras);
    }

    initDefaultProps(){
        super.initDefaultProps();
        this.direction = this.direction;
        this.width = this.width;
        this.emitType = this.emitType;
    }

    bornShapeInfo() {
        let xValue = this.width*0.5;
        let pos = new THREE.Vector3();
        if(this.emitType === "base"){
            pos.x = CoolMath.randomFloat(-xValue, xValue);
        }else{
            pos.x = CoolMath.randomFloat(0,1)<0.5 ? -xValue : xValue;
        }

        let initDir = new THREE.Vector3(...this.direction).normalize().add(this.randomDir());
        initDir = initDir.add(this.sphereDir(pos.x,pos.y,pos.z)).normalize();
        return {
            dir : initDir,
            pos : pos
        }
    }
    //----------------------------------------对外属性方法----------------------------------------
    get direction(){
        return this._paras.direction;
    }
    set direction(direction){
        this._paras.direction  = direction || [0, 1, 0];
    }

    get width(){
        return this._paras.width;
    }
    set width(width){
        this._paras.width = width || 1;
    }

    get emitType(){
        return this._paras.emitType;
    }
    set emitType(emitType){
        this._paras.emitType = emitType === "point" ? "point" : "base";
    }

    clone(){
        return new EdgeShape({...this._paras});
    }

    copy(source){
        this._paras = {...source._paras};
        this.initDefaultProps();
        return this;
    }
}