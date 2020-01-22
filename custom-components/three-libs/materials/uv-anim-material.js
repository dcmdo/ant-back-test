import * as THREE from 'three';

/**
* 参数
* color {THREE.Color} "white"
* map {THREE.Texture} null
* alphaMap {THREE.Texture} null
* tile {THREE.Vector2} {x:1,y:1}
* offset {THREE.Vector2} {x:0,y:0}
*/
export default class UVAnimMaterial extends THREE.ShaderMaterial{
    constructor(parameters){
        super(parameters);
        this.initType();
        this.initUniforms(parameters);
        this.initDefines();
        this.initShader();
    }

    //----------------------------------------内部属性变量----------------------------------------
    initType(){
        this.type = "UVAnimMaterial";
    }

    initUniforms(parameters){
        this.uniforms = {
            ...{
                color: { value: new THREE.Color("white") },
                opacity: { value: 1.0 },
                map: { value: null },
                alphaMap: { value: null },
                tile:{value: new THREE.Vector2(1,1)},
                offset:{value: new THREE.Vector2(0,0)},
            }
        };
        this.setValues(parameters);
    }

    initDefines(){
        this.defines = {
            HAS_MAP:this.map !== null,
            HAS_ALPHAMAP:this.alphaMap !== null
        };
    }

    initShader(){
        this.vertexShader = this.vShader;
        this.fragmentShader = this.fShader;
    }

    get vShader(){
        return [
            "varying vec2 _uv;",

            "void main(){",
                "_uv = uv;",
                "gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);",
            "}"
        ].join('\r\n');
    }

    get fShader(){
        return [
            "uniform vec3 color;",
            "uniform float opacity;",
            "uniform sampler2D map;",
            "uniform sampler2D alphaMap;",
            "uniform vec2 tile;",
            "uniform vec2 offset;",

            "varying vec2 _uv;",

            "vec2 transformUV(vec2 uv, vec2 tile, vec2 offset){",
                "return uv * tile + offset;",
            "}",

            "void main(){",
                "vec4 resultColor = vec4(color,1.0);",
                "vec4 mapColor = vec4(1.0);",
                "vec4 alphaMapColor = vec4(1.0);",
                "vec2 uv = transformUV(_uv,tile,offset);",

                "#ifdef HAS_MAP",
                    "mapColor = texture2D(map,uv);",
                "#endif",

                "#ifdef HAS_ALPHAMAP",
                    "alphaMapColor = texture2D(alphaMap,uv);",
                "#endif",

                "resultColor = resultColor * mapColor;",
                "float alpha = (alphaMapColor.r * 0.299 + alphaMapColor.g * 0.587 + alphaMapColor.b * 0.114) * alphaMapColor.a;",
                "resultColor.a *= (alpha * opacity);",

                "gl_FragColor = resultColor;",
            "}"
        ].join('\r\n');
    }

    //----------------------------------------对外属性变量----------------------------------------
    get color(){
        try{
            return this.uniforms.color.value;
        }catch (e) {
            return null;
        }
    }
    set color(color){
        try{
            this.uniforms.color.value = new THREE.Color(color);
        }catch (e) {
            this.uniforms.color.value = new THREE.Color("white");
        }
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
        }catch (e) {}
    }

    get tile(){
        try{
            return this.uniforms.tile.value;
        }catch (e) {
            return null;
        }
    }
    set tile(tile){
        try{
            this.uniforms.tile.value = tile || new THREE.Vector2(1, 1);
        }catch (e) {}
    }

    get offset(){
        try{
            return this.uniforms.offset.value;
        }catch (e) {
            return  null;
        }
    }
    set offset(offset){
        try{
            this.uniforms.offset.value = offset || new THREE.Vector2(0, 0);
        }catch (e) {}
    }

    clone() {
        return new UVAnimMaterial({}).copy(this);
    }

    copy(source){
        super.copy(source);
        this.color = source.color.clone();
        this.map = source.map;
        this.alphaMap = source.alphaMap;
        this.tile = source.tile.clone();
        this.offset = source.offset.clone();
        return this;
    }
}