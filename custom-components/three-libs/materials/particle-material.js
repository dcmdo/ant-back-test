import * as THREE from 'three';
import ShaderMat3 from "../shader-segment/shader-mat3";
import ShaderVect from "../shader-segment/shader-vect";
import ShaderQuaternion from "../shader-segment/shader-quaternion";
/**
 * 参数
 * color {THREE.Color} "white"
 * map {THREE.Texture} null
 * alphaMap {THREE.Texture} null
 * opacity
 // 不可主动更改的属性
 * isLocal: true
 * algin: 0:view 1:local 2:speed 3:stretched
 * tile {THREE.Vector2} {x:1,y:1}
 * offset {THREE.Vector2} {x:0,y:0}
 */
export default class ParticleMaterial extends THREE.ShaderMaterial{
    constructor(parameters){
        parameters = {
            blending:THREE.AdditiveBlending,
            ...parameters,
            transparent:true,
            depthWrite:false,
            side:THREE.DoubleSide
        };
        super(parameters);
        this.initType();
        this.initUniforms(parameters);
        this.setDefines();
        this.initShader();
    }

    //----------------------------------------内部属性变量----------------------------------------
    initType(){
        this.type = "ParticleMaterial";
    }

    initUniforms(parameters){
        this.uniforms = {
            ...{
                isLocal: { value: true },
                algin: {value: 0},
                timeSize:{value:[0,0,0,0]},
                timeColor:{value:[0,0,0,0,0,0,0,0]},
                timeOpacity:{value:[0,0,0,0]},
                tile:{value: new THREE.Vector2(1,1)},
                offset:{value: new THREE.Vector2(0,0)},
                cycle:{value: 1},
                isPlay:{value: true},

                color: { value: new THREE.Color("white") },
                opacity: { value: 1.0 },
                map: { value: null },
                alphaMap: { value: null }
            }
        };
        this.setValues(parameters);
    }

    setDefines(){
        let tile = this.tile;
        this.defines = {
            HAS_MAP:this.map !== null,
            HAS_ALPHAMAP:this.alphaMap !== null,
            UVS_COUNT:tile.x*tile.y,
            V:1/tile.y
        };
    }

    initShader(){
        this.vertexShader = this.vShader;
        this.fragmentShader = this.fShader;
    }

    get sectionLerpFloat(){
        return [
            "float sectionLerpFloat(float array[10], float interpolation){",
                "float minTime = 0.0;",
                "float maxTime = 0.0;",
                "float minValue = 0.0;",
                "float maxValue  = 0.0;",
                "for(int i = 0; i < 4; i++){",
                    "float time = array[i*2];",
                    "float time1 = array[i*2+2];",
                    "if(time1 <= time){",
                        "break;",
                    "}",
                    "if(time <= interpolation){",
                        "minTime = time;",
                        "minValue = array[i*2+1];",
                        "maxTime = time1;",
                        "maxValue = array[i*2+3];",
                    "}",
                "}",
                "if(minValue == maxValue){",
                    "return minValue;",
                "}",
                "return mix(minValue,maxValue,(interpolation-minTime)/(maxTime-minTime));",
            "}",
        ];
    }
    get sectionLerpColor(){
        return [
            "vec3 sectionLerpColor(float array[20], float interpolation){",
                "float minTime = 0.0;",
                "float maxTime = 0.0;",
                "vec3 minColor = vec3(0.0);",
                "vec3 maxColor  = vec3(0.0);",
                "for(int i = 0; i < 4; i++){",
                    "float time = array[i*4];",
                    "float time1 = array[i*4+4];",
                    "if(time1 <= time){",
                        "break;",
                    "}",
                    "if(time <= interpolation){",
                        "minTime = time;",
                        "minColor = vec3(array[i*4+1],array[i*4+2],array[i*4+3]);",
                        "maxTime = time1;",
                        "maxColor = vec3(array[i*4+5],array[i*4+6],array[i*4+7]);",
                    "}",
                "}",
                "if(minColor == maxColor){",
                    "return minColor;",
                "}",
                "return mix(minColor,maxColor,(interpolation-minTime)/(maxTime-minTime));",
            "}",
        ];
    }

