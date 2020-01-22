let fShader = "" +
    "uniform sampler2D map;" +
    "uniform vec2 scale;" +

    "varying vec3 _color;" +
    "varying float _alpha;" +
    "varying vec2 _uvPos;" +
    "varying float _rot;"+

    "vec2 transform(vec2 uv,vec2 pos,vec2 scale,float rot){" +
         "float c = cos(rot);" +
        "float s = sin(rot);" +
        "mat2 _rot = mat2(c,-s,s,c);" +
        "return ((_rot * (uv-vec2(0.5))).xy + vec2(0.5)+pos)*scale;" +
    "}" +

    "void main(){" +
        "gl_FragColor = vec4(_color,_alpha);" +
        "vec2 _uv = transform(vec2(gl_PointCoord.x, 1.0-gl_PointCoord.y),_uvPos,scale,_rot);" +
        "vec4 texture = texture2D(map,_uv);" +
        "gl_FragColor = gl_FragColor * texture;"+
    "}";
export default fShader;
