import * as THREE from "three";
import Shape from "./shape";

/**
 * paras:{
 *     direction:[0, 1, 0],
 * }
 */
export default class PointShape extends Shape{
    constructor(paras){
        super(paras);
    }

    initDefaultProps(){
        super.initDefaultProps();
        this.direction = this.direction;
    }

    bornShapeInfo() {
        let randomDir = this.randomDir();
        let initDir = new THREE.Vector3(...this.direction).normalize();
        initDir = initDir.add(randomDir).normalize();
        let pos = new THREE.Vector3(0,0,0);
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

    clone(){
        return new PointShape({...this._paras});
    }

    copy(source){
        this._paras = {...source._paras};
        this.initDefaultProps();
        return this;
    }
}