    get vShader(){
        return [
            "uniform bool isLocal;",
            "uniform int algin;",
            "uniform float timeSize[10];",

            "attribute float show;",
            "attribute float time;",
            "attribute float life;",
            "attribute vec3 translate;",
            "attribute vec3 direction;",
            "attribute vec3 initDirection;",
            "attribute float size;",
            "attribute float viewRotation;",
            "attribute vec3 threeRotation;",
            "attribute vec3 startColor;",
            "attribute float startOpacity;",
            "attribute float textureRandomIndex;",
            "attribute float timeViewRot;",
            "attribute vec3 timeThreeRot;",

            "varying float _show;",
            "varying float _time;",
            "varying float _totalTime;",
            "varying vec2 _uv;",
            "varying vec3 _startColor;",
            "varying float _startOpacity;",
            "varying float _textureRandomIndex;",

            ...ShaderMat3.m3GetScale,
            ...ShaderVect.inverseTransformDirection,
            ...ShaderVect.projectOnPlane,
            ...ShaderQuaternion.qAxisAngle,
            ...ShaderQuaternion.qEuler,
            ...ShaderQuaternion.qTransformVect,
            ...ShaderQuaternion.qUnitVectors,

            ...this.sectionLerpFloat,

            "void main(){",
                "_show = show;",
                "if(show > 0.0){",
                    "_time = time;",
                    "_uv = uv;",
                    "_startColor = startColor;",
                    "_startColor = startColor;",
                    "_startOpacity = startOpacity;",
                    "_textureRandomIndex = textureRandomIndex;",

                    "float totalTime = time * life;",
                    "_totalTime = totalTime;",

                    // 位置
                    "vec4 pos = vec4( translate, 1.0 );",
                    "vec3 point = position.xyz;",
                    // 尺寸
                    "float _size = size * sectionLerpFloat(timeSize,time);",
                    "if(_size < 0.0){",
                        "_size = 0.0;",
                    "}",
                    "point *= _size;",

                    "if(algin == 1){",
                        "vec4 _rotQ = qEuler(threeRotation + timeThreeRot * totalTime,123);",
                        "point = qTransformVect(_rotQ,point);",
                        "pos.xyz += point;",
                    "}else if(algin == 2){",
                        "vec3 _direction = initDirection;",
                        "if(direction != vec3(0.0,0.0,0.0)){",
                            "_direction = normalize(direction);",
                        "}",
                        "vec3 _pDir = vec3(0.0,1.0,0.0);",
                        "if(_direction.x!=0.0 || _direction.z!=0.0){",
                            "_pDir = normalize(projectOnPlane(_direction,vec3(0.0,1.0,0.0)));",
                        "}",
                        "point = qTransformVect(qUnitVectors(vec3(0.0,0.0,1.0),_pDir),point);" +
                        "point = qTransformVect(qUnitVectors(_pDir,_direction),point);",
                        "vec4 _rotQ = qAxisAngle(_direction,viewRotation + totalTime * timeViewRot);",
                        "point = qTransformVect(_rotQ,point);",
                        "pos.xyz += point;",
                    "}else if(algin == 3){",
                        "vec3 _direction = initDirection;",
                        "if(direction != vec3(0.0,0.0,0.0)){",
                            "_direction = normalize(direction);",
                        "}",
                        "point = qTransformVect(qUnitVectors(vec3( 0.0, 1.0, 0.0 ),_direction),point);",
                        "vec3 camZ = inverseTransformDirection(vec3(0.0,0.0,1.0),viewMatrix);",
                        "camZ = projectOnPlane(camZ,_direction);",
                        "point = qTransformVect(qUnitVectors(vec3( 0.0, 0.0, 1.0 ),normalize(camZ)),point);",
                        "pos.xyz += point;",
                    "}",

                    "if(isLocal){",
                        "pos = modelViewMatrix * pos;",
                    "}else{",
                        "pos = viewMatrix * pos;",
                    "}",

                    "if(algin == 0){",
                        "point = m3GetScale(modelMatrix) * point;",
                        "vec4 _rotQ = qAxisAngle(vec3(0.0,0.0,1.0),viewRotation + totalTime * timeViewRot);",
                        "point = qTransformVect(_rotQ, point);",
                        "pos.xyz += point;",
                    "}",

                    "gl_Position = projectionMatrix * pos;",
                "}",
            "}"
        ].join('\r\n');
    }

    get fShader(){
        return [
            "uniform vec3 color;",
            "uniform float opacity;",
            "uniform sampler2D map;",
            "uniform sampler2D alphaMap;",
            "uniform float timeColor[20];",
            "uniform float timeOpacity[10];",
            "uniform vec2 tile;",
            "uniform vec2 offset;",
            "uniform float cycle;",
            "uniform bool isPlay;",

            "varying float _show;",
            "varying float _time;",
            "varying float _totalTime;",
            "varying vec2 _uv;",
            "varying vec3 _startColor;",
            "varying float _startOpacity;",
            "varying float _textureRandomIndex;",

            ...this.sectionLerpFloat,
            ...this.sectionLerpColor,

            "void main(){",
                "if( _show > 0.0 ){",
                    "vec4 resultColor = vec4( color * _startColor * sectionLerpColor(timeColor,_time), 1.0);",

                    "vec4 mapColor = vec4(1.0);",
                    "vec4 alphaMapColor = vec4(1.0);",

                    "vec2 uv = _uv;",
                    "uv /= tile;",
                    "uv.y += (1.0 - float(V));",
                    // 正常UV漂移
                    "if(offset.x!=0.0 || offset.y!=0.0){",
                        "if(isPlay){",
                            "uv += offset * _time;",
                        "}",
                    "}else{",
                        "#if UVS_COUNT > 1",
                            "float c_index = 0.0;",
                            "if(isPlay){",
                                "c_index = mix(0.0,float(UVS_COUNT),mod(_time * cycle,1.0));",
                                "if (_time >= 1.0){",
                                    "c_index = float(UVS_COUNT) - 1.0;",
                                "}",
                            "}",
                            "c_index = floor(c_index + _textureRandomIndex);",
                            "if(int(c_index) >= UVS_COUNT){",
                                "c_index -= float(UVS_COUNT);",
                            "}",
                            "uv += vec2(fract(c_index/tile.x), -floor(c_index/tile.x)/tile.y);",
                        "#endif",
                    "}",

                    "#ifdef HAS_MAP",
                        "mapColor = texture2D(map,uv);",
                    "#endif",

                    "#ifdef HAS_ALPHAMAP",
                        "alphaMapColor = texture2D(alphaMap,uv);",
                    "#endif",

                    "resultColor = resultColor * mapColor;",
                    "float alpha = (alphaMapColor.r * 0.299 + alphaMapColor.g * 0.587 + alphaMapColor.b * 0.114) * alphaMapColor.a;",
                    "resultColor.a *= (alpha * opacity * _startOpacity * sectionLerpFloat(timeOpacity,_time));",

                    "gl_FragColor = resultColor;",
                "}",
            "}"
        ].join('\r\n');
    }

