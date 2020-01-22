import * as THREE from "three";
import Shape from "./shape";
import CoolMath from "CoolMath";

/**
 * paras:{
 *     geometry:
 *     emitType: point || face,
 * }
 */
export default class GermetryShape extends Shape{
    constructor(paras){
        super(paras);
    }

    declareVars(paras){
        super.declareVars(paras);
        this._faceWeightArray = null;
    }

    initDefaultProps(){
        super.initDefaultProps();
        this.geometry = this.geometry;
        this.emitType = this.emitType;
    }

    bornShapeInfo() {
        let pos;

        let geometry = this.geometry;

        let face = geometry.faces[CoolMath.randomWeightIndex(
            this._faceWeightArray,
            this._faceWeightArray[this._faceWeightArray.length-1]
        )];

        let initDir;
        if(this.emitType === "point"){
            let pointIndex = CoolMath.randomInt(0,2);
            pos = new THREE.Vector3().copy(face.points[pointIndex]);
            initDir = new THREE.Vector3().copy(face.vertexNormals[pointIndex]);
        }else{
            let pointA = new THREE.Vector3().copy(face.points[0]);
            let pointB = new THREE.Vector3().copy(face.points[1]);
            let pointC = new THREE.Vector3().copy(face.points[2]);
            let r1 = CoolMath.randomFloat(0,1);let r2 = CoolMath.randomFloat(0,1);
            let sqrtR1 = Math.sqrt(r1);
            pos = pointA.multiplyScalar(1-sqrtR1)
                .add(pointB.multiplyScalar(sqrtR1*(1-r2)))
                .add(pointC.multiplyScalar(sqrtR1*r2));
            initDir = new THREE.Vector3().copy(face.normal);
        }
        initDir = initDir.add(this.randomDir()).normalize();
        return {
            dir : initDir,
            pos : pos
        }
    }

    getNormalFromString(string){
        let parasArray = string.split("@");
        parasArray.forEach((value,index)=>{
            parasArray[index] = parseFloat(value);
        });
        return new THREE.Vector3(...parasArray);
    };

    computeVertexNormals(geometry){
        let normalSet = [];
        let faceSet = [];
        const indexMap = ["a","b","c"];
        geometry.faces.forEach((face)=>{
            indexMap.forEach((key,index)=>{
                let vIndex = face[key];
                if(!normalSet[vIndex]){
                    normalSet[vIndex] = [];
                }
                let normal = face.vertexNormals[index];
                normal = normal.x+"@"+normal.y+"@"+normal.z;
                if(normalSet[vIndex].indexOf(normal)===-1){
                    normalSet[vIndex].push(normal);
                }

                if(!faceSet[vIndex]){
                    faceSet[vIndex] = [];
                }
                faceSet[vIndex].push(face.vertexNormals[index]);
            })
        });

        normalSet.forEach((set,index)=>{
            let normal = this.getNormalFromString(set[0]);
            for(let i = 1;i<set.length;i++){
                normal = normal.add(this.getNormalFromString(set[i])).normalize();
            }
            faceSet[index].forEach((_normal)=>{
                _normal.set(normal.x,normal.y,normal.z);
            })
        });
    }
    //----------------------------------------对外属性方法----------------------------------------
    get geometry(){
        return this._paras.geometry;
    }
    set geometry(geometry){
        this._paras.geometry = geometry || new THREE.BoxGeometry(1,1,1);
        let _geometry = this.geometry;
        if(_geometry.isBufferGeometry){
            this._paras.geometry = new THREE.Geometry().fromBufferGeometry(_geometry);
        }
        this.computeVertexNormals(_geometry);
        this._faceWeightArray = [];
        _geometry.faces.forEach((face,index)=>{
            face.points = [
                _geometry.vertices[face.a],
                _geometry.vertices[face.b],
                _geometry.vertices[face.c]
            ];
            let e1 = new THREE.Vector3().subVectors(face.points[1],face.points[0]);
            let e2 = new THREE.Vector3().subVectors(face.points[2],face.points[0]);
            face.area = e1.cross(e2).length()/2;
            if(index===0){
                this._faceWeightArray.push(face.area);
            }else{
                this._faceWeightArray.push(
                    this._faceWeightArray[index-1]+face.area
                )
            }
        });
    }

    get emitType(){
        return this._paras.emitType;
    }
    set emitType(emitType){
        this._paras.emitType = emitType==="point" ? "point" : "face";
    }

    clone(){
        return new GermetryShape({...this._paras});
    }

    copy(source){
        this._paras = {...source._paras};
        this.initDefaultProps();
        return this;
    }
}