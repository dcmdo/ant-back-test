import * as THREE from 'three';
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
export default class PointParticleMaterial extends THREE.ShaderMaterial{
    constructor(parameters){
        parameters = {
            blending:THREE.AdditiveBlending,
            ...parameters,
            transparent:true,
            depthWrite:false
        };
        super(parameters);
        this.initType();
        this.initUniforms(parameters);
        this.setDefines();
        this.initShader();
    }

    //----------------------------------------内部属性变量----------------------------------------
    initType(){
        this.type = "PointParticleMaterial";
    }

    initUniforms(parameters){
        this.uniforms = {
            ...{
                viewHeight:{value : 0},
                isLocal: { value: true },
                timeSize:{value:[0,0,0,0]},
                pivotOffset:{value:0},
                algin:{value:0},
                timeColor:{value:[0,0,0,0,0,0,0,0]},
                timeOpacity:{value:[0,0,0,0]},
                tile:{value: new THREE.Vector2(1,1)},
                offset:{value: new THREE.Vector2(0,0)},
                cycle:{value: 1},
                isPlay:{value: true},

                color: { value: new THREE.Color("white") },
                opacity: { value: 1.0 },
                map: { value: null },
                alphaMap: { value: null },
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
            "#define isNaN(x) ( (x) != (x)    )",
            "#define isInf(x) ( (x) == (x)+1.0 )",
            "#define PI 3.1415926",
            "#define HALF_PI 3.1415926*0.5",
            "uniform float viewHeight;",
            "uniform bool isLocal;",
            "uniform float pivotOffset;",
            "uniform int algin;",
            "uniform float timeSize[10];",

            "attribute float time;",
            "attribute float life;",
            "attribute vec3 initDirection;",
            "attribute vec3 direction;",
            "attribute float size;",
            "attribute float startRotation;",
            "attribute vec3 startColor;",
            "attribute float startOpacity;",
            "attribute float timeRotation;",
            "attribute float textureRandomIndex;",

            "varying float _time;",
            "varying float _totalTime;",
            "varying float _rotate;",
            "varying vec3 _startColor;",
            "varying float _startOpacity;",
            "varying float _textureRandomIndex;",

            ...ShaderVect.projectOnPlane,
            ...ShaderQuaternion.qAxisAngle,
            ...ShaderQuaternion.qTransformVect,

            ...this.sectionLerpFloat,

            "void main(){",
                "_time = time;",
                "_startColor = startColor;",
                "_startOpacity = startOpacity;",
                "_textureRandomIndex = textureRandomIndex;",

                "float totalTime = time * life;",
                "_totalTime = totalTime;",

                // 位置
                "vec4 pos = vec4( position, 1.0 );",
                "vec4 _initDir = vec4(initDirection,0.0);",
                "if(algin == 2){",
                    "if(direction != vec3(0.0,0.0,0.0)){",
                        "_initDir.xyz = normalize(direction);",
                    "}",
                "}",

                // 尺寸
                "float _size = size * sectionLerpFloat(timeSize,time);",
                "if(_size < 0.0){",
                    "_size = 0.0;",
                "}",

                "if(isLocal){",
                    "pos = modelViewMatrix * pos;",
                    "_initDir = modelViewMatrix * _initDir;",
                "}else{",
                    "pos = viewMatrix * pos;",
                    "_initDir = viewMatrix * _initDir;",
                "}",
                "float rotation = startRotation + timeRotation * totalTime;",

                "if(algin == 0){",
                    "vec4 _rotQ = qAxisAngle(vec3(0.0,0.0,1.0),rotation);",
                    "pos.xyz += normalize(qTransformVect(_rotQ,vec3(0.0,1.0,0.0))) * pivotOffset;",
                    "_rotate = rotation;",
                "}else{",
                    "pos.xyz += normalize(_initDir.xyz) * pivotOffset;",
                    "if(_initDir.x == 0.0 && _initDir.y == 0.0){",
                        "_initDir.y  = _initDir.z<0.0?0.01:-0.01;",
                    "}",
                    "_initDir = projectionMatrix * _initDir;",
                    "_rotate = atan(_initDir.y,_initDir.x) - HALF_PI + rotation;",
                    "if(isNaN(_rotate) || isInf(_rotate)){",
                        "_rotate = rotation;",
                    "}",
                "}",

                "gl_Position = projectionMatrix * pos;",
                "gl_PointSize = _size * viewHeight * 0.5 * projectionMatrix[1][1] / gl_Position.w;",
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

            "varying float _time;",
            "varying float _totalTime;",
            "varying float _rotate;",
            "varying vec3 _startColor;",
            "varying float _startOpacity;",
            "varying float _textureRandomIndex;",

            ...this.sectionLerpFloat,
            ...this.sectionLerpColor,

            "void main(){",
                "vec4 resultColor = vec4( color*_startColor*sectionLerpColor(timeColor,_time), 1.0);",

                "vec4 mapColor = vec4(1.0);",
                "vec4 alphaMapColor = vec4(1.0);",
                "vec2 uv = vec2(gl_PointCoord.x, 1.0-gl_PointCoord.y);",

                "float c = cos(_rotate);",
                "float s = sin(_rotate);",
                "mat2 rotMat = mat2(c,-s,s,c);",
                "uv = rotMat * (uv - vec2(0.5)) + vec2(0.5);",
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
            "}"
        ].join('\r\n');
    }

    //----------------------------------------对外属性变量----------------------------------------
    get viewHeight(){
        try{
            return this.uniforms.viewHeight.value;
        }catch (e) {
            return 0;
        }
    }
    set viewHeight(viewHeight){
        this.uniforms.viewHeight.value = viewHeight;
    }

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

    get pivotOffset(){
        try{
            return this.uniforms.pivotOffset.value;
        }catch (e) {
            return 0;
        }
    }
    set pivotOffset(pivotOffset){
        this.uniforms.pivotOffset.value = pivotOffset;
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
        return new PointParticleMaterial({}).copy(this);
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