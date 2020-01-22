let vShader = "" +
    "uniform bool isLocal;" +
    "uniform float renderHeight;" +

    "attribute float size;" +
    "attribute vec3 color;" +
    "attribute float alpha;" +
    "attribute vec2 uvPos;" +
    "attribute float rot;"+

    "varying float _alpha;" +
    "varying vec3 _color;" +
    "varying vec2 _uvPos;" +
    "varying float _rot;"+

    "void main(){" +
        //"vec4 mvPos = modelViewMatrix * vec4(position,1.0);" +
        "vec4 mvPos = isLocal?modelViewMatrix * vec4(position,1.0):viewMatrix * vec4(position,1.0);" +
        "gl_PointSize = size * (renderHeight / -mvPos.z);" +
        "gl_Position = projectionMatrix * mvPos;" +

        "_alpha = alpha;" +
        "_color = color;" +
        "_uvPos = uvPos;" +
        "_rot = rot;" +
    "}";
export default vShader;