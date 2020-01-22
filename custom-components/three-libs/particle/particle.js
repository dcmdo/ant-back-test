import * as THREE from "three";
import RenderMode from './render-mode/render-mode';
import PointShape from './shape/point-shape';
import SphereShape from './shape/sphere-shape';
import EdgeShape from './shape/edge-shape';
import BoxShape from './shape/box-shape';
import ConeShape from './shape/cone-shape';
import GermetryShape from './shape/geometry-shape';
import Coroutine from "Coroutine";
import ThreeLibs from "ThreeLibs";
import CoolMath from "CoolMath";
import TypesCheck from "TypesCheck";
import ObjectFns from "ObjectFns";

/**
 * duration {Number} 持续多长时间 0 // 如果有值，则不循环播放。
 * autoDispose:{Boolen}自动释放。
 * maxCount:{Number} 最大粒子数 100；
 * startSize:{[{Number},{Number}]} 粒子大小 [1,1]；
 * startLife:{[{Number},{Number}]} 粒子生命 [5,5]；
 * startSpeed:{[{Number},{Number}]} 粒子速度 [1,1]；
 * startRotation:{
 *     viewRotation:{[{Number},{Number}]} [0,0]
 *     threeRotation:{[[x,y,z],[x,y,z]]}[[0,0,0],[0,0,0]]
 * }
 * gravity:0
 * force:[[0,0,0] [0,0,0]]
 * startColor:{[{Color},{Color}]} 颜色区间 ["white","white"]
 * startOpacity:{[{Number,Number}]} 透明度区间 [1, 1]
 * textureAnimation:{
 *     tile:[{Number},{Number}] 贴图重复数
 *     offset:[{Number},{Number}] 贴图漂移数
 *     cycle:{Number} 循环数 1
 *     isRandom:false,
 *     isPlay:{Boolen} false
 * }
 * material:{ParticleMaterial} 材质
 * shape:{Shape}
 * emission:{
 *     rate: {Number} 10,
 *     bursts:{[[time,value],[time,value]...]} null
 * }
 * simulationSpace:"local" || "world"
 * renderMode:{RenderMode}
 // 时间线效果
 * timeSize:[time,size,time,size,……] 数值对不能超过5个 time：0-1
 * timeRotation{
 *     viewRotation:{[{Number},{Number}]} [0,2PI]
 *     threeRotation:{[[x,y,z],[x,y,z]]}[[0,0,0],[2PI,2PI,2PI]]
 * }
 * timeColor:[time,color,time,color,……] 数值对不能超过5个 time：0-1
 * timeOpacity:[time,opacity,time,opacity,……] 数值对不能超过5个 time：0-1
 */
export default class Particle extends THREE.Mesh{
    constructor(paras){
        let geometry = new THREE.InstancedBufferGeometry();
        paras = paras || {};
        paras.material = paras.material || new ThreeLibs.ParticleMaterial();
        super(geometry,paras.material);
        this.declareVars(paras);
        this.initDefaultProps();
        this.initMesh();
        this.play();
        this._firstInit = false;
    }

    //----------------------------------------内部属性方法----------------------------------------
    declareVars(paras){
        this._firstInit = true;

        this._paras = paras || {};

        // 粒子总时长
        this._totalTime = 0;

        // 出生相关参数
        this._bornCount = 0;

        this._startTime = [];
        this._force = [];

        // 粒子属性参数
        this._show = [];
        this._time= [];
        this._life = [];
        this._translate = [];
        this._size = [];
        this._initDirection = [];
        this._direction = [];
        this._viewRotation = [];
        this._threeRotation = [];
        this._timeViewRot = [];
        this._timeThreeRot = [];
        this._startColor = [];
        this._startOpacity = [];
        this._textureRandomIndex = [];

        this._isUpdateAttribute = false;
        // 协同程序
        this._coroutine = new Coroutine((delta)=>{
            this.update(delta);
        })
    }

    // 属性设置时过滤及设置默认值，有助于粒子系统的性能提升
    initDefaultProps(){
        this.duration = this.duration;
        this.maxCount = this.maxCount;
        this.startSize = this.startSize;
        this.startLife = this.startLife;
        this.startSpeed = this.startSpeed;
        this.startRotation = this.startRotation;
        this.gravity = this.gravity;
        this.force = this.force;
        this.startColor = this.startColor;
        this.startOpacity = this.startOpacity;
        this.textureAnimation = this.textureAnimation;
        this.shape = this.shape;
        this.emission = this.emission;
        this.simulationSpace = this.simulationSpace;
        this.renderMode = this.renderMode;

        this.timeSize = this.timeSize;
        this.timeRotation = this.timeRotation;
        this.timeColor = this.timeColor;
        this.timeOpacity = this.timeOpacity;

        this.material = this.material;
    }