    //----------------------------------------对外属性变量----------------------------------------
    get isLocal(){
        try{
            return this.uniforms.isLocal.value;
        }catch (e) {
            return true;
        }
    }
    set isLocal(isLocal){
        this.uniforms.isLocal.value = isLocal;
    }

    get algin(){
        try{
            return this.uniforms.algin.value;
        }catch (e) {
            return 0;
        }
    }
    set algin(algin){
        this.uniforms.algin.value = algin;
    }

    get timeSize(){
        try{
            return this.uniforms.timeSize.value;
        }catch (e) {
            return [0,0,0,0];
        }
    }
    set timeSize(timeSize){
        this.uniforms.timeSize.value = timeSize;
    }

    get timeColor(){
        try{
            return this.uniforms.timeColor.value;
        }catch (e) {
            return [0,0,0,0,0,0,0,0];
        }
    }
    set timeColor(timeColor){
        this.uniforms.timeColor.value = timeColor;
    }

    get timeOpacity(){
        try{
            return this.uniforms.timeOpacity.value;
        }catch (e) {
            return [0,0,0,0];
        }
    }
    set timeOpacity(timeOpacity){
        this.uniforms.timeOpacity.value = timeOpacity;
    }

    get tile(){
        try{
            return this.uniforms.tile.value;
        }catch (e) {
            return new THREE.Vector2(1,1);
        }
    }
    set tile(tile){
        try{
            this.uniforms.tile.value = tile || new THREE.Vector2(1, 1);
            this.setDefines();
        }catch (e) {}
    }

    get offset(){
        try{
            return this.uniforms.offset.value;
        }catch (e) {
            return new THREE.Vector2(0,0);
        }
    }
    set offset(offset){
        try{
            this.uniforms.offset.value = offset || new THREE.Vector2(0, 0);
        }catch (e) {}
    }

    get cycle(){
        try{
            return this.uniforms.cycle.value;
        }catch (e) {
            return 1;
        }
    }
    set cycle(cycle){
        try{
            this.uniforms.cycle.value = cycle || 1;
        }catch (e) {}
    }

    get isPlay(){
        try{
            return this.uniforms.isPlay.value;
        }catch (e) {
            return true;
        }
    }
    set isPlay(isPlay){
        try{
            this.uniforms.isPlay.value = isPlay===false ? false : true;
        }catch (e) {}
    }

    get color(){
        try{
            return this.uniforms.color.value;
        }catch (e) {
            return null;
        }
    }
    set color(color){
        try{
            this.uniforms.color.value = color || new THREE.Color("white");
        }catch (e) {}
    }

    get opacity(){
        try{
            return this.uniforms.opacity.value;
        }catch (e) {
            return null;
        }
    }
    set opacity(opacity){
        try{
            this.uniforms.opacity.value = opacity;
        }catch (e) {}
    }

    get map(){
        try{
            return this.uniforms.map.value;
        }catch (e) {
            return null;
        }
    }
    set map(map){
        try{
            this.uniforms.map.value = map || null;
            this.setDefines();
        }catch (e) {}
    }

    get alphaMap(){
        try{
            return this.uniforms.alphaMap.value;
        }catch (e) {
            return null;
        }
    }
    set alphaMap(alphaMap){
        try{
            this.uniforms.alphaMap.value = alphaMap || null;
            this.setDefines();
        }catch (e) {}
    }

    clone() {
        return new ParticleMaterial({}).copy(this);
    }

    copy(source){
        super.copy(source);

        this.color = source.color.clone();
        this.opacity = source.opacity;
        this.map = source.map;
        this.alphaMap = source.alphaMap;
        return this;
    }
}