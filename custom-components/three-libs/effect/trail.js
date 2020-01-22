import * as THREE from 'three';
import ThreeLibs from 'ThreeLibs';
import Coroutine from 'Coroutine';

export default class Trail extends THREE.Mesh{
    /**
     * length:{Number} 10
     * spacing:{Number} 0.1
     * duration:{Number} 1
     * width:{Number} 1
     * isAttenuation:{Boolen} true
     * isStretch: {Boolen} false
     * startColor:{Color} white
     * endColor:{Color} black
     * material:{TrailMaterial}
     * @param paras
     */
    constructor(paras){
        let geometry = new THREE.BufferGeometry();
        paras = paras || {};
        paras.material = paras.material || new ThreeLibs.TrailMaterial();
        super(geometry,paras.material);
        this.declareVars(paras);
        this.initDefaultProps();
        this.initMesh();
        this.play();
    }
    //----------------------------------------内部属性变量----------------------------------------
    declareVars(paras){
        //----------私有变量----------
        this._firstInit = true;

        this._paras = paras;
        this._attributes = null;
        this._maxCount = 0;

        this._positions = [];
        this._axises = [];
        this._distance = 0;
        this._distances = [];
        this._curSpacing = 0;
        this._lastPosition = this.getWorldPosition(new THREE.Vector3());
        this._currentPosition = this._lastPosition.clone();

        this._coroutine = new Coroutine((deltaTime)=>{
            this.update(deltaTime);
        });
    }

    // 属性设置时过滤及设置默认值，有助于性能提升
    initDefaultProps(){
        this.duration = this.duration;
        this.length = this.length;
        this.spacing = this.spacing;
        this.width = this.width;
        this.isAttenuation = this.isAttenuation;
        this.material = this.material;
    }

    setAttributes(){
        let maxCount = this.maxCount*2;
        let maxCount2 = maxCount*2;
        let maxCount3 = maxCount*3;
        let maxCountIndex = (this.maxCount-1)*6;

        this._attributes = {
            position:new THREE.BufferAttribute(new Float32Array(maxCount3),3),
            uv:new THREE.BufferAttribute(new Float32Array(maxCount2),2),
            widthRatio:new THREE.BufferAttribute(new Float32Array(maxCount),1),
            side:new THREE.BufferAttribute(new Int8Array(maxCount),1),
            axis:new THREE.BufferAttribute(new Float32Array(maxCount3),3),
            index:new THREE.BufferAttribute(new Uint16Array(maxCountIndex),1)
        };

        // 设置左右边及index
        let sideMaxCount = this.maxCount;
        let indexMaxCount = sideMaxCount-1;
        for(let i=0; i < sideMaxCount; i++){
            let i2 = i*2;
            let i6 = i*6;
            this._attributes.side.setXY(i2,-1,1);
            if(i<indexMaxCount){
                this._attributes.index.set([i2,i2+1,i2+2,i2+2,i2+1,i2+3],i6);
            }
        }
        // 添加属性
        for(let key in this._attributes){
            if(key !== "index"){
                this.geometry.addAttribute(key,this._attributes[key]);
            }else{
                this.geometry.setIndex(this._attributes[key]);
            }
        }
    }

    initMesh(){
        this.type = "Trail";
        this.setAttributes();
        this._firstInit = false;
        this.frustumCulled = false;
    }

    changeAttribute(){
        // 位置
        let posArray = [];
        this._positions.forEach((position)=>{
            posArray.push(position,position);
        });
        this._attributes.position.copyVector3sArray(posArray);
        this._attributes.position.needsUpdate = true;

        // 轴向
        let axisArray = [];
        this._axises.forEach((axis)=>{
            axisArray.push(axis,axis);
        });
        this._attributes.axis.copyVector3sArray(axisArray);
        this._attributes.axis.needsUpdate = true;

        // uv及宽度衰减
        let width = this.width;
        let isStretch = this.isStretch;
        let isAttenuation = this.isAttenuation;
        let v = 1;
        this._distances.forEach((distance,index)=>{
            let index2 = index*2;
            v = isStretch ? (distance/this._distance) || 0 : distance/width;
            this._attributes.uv.setXYZW(index2,0,v,1,v);
            let widthRatio = isAttenuation ? (distance/this._distance) || 0 : 1;
            this._attributes.widthRatio.setXY(index2,widthRatio,widthRatio);
        });
        this._attributes.uv.needsUpdate = true;
        this._attributes.widthRatio.needsUpdate = true;
        this.material.maxV = v;

        // 设置渲染范围
        this.geometry.setDrawRange(0,(this.currentCount - 1)*6);
    }