    setGeometry(){
        // 创建几何体
        let refGeometry = this.renderMode.refGeometry;

        this.geometry.index = refGeometry.index;
        this.geometry.attributes = refGeometry.attributes;
        this.setAttributes();
    }

    setAttributes(){
        let maxCount = this.maxCount;
        let maxCount3 = maxCount*3;
        let attributes = {
            show: new THREE.InstancedBufferAttribute(new Int8Array(maxCount),1),
            time: new THREE.InstancedBufferAttribute(new Float32Array(maxCount),1),
            life: new THREE.InstancedBufferAttribute(new Float32Array(maxCount),1),
            translate: new THREE.InstancedBufferAttribute(new Float32Array(maxCount3),3),
            size: new THREE.InstancedBufferAttribute(new Float32Array(maxCount),1),
            initDirection: new THREE.InstancedBufferAttribute(new Float32Array(maxCount3),3),
            direction:new THREE.InstancedBufferAttribute(new Float32Array(maxCount3),3),
            viewRotation: new THREE.InstancedBufferAttribute(new Float32Array(maxCount),1),
            threeRotation: new THREE.InstancedBufferAttribute(new Float32Array(maxCount3),3),
            startColor: new THREE.InstancedBufferAttribute(new Float32Array(maxCount3),3),
            startOpacity: new THREE.InstancedBufferAttribute(new Float32Array(maxCount),1),
            textureRandomIndex:new THREE.InstancedBufferAttribute(new Int8Array(maxCount),1),
            timeViewRot: new THREE.InstancedBufferAttribute(new Float32Array(maxCount),1),
            timeThreeRot: new THREE.InstancedBufferAttribute(new Float32Array(maxCount3),3),
        };
        for(let key in attributes){
            this.geometry.addAttribute( key, attributes[key] );
        }
    }

    initMesh(){
        this.setGeometry();
        this._disposeComponents = this._disposeComponents || [];
        this._disposeComponents.push(this);
    }

    // 生命周期内相关函数
    update(delta){
        this._isUpdateAttribute = false;
        //检测粒子死亡情况
        this.checkLife();
        let duration = this.duration;
        if(duration > 0 && duration <= this._totalTime){
            // 检测当前所有粒子 如果全死 则终止。
            if(this.autoDispose){
                ThreeLibs.Dispose(this);
            }else {
                this.stop();
            }
        }else{
            // 出生粒子
            this.born(delta);
        }
        this.updateParticle(delta);
        this._totalTime += delta;
    }

    checkLife(){
        let currentCount = this.currentCount;
        for( let i = currentCount - 1; i > -1; i--){
            if(this._time[i] >= 1){
                let i3 = i*3;
                this._startTime.splice(i,1);
                this._force.splice(i3,3);

                this._life.splice(i,1);
                this._show.splice(i,1);
                this._translate.splice(i3,3);
                this._initDirection.splice(i3,3);
                this._direction.splice(i3,3);
                this._size.splice(i,1);
                this._time.splice(i,1);
                this._viewRotation.splice(i,1);
                this._threeRotation.splice(i3,3);
                this._startColor.splice(i3,3);
                this._startOpacity.splice(i,1);
                this._timeViewRot.splice(i,1);
                this._timeThreeRot.splice(i3,3);
                this._textureRandomIndex.splice(i,1);
                if(!this._isUpdateAttribute){
                    this._isUpdateAttribute = true;
                }
            }
        }
    }

