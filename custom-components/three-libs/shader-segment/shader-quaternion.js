const ShaderQuaternion = {
    qEuler:[
        "vec4 qEuler(vec3 euler,int orderNum){",
            "float c1 = cos(euler.x/2.0);", "float c2 = cos(euler.y/2.0);", "float c3 = cos(euler.z/2.0);",
            "float s1 = sin(euler.x/2.0);", "float s2 = sin(euler.y/2.0);", "float s3 = sin(euler.z/2.0);",
            "if(orderNum==123){",
                "return vec4(",
                    "s1 * c2 * c3 + c1 * s2 * s3,",
                    "c1 * s2 * c3 - s1 * c2 * s3,",
                    "c1 * c2 * s3 + s1 * s2 * c3,",
                    "c1 * c2 * c3 - s1 * s2 * s3",
                ");",
            "}",
            "if(orderNum==213){",
                "return vec4(",
                    "s1 * c2 * c3 + c1 * s2 * s3,",
                    "c1 * s2 * c3 - s1 * c2 * s3,",
                    "c1 * c2 * s3 - s1 * s2 * c3,",
                    "c1 * c2 * c3 + s1 * s2 * s3",
                ");",
            "}",
            "if(orderNum==312){",
                "return vec4(",
                    "s1 * c2 * c3 - c1 * s2 * s3,",
                    "c1 * s2 * c3 + s1 * c2 * s3,",
                    "c1 * c2 * s3 + s1 * s2 * c3,",
                    "c1 * c2 * c3 - s1 * s2 * s3",
                ");",
            "}",
            "if(orderNum==321){",
                "return vec4(",
                    "s1 * c2 * c3 - c1 * s2 * s3,",
                    "c1 * s2 * c3 + s1 * c2 * s3,",
                    "c1 * c2 * s3 - s1 * s2 * c3,",
                    "c1 * c2 * c3 + s1 * s2 * s3",
                ");",
            "}",
            "if(orderNum==231){",
                "return vec4(",
                    "s1 * c2 * c3 + c1 * s2 * s3,",
                    "c1 * s2 * c3 + s1 * c2 * s3,",
                    "c1 * c2 * s3 - s1 * s2 * c3,",
                    "c1 * c2 * c3 - s1 * s2 * s3",
                ");",
            "}",
            "if(orderNum==132){",
                "return vec4(",
                    "s1 * c2 * c3 - c1 * s2 * s3,",
                    "c1 * s2 * c3 - s1 * c2 * s3,",
                    "c1 * c2 * s3 + s1 * s2 * c3,",
                    "c1 * c2 * c3 + s1 * s2 * s3",
                ");",
            "}",
        "}"
    ],
    qAxisAngle:[
        "vec4 qAxisAngle(vec3 axis, float angle){",
            "float halfAngle = angle/2.0;",
            "float s = sin(halfAngle);",
            "return vec4(axis.x*s,axis.y*s, axis.z*s, cos(halfAngle));",
        "}"
    ],
    qUnitVectors:[
        "vec4 qUnitVectors(vec3 vFrom, vec3 vTo){",
            "float r = dot(vFrom,vTo)+1.0;",
            "vec4 q = vec4(0.0);",
            "if( r < 0.0){",
                "r = 0.0;",
                "if(abs(vFrom.x) > abs(vFrom.z)){",
                    "q.x = -vFrom.y;",
                    "q.y = vFrom.x;",
                    "q.z = 0.0;",
                "}else{",
                    "q.x = 0.0;",
                    "q.y = -vFrom.z;",
                    "q.z = vFrom.y;",
                "}",
                "q.w = r;",
            "}else{",
                "q = vec4(cross(vFrom,vTo),r);",
            "}",
            "return normalize(q);",
        "}"
    ],
    qTransformVect:[
        "vec3 qTransformVect(vec4 q, vec3 v){",
            "return v + 2.0 * cross(q.xyz, cross(q.xyz,v) + q.w * v);",
        "}",
    ]
};

export default ShaderQuaternion;