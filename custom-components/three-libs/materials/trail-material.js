import * as THREE from 'three';

const vShader=[
    "uniform float width;",

    "attribute float widthRatio;",
    "attribute float side;",
    "attribute vec3 axis;",

    "varying vec2 _uv;",

    "void main(){",
        "_uv = uv;",

        "vec4 pos = vec4(position, 1.0);",
        "float _width = width * 0.5 * widthRatio;",
        "pos.xyz += axis * side * _width;",

        "gl_Position = projectionMatrix * viewMatrix * pos;",
    "}"
].join("\r\n");

const fShader=[
    "uniform vec3 color;",
    "uniform float opacity;",
    "uniform sampler2D map;",
    "uniform sampler2D alphaMap;",
    "uniform float maxV;",

    "varying vec2 _uv;",

    "void main(){",
        "vec4 resultColor = vec4( color, 1.0);",
        "vec4 mapColor = vec4(1.0);",
        "vec4 alphaMapColor = vec4(1.0);",

        "vec2 uv = _uv;",

        "#ifdef HAS_MAP",
            "mapColor = texture2D(map,uv);",
        "#endif",

        "#ifdef HAS_ALPHAMAP",
            "alphaMapColor = texture2D(alphaMap,uv);",
        "#endif",

        "resultColor = resultColor * mapColor;",
        "float alpha = (alphaMapColor.r * 0.299 + alphaMapColor.g * 0.587 + alphaMapColor.b * 0.114) * alphaMapColor.a;",
        "resultColor.a *= alpha * opacity * _uv.y / maxV;",

        "gl_FragColor = resultColor;",
    "}"
].join("\r\n");

export default class TrailMaterial extends THREE.ShaderMaterial{
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
        this.type = "TrailMaterial";
    }

    initUniforms(parameters){
        this.uniforms = {
            ...this.uniforms,
            ...{
                width:{ value: 1.0 },
                maxV:{ value: 1.0},
                startColor:{value: new THREE.Color()},
                endColor:{value: new THREE.Color()},

                color: { value: new THREE.Color("white") },
                opacity: { value: 1.0 },
                map: { value: null },
                alphaMap: { value: null }
            }
        };
        this.setValues(parameters);
    }

    setDefines(){
        this.defines = {
            HAS_MAP:this.map !== null,
            HAS_ALPHAMAP:this.alphaMap !== null
        };
    }

    initShader(){
        this.vertexShader = vShader;
        this.fragmentShader = fShader;
    }

    //----------------------------------------对外属性变量----------------------------------------
    get width(){
        try{
            return this.uniforms.width.value;
        }catch (e) {
            return null;
        }
    }
    set width(width){
        try{
            this.uniforms.width.value = width;
        }catch (e) {}
    }

    get maxV(){
        try{
            return this.uniforms.maxV.value;
        }catch (e) {
            return null;
        }
    }
    set maxV(maxV){
        try{
            this.uniforms.maxV.value = maxV;
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
}