    //----------更新粒子----------
    updateParticle(delta){
        let currentCount = this.currentCount;

        for( let i = 0; i < currentCount; i++){
            // 更新时间
            this.updateTime(i);
            // 更新位置
            this.updateTranslate(i,delta);
        }

        let attributes = [];
        if(this._isUpdateAttribute){
            let attribute = this.geometry.attributes.show;
            let newArray = new Int8Array(this.maxCount);
            newArray.set(this._show);
            attribute.copyArray(newArray);
            attribute.needsUpdate = true;

            attributes = [
                ["time",this._time,Float32Array], ["translate",this._translate,Float32Array],
                ["direction",this._direction,Float32Array],["initDirection",this._initDirection,Float32Array],
                ["life",this._life,Float32Array],
                ["size",this._size,Float32Array], ["viewRotation",this._viewRotation,Float32Array],
                ["threeRotation",this._threeRotation,Float32Array],["startColor",this._startColor,Float32Array],
                ["startOpacity",this._startOpacity,Float32Array],["timeViewRot",this._timeViewRot,Float32Array],
                ["timeThreeRot",this._timeThreeRot,Float32Array],["textureRandomIndex",this._textureRandomIndex,Float32Array]
            ];

        }else{
            attributes = [
                ["time",this._time,Float32Array], ["translate",this._translate,Float32Array],
                ["direction",this._direction,Float32Array]
            ];
        }
        attributes.forEach((attributeInfo)=>{
            let key = attributeInfo[0];
            let array = attributeInfo[1];
            let bufferArray = attributeInfo[2];

            let attribute = this.geometry.attributes[key];
            attribute.copyArray(new bufferArray(array));
            attribute.needsUpdate = true;
        });
    }
    updateTime(index){
        let startTime = this._startTime[index];
        let life = this._life[index];
        this._time[index] = life === 0 ? 1 : CoolMath.clamp(0,1,(this._totalTime - startTime)/life);
    }
    updateTranslate(index,delta){
        let index3 = index * 3;
        let index3_1 = index3 + 1;
        let index3_2 = index3 + 2;
        let gravity = this.gravity;
        let force = this._force;
        if(gravity !== 0){
            if(this.isLocal){
                let maxtrixWorldInverse = new THREE.Matrix4().getInverse(this.matrixWorld);
                let gravityDir = new THREE.Vector3(0,1,0).transformDirection(maxtrixWorldInverse);
                gravityDir.multiplyScalar(-9.8 * gravity);
                this._direction[index3] += gravityDir.x * delta;
                this._direction[index3_1] += gravityDir.y * delta;
                this._direction[index3_2] += gravityDir.z * delta;
            }else{
                this._direction[index3_1] -= 9.8 * gravity * delta;
            }
        }
        this._direction[index3] += force[index3] * delta;
        this._direction[index3_1] += force[index3_1] * delta;
        this._direction[index3_2] += force[index3_2] * delta;

        this._translate[index3] += this._direction[index3] * delta;
        this._translate[index3_1] += this._direction[index3_1] * delta;
        this._translate[index3_2] += this._direction[index3_2] * delta;
    }

    //----------出生粒子----------
    born(delta){
        let rate = this.emission.rate;
        if(rate){
            this._bornCount += rate*delta;
        }
        if(this._bornCount > 1){
            let bornCount = Math.floor(this._bornCount);
            this._bornCount -= bornCount;

            let maxCount = this.maxCount;
            let currentCount = this.currentCount;
            if((currentCount + bornCount) > maxCount){
                bornCount = (maxCount - currentCount) || 0;
            }
            for(let i = 0; i < bornCount; i++){
                this.bornAttribute();
            }
            if(bornCount >0 ){
                this._isUpdateAttribute = true;
            }
        }
    }

    bornAttribute(){
        this._show.unshift(1);

        this._size.unshift(CoolMath.randomFloat(...this.startSize));

        this._life.unshift(CoolMath.randomFloat(...this.startLife));
        this._startTime.unshift(this._totalTime);

        let speed = CoolMath.randomFloat(...this.startSpeed);
        let matrixWorld = this.matrixWorld;
        let shapeInfo = this.shape.bornShapeInfo();
        if(this.isLocal){
            shapeInfo.dir = shapeInfo.dir.normalize();
        }else{
            shapeInfo.dir = shapeInfo.dir.transformDirection(matrixWorld);
            shapeInfo.pos = shapeInfo.pos.applyMatrix4(matrixWorld);
        }
        this._translate.unshift( shapeInfo.pos.x, shapeInfo.pos.y, shapeInfo.pos.z);
        this._initDirection.unshift(shapeInfo.dir.x,shapeInfo.dir.y,shapeInfo.dir.z);
        this._direction.unshift(shapeInfo.dir.x * speed, shapeInfo.dir.y * speed, shapeInfo.dir.z * speed);

        this._viewRotation.unshift(CoolMath.randomFloat(...this.startRotation.viewRotation));
        this._threeRotation.unshift(...CoolMath.randomFloatArray(...this.startRotation.threeRotation));

        this._force.unshift(...CoolMath.randomFloatArray(...this.force));

        let startColor = this.startColor;
        let color;
        if(startColor[0] === startColor[1]){
            color = new THREE.Color(startColor[0]);
        }else{
            color = new THREE.Color(startColor[0]);
            color = color.lerp(new THREE.Color(startColor[1]),CoolMath.randomFloat(0,1));
        }
        this._startColor.unshift(color.r,color.g,color.b);

        this._startOpacity.unshift(CoolMath.randomFloat(...this.startOpacity));

        if(this.isRandom){
            let title = this.textureAnimation.tile;
            this._textureRandomIndex.unshift(CoolMath.randomInt(0,title[0]*title[1]-1));
        }else{
            this._textureRandomIndex.unshift(0);
        }

        this._timeViewRot.unshift(CoolMath.randomFloat(...this.timeRotation.viewRotation));
        this._timeThreeRot.unshift(...CoolMath.randomFloatArray(...this.timeRotation.threeRotation));
    }

