const ShaderVect = {
    transformDirection:[
        "vec3 transformDirection(vec3 dir, mat4 mat){",
            "return normalize((mat * vec4( dir, 0.0)).xyz);",
        "}"
    ],
    inverseTransformDirection:[
        "vec3 inverseTransformDirection(vec3 dir, mat4 mat){",
            "return normalize((vec4( dir, 0.0) * mat).xyz);",
        "}"
    ],
    projectOnPlane:[
        "vec3 projectOnPlane(vec3 dir, vec3 planeNormal){",
            "float dis = dot(planeNormal,dir);",
            "return -dis * planeNormal + dir;",
        "}"
    ],
};

export default ShaderVect;