    // 长度衰减
    lengthAttenuation(len){
        let _len = len;
        let deleteCount = 0;
        for(let i = 0; i<(this.currentCount-1); i++){
            let firstPos = this._positions[i];
            let nextPos = this._positions[i+1];
            let dis = firstPos.distanceTo(nextPos);
            if(dis>_len){
                let ratio = _len/dis;
                firstPos.lerp(nextPos,ratio);
                this._axises[i].lerp(this._axises[i+1],ratio).normalize();
                break;
            }else {
                deleteCount += 1;
                _len -= dis;
            }
        }
        this._distance -= len;
        for(let i = 1; i<this._distances.length;i++){
            this._distances[i] -= len;
        }
        if(deleteCount){
            if(this.currentCount - deleteCount <2){
                this._distance = 0;
                this._distances = [];
                this._positions = [];
                this._axises = [];
            }else{
                this._positions.splice(0,deleteCount);
                this._axises.splice(0,deleteCount);
                this._distances.splice(0,deleteCount);
                this._distances[0] = 0;
            }
        }
    }
    //更新点
    updatePoints(deltaTime){
        this.getWorldPosition(this._currentPosition);
        let distance = this._lastPosition.distanceTo(this._currentPosition);
        // 如果位置未改变
        if(!distance){
            if(this.currentCount){
                let len = deltaTime/this.duration;
                this.lengthAttenuation(len);
                return true;
            }
            return false;
        }

        let matrixArray = this.matrixWorld.elements;
        let axis = new THREE.Vector3(matrixArray[0],matrixArray[1],matrixArray[2]).normalize();

        // 如果队列为空，添加新点
        if(this.currentCount === 0 ){
            this._positions.push(this._lastPosition.clone(),this._lastPosition.clone());
            this._axises.push(axis.clone(),axis.clone());
            this._distances.push(0,0);
        }

        this._lastPosition.copy(this._currentPosition);
        this._curSpacing += distance;
        this._distance += distance;
        // 如果当前阈值大于新增点阈值,并且当前点数未超出最大点数则新增点
        if(this._curSpacing >= this.spacing && this.currentCount<this.maxCount){
            this._positions.push(this._lastPosition.clone());
            this._axises.push(axis.clone());
            this._distances.push(this._distance);
            this._curSpacing = 0;
        }else {// 未达到新增点要求，则更新最后一个点位置
            let lastIndex = this._positions.length - 1;
            this._positions[lastIndex].copy(this._lastPosition);
            this._axises[lastIndex].copy(axis);
            this._distances[lastIndex] = this._distance;
        }
        // 根据长度限制更新点序列
        if(this._distance > this.length){
            let len = this._distance - this.length;
            this.lengthAttenuation(len);
        }
        return true;
    }

    update(deltaTime){
        if(this.updatePoints(deltaTime)){
            this.changeAttribute();
        }
    }

    get currentCount(){
        return this._positions.length;
    }

    //----------------------------------------对外属性及方法----------------------------------------
    get maxCount(){
        return this._maxCount;
    }

    get duration(){
        return this._paras.duration;
    }
    set duration(duration){
        this._paras.duration = duration || 1;
    }

    get length(){
        return this._paras.length;
    }
    set length(length){
        this._paras.length = length || 10;
        try{
            this._maxCount = Math.ceil(this.length/this.spacing) + 1;
            if(!this._firstInit){
                this.setAttributes();
            }
        }catch (e) {}
    }

    get spacing(){
        return this._paras.spacing;
    }
    set spacing(spacing){
        this._paras.spacing = spacing || 0.1;
        try{
            this._maxCount = Math.ceil(this.length/this.spacing) + 1;
            if(!this._firstInit){
                this.setAttributes();
            }
        }catch (e) {}
    }

    get width(){
        return this._paras.width;
    }
    set width(width){
        this._paras.width = width || 1;
        try{
            this.material.width = this.width;
        }catch (e) {}
    }

    get isAttenuation(){
        return this._paras.isAttenuation;
    }
    set isAttenuation(isAttenuation){
        this._paras.isAttenuation = isAttenuation===false ? false : true;
        try{
            this.material.isAttenuation = this.isAttenuation;
        }catch (e) {}
    }

    get isStretch(){
        return this._paras.isStretch;
    }
    set isStretch(isStretch){
        this._paras.isStretch = isStretch===true ? true : false;
    }

    get material(){
        return this._paras.material;
    }
    set material(material){
        if(!this._paras){
            return;
        }
        this._paras.material = material || new ThreeLibs.TrailMaterial();

        this.material.width = this.width;
    }

    play(){
        this._coroutine.start();
    }
    stop(){
        this._coroutine.stop();
    }
}