    // 粒子参数
    get paras(){
        return this._paras;
    }

    get currentCount(){
        return this._size.length;
    }

    _dispose(){
        this._coroutine.stop();this._coroutine = null;
    }
    //----------------------------------------对外属性及方法----------------------------------------
    get duration(){
        return this._paras.duration;
    }
    set duration(duration){
        this._paras.duration = duration || 0;
    }

    get autoDispose(){
        return this._paras.autoDispose;
    }
    set autoDispose(autoDispose){
        this._paras.autoDispose = autoDispose===false?false:true;
    }

    get maxCount(){
        return this._paras.maxCount;
    }
    set maxCount(maxCount){
        let _maxCount = maxCount || 100;
        if(_maxCount !== this._paras.maxCount){
            this._paras.maxCount = _maxCount;
            if(!this._firstInit){
                this.setAttributes();
            }
        }
    }

    get startSize(){
        return this._paras.startSize;
    }
    set startSize(startSize){
        this._paras.startSize = startSize || [1, 1];
    }

    get startLife(){
        return this._paras.startLife;
    }
    set startLife(startLife){
        this._paras.startLife = startLife || [5, 5];
    }

    get startSpeed(){
        return this._paras.startSpeed;
    }
    set startSpeed( startSpeed ){
        this._paras.startSpeed = startSpeed || [5, 5];
    }

    get startRotation(){
       return this._paras.startRotation;
    }
    set startRotation(startRotation){
        this._paras.startRotation =  {
            viewRotation:[0, 0],
            threeRotation:[[0,0,0], [0,0,0]],
            ...startRotation
        };
    }

    get gravity(){
        return this._paras.gravity;
    }
    set gravity(gravity){
        let _gravity = TypesCheck.isNumber(gravity) ? gravity : 0;
        this._paras.gravity = _gravity;
    }

    get force(){
        return this._paras.force;
    }
    set force( force ){
        this._paras.force = force || [[0,0,0],[0,0,0]];
    }

    get startColor(){
        return this._paras.startColor;
    }
    set startColor(startColor){
        this._paras.startColor = startColor || ["white","white"];
    }

    get startOpacity(){
        return this._paras.startOpacity;
    }
    set startOpacity( startOpacity ){
        this._paras.startOpacity = startOpacity || [1,1];
    }

    get tile(){
        return new THREE.Vector2(...this.textureAnimation.tile);
    }
    get offset(){
        return new THREE.Vector2(...this.textureAnimation.offset);
    }
    get cycle(){
        return this.textureAnimation.cycle;
    }
    get isRandom(){
        return this.textureAnimation.isRandom;
    }
    get isPlay(){
        return this.textureAnimation.isPlay;
    }
    get textureAnimation(){
        return this._paras.textureAnimation;
    }
    set textureAnimation(textureAnimation){
        this._paras.textureAnimation = {
            tile:[1, 1],
            offset:[0,0],
            cycle:1,
            isPlay:true,
            ...textureAnimation
        };
        try{
            this.material.tile = this.tile;
            this.material.offset = this.offset;
            this.material.cycle = this.cycle;
            this.material.isPlay = this.isPlay;
        }catch (e) {}
    }

    get material(){
        return this._paras.material;
    }

    set material(material){
        if(!this._paras){
            return;
        }
        this._paras.material = material || new ThreeLibs.ParticleMaterial({});
        this.material.isLocal = this.isLocal;
        this.material.algin = this.algin;
        this.material.timeSize = this.timeSize;
        this.material.timeColor = this.timeColorArray;
        this.material.timeOpacity = this.timeOpacity;
        this.material.tile = this.tile;
        this.material.offset = this.offset;
        this.material.cycle = this.cycle;
        this.material.isPlay = this.isPlay;
    }

