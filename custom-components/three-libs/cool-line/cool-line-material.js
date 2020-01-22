import * as THREE from 'three';

/**
 * 参数
 * color {THREE.Color} "white"
 * map {THREE.Texture} null
 * alphaMap {THREE.Texture} null
 * tile {THREE.Vector2} {x:1,y:1}
 * offset {THREE.Vector2} {x:0,y:0}
 */
export default class CoolLineMaterial extends THREE.ShaderMaterial{
    constructor(parameters){
        super(parameters);
        this.initType();
        this.initUniforms(parameters);
        this.setDefines();
        this.initShader();
        console.log(this.uniforms);
    }

    //----------------------------------------内部属性变量----------------------------------------
    initType(){
        this.type = "UVAnimMaterial";
    }

    initUniforms(parameters){
        this.uniforms = {
            ...{
                resolution:{value: new THREE.Vector2(1,1)},
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

    setDefines(){
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
            "uniform vec2 resolution;",

            "attribute vec3 direction;",
            "attribute float side;",

            "varying vec2 _uv;",
            "varying float _w;",

            "void main(){",
                "_uv = uv;",

                "float aspect = resolution.x / resolution.y;" +
                "mat4 projectModelViewMat = projectionMatrix * modelViewMatrix;",
                "vec4 curPos = projectModelViewMat * vec4(position, 1.0);",
                "vec2 normal = (projectModelViewMat * vec4(direction, 0.0)).xy;" +
                "normal.x *= aspect;" +
                "normal = normalize( normal );",
                "vec2 offset = normalize( cross( vec3(normal,0.0), vec3(0.0,0.0,1.0) ) ).xy * side * 20.0 / resolution.y;" +
                "offset.x /= aspect;",
                "curPos.xy -= offset*curPos.w;",
                "_w = curPos.w;",
                "gl_Position = curPos;",
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
            "varying float _w;",

            "vec2 transformUV(vec2 uv, vec2 tile, vec2 offset){",
                "return uv * tile + offset;",
            "}",

            "void main(){",
                "vec4 resultColor = vec4(color,1.0);",
                "vec4 mapColor = vec4(1.0);",
                "vec4 alphaMapColor = vec4(1.0);",
                "vec2 uv = transformUV(_uv,vec2(tile.x,tile.y),offset);",

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
    get resolution(){
        try{
            return this.uniforms.resolution.value;
        }catch (e) {
            return null;
        }
    }
    set resolution(resolution){
        try{
            this.uniforms.resolution.value = resolution || new THREE.Vector2(1,1);
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
        return new CoolLineMaterial({}).copy(this);
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