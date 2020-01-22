import * as THREE from 'three';
import CoolLineMateiral from './cool-line-material';

// const vShader = "" +
//     "attribute vec3 lastPosition;" +
//     "attribute vec3 nextPosition;" +
//     "attribute float side;" +
//
//     "uniform float width;" +
//
//     "void main(){" +
//     "mat4 projectModelViewMat = projectionMatrix * modelViewMatrix;" +
//
//     "vec4 curPos = projectModelViewMat * vec4(position, 1.0);" +
//
//     "vec4 lastPos = projectModelViewMat * vec4(lastPosition, 1.0);" +
//     "vec4 nextPos = projectModelViewMat * vec4(nextPosition, 1.0);" +
//
//     "vec3 normal = ( nextPos - lastPos ).xyz;" +
//     "normal = normalize( cross( normal, vec3(0.0,0.0,1.0) ) );" +
//
//     "vec2 offset = normal.xy * side * 0.5;" +
//
//     "curPos.xy -= offset;" +
//     "gl_Position = curPos;" +
//     "}";
//
// const fShader = "" +
//     "" +
//     "void main(){" +
//     "gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);" +
//     "}";

// 全局的粒子集合
const coolLines = [];

// renderer画布尺寸
let rendererSize = {width:window.innerWidth,height:window.innerHeight};

export default class CoolLine {
    constructor(points){
        this.declareVars(points);
        this.initMaterial();
        this.process();
        this.addToCoolLineSet();
    }

    //----------------------------------------内部属性方法----------------------------------------
    declareVars(points){
        //----------私有----------
        this._distance = 0;
        this._segmentDistances = [];

        this._points = points ||
            [
                new THREE.Vector3(-1,0,0),
                new THREE.Vector3(1,0,0)
            ];

        this._width = 1;

        this._positions = [];
        this._uvs = [];

        this._directions = [];

        // this._lastPositions = [];
        // this._nextPositions = [];

        this._sides = [];
        this._indices = [];

        this._attributes = null;
        this._geometry = new THREE.BufferGeometry();
        this._material = null;

        this._object3d = null;
    }

    addToCoolLineSet(){
        coolLines.push(this);
    }

    initMaterial(){
        this._material = new CoolLineMateiral({
            resolution: new THREE.Vector2(rendererSize.width,rendererSize.height)
        });
    }

    computeDistance(points, pointCount){
        this._distance = 0;
        this._segmentDistances = [0];

        for(let i = 1; i < pointCount; i++){
            let lastPoint = points[i-1];
            let point = points[i];

            let distance = lastPoint.distanceTo(point);
            this._distance += distance;
            this._segmentDistances.push(this._distance);
        }
    }

    process (){
        let points = this.points;

        let pointCount = points.length;

        this._positions = [];
        // this._lastPositions = [];
        // this._nextPositions = [];
        this._uvs = [];
        this._directions = [];
        this._sides = [];
        this._indices = [];

        //----------计算线长度----------
        this.computeDistance(points, pointCount);

        //----------初始化数据----------
        let lastDir = new THREE.Vector3();

        for(let i = 0; i< pointCount; i++){
            let point = points[i];

            // 初始化位置
            this._positions.push(point.x, point.y, point.z, point.x, point.y, point.z);

            // 初始化uv
            let vValue = this._segmentDistances[i]/this._distance;
            this._uvs.push(0, vValue, 1, vValue);

            // 初始化三角面索引
            if(i< pointCount-1){
                let index = i * 2;
                this._indices.push(index, index + 1, index + 2, index + 2, index + 1, index + 3);
            }

            // 初始化偏移方向
            this._sides.push(1.0,-1.0);

            // 初始化方向
            let direction;
            if(i === 0){
                let nextPoint = points[i+1];
                direction = new THREE.Vector3().subVectors(nextPoint,point).normalize();
            }else if(i === pointCount-1){
                let lastPoint = points[i-1];
                direction = new THREE.Vector3().subVectors(point,lastPoint).normalize();
            }else{
                let nextPoint = points[i+1];
                direction = new THREE.Vector3().subVectors(nextPoint,point).normalize();
                direction.addVectors(lastDir,direction).normalize();
            }
            this._directions.push(direction.x,direction.y,direction.z,direction.x,direction.y,direction.z);
            lastDir = direction;
        }

        //----------初始化模型属性----------
        if(!this._attributes){
            this._attributes = {
                position: new THREE.BufferAttribute(new Float32Array(this._positions), 3),
                direction: new THREE.BufferAttribute(new Float32Array(this._directions),3),
                // lastPosition: new THREE.BufferAttribute(new Float32Array(this._lastPositions), 3),
                // nextPosition: new THREE.BufferAttribute(new Float32Array(this._nextPositions), 3),
                uv: new THREE.BufferAttribute(new Float32Array(this._uvs), 2),
                side: new THREE.BufferAttribute(new Float32Array(this._sides),1),
                index : new THREE.BufferAttribute(new Uint16Array(this._indices),1)
            };
        }else{
            this._attributes.position.copyArray(new Float32Array(this._positions));
            this._attributes.position.needsUpdate = true;

            this._attributes.direction.copyArray(new Float32Array(this._directions));
            this._attributes.direction.needsUpdate = true;

            // this._attributes.lastPosition.copyArray(new Float32Array(this._lastPositions));
            // this._attributes.lastPosition.needsUpdate = true;
            //
            // this._attributes.nextPosition.copyArray(new Float32Array(this._nextPositions));
            // this._attributes.nextPosition.needsUpdate = true;

            this._attributes.uv.copyArray(new Float32Array(this._uvs));
            this._attributes.uv.needsUpdate = true;

            this._attributes.side.copyArray(new Float32Array(this._sides));
            this._attributes.side.needsUpdate = true;

            this._attributes.index.copyArray(new Uint16Array(this._indices));
            this._attributes.index.needsUpdate = true;
        }

        // 设置属性
        this._geometry.addAttribute("position", this._attributes.position);
        this._geometry.addAttribute("direction",this._attributes.direction);
        // this._geometry.addAttribute("lastPosition", this._attributes.lastPosition);
        // this._geometry.addAttribute("nextPosition", this._attributes.nextPosition);
        this._geometry.addAttribute("uv", this._attributes.uv);
        this._geometry.addAttribute("side",this._attributes.side);
        this._geometry.setIndex(this._attributes.index);

        //----------初始化3d物体----------
        this._object3d = new THREE.Mesh(this._geometry,this._material);
    }

    //----------------------------------------对外属性方法----------------------------------------
    get object3d(){
        return this._object3d;
    }

    get material(){
        return this._material;
    }

    get points(){
        return this._points;
    }

    set points(points){
        this._points = points || [new THREE.Vector3(-1,0,0),new THREE.Vector3(1,0,0)];
        this.process();
    }

    // get width(){
    //     return this._width;
    // }
    //
    // set width(width){
    //     this._width = width || 1;
    //     this._material.uniforms.width.value = this._width;
    // }


    get distance(){
        return this.distance;
    }

    resize(size){
        let resolution = this.material.resolution;
        resolution.x = size.width;
        resolution.y = size.height;
    }

    static resize(size){
        rendererSize = {...size};
        coolLines.forEach((coolLine)=>{
            coolLine.resize(size);
        })
    }
}