    get shape(){
        return this._paras.shape;
    }
    set shape(shape){
        this._paras.shape = shape || new PointShape();
    }

    get emission(){
        return this._paras.emission;
    }
    set emission(emission){
        this._paras.emission = {
            rate: 10,
            bursts: null,
            ...emission
        };
    }

    get isLocal(){
        return this.simulationSpace !== "world";
    }
    get simulationSpace(){
        return this._paras.simulationSpace;
    }
    set simulationSpace(simulationSpace){
        this._paras.simulationSpace = simulationSpace || "local";
        try{
            this.material.isLocal = this.isLocal;
        }catch (e) {}
    }

    get algin(){
        const alginValue = {"view":0,"local":1,"speed":2,"stretched":3};
        return alginValue[this.renderMode.algin];
    }
    get renderMode(){
        return this._paras.renderMode;
    }
    set renderMode(renderMode){
        this._paras.renderMode = renderMode || new RenderMode();
        this.renderMode.updateHandle = ()=>{
            this.setGeometry();
        };
        try{
            this.material.algin = this.algin;
        }catch (e) {}
    }

    get timeSize(){
        return this._paras.timeSize;
    }
    set timeSize(timeSize){
        this._paras.timeSize = timeSize || [0,1,1,1];
        try{
            this.material.timeSize = this.timeSize;
        }catch (e) {}
    }

    get timeRotation(){
        return this._paras.timeRotation;
    }
    set timeRotation(timeRotation){
        this._paras.timeRotation =  {
            viewRotation:[0, 0],
            threeRotation:[[0,0,0], [0,0,0]],
            ...timeRotation
        };
    }

    get timeColorArray(){
        let timeColor = this.timeColor;
        let count = timeColor.length/2;
        let array = [];
        for(let i = 0; i < count; i++){
            let index = i*2;
            let color = new THREE.Color(timeColor[index+1]);
            array.push(timeColor[index],color.r,color.g,color.b);
        }
        return array;
    }
    get timeColor(){
        return this._paras.timeColor;
    }
    set timeColor(timeColor){
        this._paras.timeColor = timeColor || [0,"white",1,"white"];
        try{
            this.material.timeColor = this.timeColorArray;
        }catch (e) {}
    }

    get timeOpacity(){
        return this._paras.timeOpacity;
    }
    set timeOpacity(timeOpacity){
        this._paras.timeOpacity = timeOpacity || [0,1,1,1];
        try{
            this.material.timeOpacity = this.timeOpacity;
        }catch (e) {}
    }

    play(){
        this._coroutine.start();
    }

    pause(){
        this._coroutine.stop();
    }

    stop(){
        this._coroutine.stop();
        // 重置数据
        this._totalTime = 0;this._bornCount = 0;this._startTime = [];
        this._force = [];this._show = [];this._time= [];this._life = [];
        this._translate = [];this._size = [];this._initDirection = [];
        this._direction = [];this._viewRotation = [];this._threeRotation = [];
        this._timeViewRot = [];this._timeThreeRot = [];this._startColor = [];
        this._startOpacity = [];this._textureRandomIndex = [];this._isUpdateAttribute = false;
    }

    //----------重写父组件方法----------
    clone(recursive) {
        let clone = new Particle(this._copyParas(this._paras));
        clone._superCopy(this,recursive);
        return clone;
    }

    _copyParas(paras){
        let _paras = {};
        [
            "duration","autoDispose","maxCount","gravity","simulationSpace"
        ].forEach((key)=>{
            _paras[key] = paras[key];
        });
        [
            "startSize","startLife","startSpeed","startRotation","force",
            "startColor","startOpacity","textureAnimation","emission",
            "timeSize","timeRotation","timeColor","timeOpacity"
        ].forEach((key)=>{
            _paras[key] = ObjectFns.clone(paras[key]);
        });
        [
            "shape","material","renderMode"
        ].forEach((key)=>{
            _paras[key] = paras[key].clone();
        });
        return _paras;
    }

    _superCopy(source, recursive){
        super.copy(source, recursive);
    }

    copy(source, recursive) {
        this._superCopy(source, recursive);
        this._paras = this._copyParas(source._paras);
        this.initDefaultProps();
        return this;
    }
}

Particle.RenderMode = RenderMode;
Particle.Shape = {
    PointShape:PointShape,
    SphereShape:SphereShape,
    EdgeShape:EdgeShape,
    BoxShape:BoxShape,
    ConeShape:ConeShape,
    GermetryShape:GermetryShape
};
