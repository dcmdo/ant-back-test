import * as THREE from 'three';
import ThreeLibs from 'ThreeLibs';
import CoolMath from 'CoolMath';
import RippleTween from 'RippleTween';

const defaultAnimHandle = (sprite,interpolation,debug)=>{
    let scale = THREE.Math.lerp(0.001,1,interpolation);
    sprite.scale.set(scale,scale,scale);

    let opacity = CoolMath.sectionLerp([[0,0],[0.4,1],[0.7,1],[1,0]],interpolation);
    sprite.material.opacity = opacity;
    if(debug){
        console.log(sprite,scale,sprite.material.opacity,sprite.parent.name);
    }
};

/**
 * 波形指示精灵图
 * paras:{
 *     count {Number} 波的数量
 *     life {Number} 生命周期
 *     map {Texture} 贴图
 * }
 * animHandle:(sprite, interpolation(0-1))=>{}
 */
export default class RippleSprite extends THREE.Object3D{
    constructor(paras,animHandle){
        super();
        this.declareVars(paras,animHandle);
        this.initDefaultProps();
        this.setNode();
        this.setRippleTween();
    }
    //----------------------------------------内部属性及方法----------------------------------------
    declareVars(paras,animHandle){
        this.type = "RippleSprite";
        //----------私有----------
        this._paras = paras || {};
        this._animHandle = animHandle || defaultAnimHandle;
        this._sprites = [];
        this._rippleTween = null;
    }

    // 属性设置时过滤及设置默认值，有助于粒子系统的性能提升
    initDefaultProps(){
        this.count = this.count;
        this.life = this.life;
    }

    setNode(){
        this.name = "ripple-sprite";
        this._disposeComponents = this._disposeComponents || [];
        this._disposeComponents.push(this);
    }

    setSprites(){
        //释放
        if(this._sprites){
            for(let i = this._sprites.length-1; i>-1; i--){
                ThreeLibs.Dispose.disposeObject3D(this.sprites[i]);
            }
        }

        //创建新的
        this._sprites = [];
        let count = this.count;
        let lifeSegment = this.life/count;
        for(let i=0; i<count; i++){
            //初始化精灵
            let material = new THREE.SpriteMaterial({
                map:this._paras.map || null,
                transparent:true, depthWrite:false
            });
            let sprite = new THREE.Sprite(material);

            //初始化波形精灵的初始生命值
            sprite.rippleCurrentLife = i * lifeSegment;
            this.add(sprite);
            this._sprites.push(sprite);
        }
    }

    setRippleTween(){
        //初始化协同更新模块
        this._rippleTween = new RippleTween({
            duration:this.life,
            rippleCount:this.count,
            onUpdate:(rippleIndex,delta)=>{
                let sprite = this.sprites[rippleIndex];
                sprite.renderOrder = THREE.Math.lerp(1,0,delta);
                this.animHandle(sprite,delta);
            }
        });
        this._rippleTween.play();
    }

    //----------对象在被移除或销毁时自动释放资源，无需手动调用----------
    _dispose(){
        this.stop();
        this._rippleTween = null;
    }
    //----------------------------------------对外属性----------------------------------------
    get sprites(){
        return this._sprites;
    }

    // 波数
    get count(){
        return this._paras.count;
    }
    set count(count){
        this._paras.count = count || 3;
        if(this._rippleTween){
            this._rippleTween.rippleCount = this.count;
        }
        this.setSprites();
    }

    // 生命周期
    get life(){
        return this._paras.life;
    }
    set life(life){
        this._paras.life = life || 1;
        if(this._rippleTween){
            this._rippleTween.duration = this.life;
        }
    }

    get animHandle(){
        return this._animHandle;
    }
    set animHandle(animHandle){
        this._animHandle = animHandle || defaultAnimHandle;
    }

    play(){
        this._rippleTween.play();
    }

    stop(){
        this._rippleTween.stop();
    }

    // 重写父组件方法
    clone(recursive=false) {
        let clone = new RippleSprite({...this._paras});
        clone._superCopy(this);
        return clone;
    }

    _superCopy(source){
        super.copy(source,false);
    }

    copy(source, recursive=false) {
        this._superCopy(source);
        this._paras = {...source._paras};
        this.animHandle = source.animHandle;
        this.initDefaultProps();
        return this;
    }
}