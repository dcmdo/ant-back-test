import * as THREE from "three";
import Shape from "./shape";
import CoolMath from "CoolMath";

/**
 * paras:{
 *     direction:[0, 1, 0],
 *     emitType: volume || base || edge,
 *     scale:[x,y,z]
 * }
 */
const emitTypes = ["volume","base","edge"];
export default class BoxShape extends Shape{
    constructor(paras){
        super(paras);
    }

    declareVars(paras){
        super.declareVars(paras);
        this._edgeWeightArray = null;
        this._baseWeightArray = null;
    }

    initDefaultProps(){
        super.initDefaultProps();
        this.direction = this.direction;
        this.scale = this.scale;
        this.emitType = this.emitType;
    }

    bornShapeInfo() {
        let pos;
        let scale = [...this.scale];
        scale.forEach((item,index)=>{
            scale[index] = item*0.5;
        });

        if(this.emitType === "volume"){
            pos = new THREE.Vector3(
                CoolMath.randomFloat(-scale[0],scale[0]),
                CoolMath.randomFloat(-scale[1],scale[1]),
                CoolMath.randomFloat(-scale[2],scale[2])
            );
        }else if(this.emitType === "base"){
            let faceIndex = CoolMath.randomWeightIndex(
                this._baseWeightArray,
                this._baseWeightArray[this._baseWeightArray.length-1]
            );
            if(faceIndex===0){
                pos = new THREE.Vector3(
                    CoolMath.randomFloat(0,1)<0.5?-scale[0]:scale[0],
                    CoolMath.randomFloat(-scale[1],scale[1]),
                    CoolMath.randomFloat(-scale[2],scale[2])
                );
            }else if(faceIndex===1){
                pos = new THREE.Vector3(
                    CoolMath.randomFloat(-scale[0],scale[0]),
                    CoolMath.randomFloat(0,1)<0.5?-scale[1]:scale[1],
                    CoolMath.randomFloat(-scale[2],scale[2])
                );
            }else{
                pos = new THREE.Vector3(
                    CoolMath.randomFloat(-scale[0],scale[0]),
                    CoolMath.randomFloat(-scale[1],scale[1]),
                    CoolMath.randomFloat(0,1)<0.5?-scale[2]:scale[2],
                );
            }
        }else{
            let edgeIndex = CoolMath.randomWeightIndex(
                this._edgeWeightArray,
                this._edgeWeightArray[this._edgeWeightArray.length-1]
            );
            if(edgeIndex===0){
                pos = new THREE.Vector3(
                    CoolMath.randomFloat(-scale[0],scale[0]),
                    CoolMath.randomFloat(0,1)<0.5 ? -scale[1] : scale[1],
                    CoolMath.randomFloat(0,1)<0.5 ? -scale[2] : scale[2]
                );
            }else if(edgeIndex===1){
                pos = new THREE.Vector3(
                    CoolMath.randomFloat(0,1)<0.5 ? -scale[0] : scale[0],
                    CoolMath.randomFloat(-scale[1],scale[1]),
                    CoolMath.randomFloat(0,1)<0.5 ? -scale[2] : scale[2]
                );
            }else{
                pos = new THREE.Vector3(
                    CoolMath.randomFloat(0,1)<0.5 ? -scale[0] : scale[0],
                    CoolMath.randomFloat(0,1)<0.5 ? -scale[1] : scale[1],
                        CoolMath.randomFloat(-scale[2],scale[2])
                );
            }
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

    get scale(){
        return this._paras.scale;
    }
    set scale(scale){
        this._paras.scale = scale || [1,1,1];
        let x = Math.abs(scale[0]);
        let y = Math.abs(scale[1]);
        let z = Math.abs(scale[2]);
        this._edgeWeightArray = [x,x+y,x+y+z];
        this._baseWeightArray = [y*z,y*z+x*z,y*z+x*z+x*y];
    }

    get emitType(){
        return this._paras.emitType;
    }
    set emitType(emitType){
        this._paras.emitType = emitTypes.indexOf(emitType)===-1 ? "base" : emitType;
    }

    clone(){
        return new BoxShape({...this._paras});
    }

    copy(source){
        this._paras = {...source._paras};
        this.initDefaultProps();
        return this;
    }
}