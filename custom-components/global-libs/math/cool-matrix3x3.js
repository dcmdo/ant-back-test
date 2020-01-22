import CoolVector2 from './cool-vector2';

export default class CoolMatrix3x3{
    /**
     * 构造函数
     * @param m00-m22 {Number}
     * return CoolMatrix3x3
     */
    constructor(m00, m01, m02, m10, m11, m12, m20, m21, m22) {
        this.matrix = [[m00, m01, m02], [m10, m11, m12], [m20, m21, m22]];
    }

    //----------------------------------------对外属性方法----------------------------------------
    //序列化
    toJSON(){
        return JSON.stringify([...this.matrix[0],...this.matrix[1],...this.matrix[2]]);
    }

    /**
     * 获取矩阵的字符串形式
     * return {String}
     */
    toString() {
        return this.matrix.toString();
    }
    
    /**
     * 设置矩阵的值
     * @param m00-m22 {Number}
     * return CoolMatrix3x3
     */
    setValue(m00, m01, m02, m10, m11, m12, m20, m21, m22) {
        this.matrix = [[m00, m01, m02], [m10, m11, m12], [m20, m21, m22]];
    }

    //----------元素属性----------
    get a(){
        return this.matrix[0][0];
    }
    set a(a){
        this.matrix[0][0] = a;
    }
    get b(){
        return this.matrix[1][0];
    }
    set b(b){
        this.matrix[1][0]=b;
    }
    get c(){
        return this.matrix[0][1];
    }
    set c(c){
        this.matrix[0][1] = c;
    }
    get d(){
        return this.matrix[1][1];
    }
    set d(d){
        this.matrix[1][1] = d;
    }
    get e(){
        return this.matrix[0][2];
    }
    set e(e){
        this.matrix[0][2] = e;
    }
    get f(){
        return this.matrix[1][2];
    }
    set f(f){
        this.matrix[1][2] = f;
    }

    /**
     * 求当前矩阵的行列式
     * return {Number}
     */
    get determinant() {
        let m = this.matrix;
        return m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1])
            + m[0][1] * (m[1][2] * m[2][0] - m[1][0] * m[2][2])
            + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
    }
    
    /**
     * 求当前矩阵的转置矩阵
     * return {CoolMatrix3x3}
     */
    get transpose() {
        let m = this.matrix;
        return new CoolMatrix3x3(m[0][0], m[1][0], m[2][0], m[0][1], m[1][1], m[2][1], m[0][2], m[1][2], m[2][2]);
    }

    /**
     * 求当前矩阵的逆矩阵
     * return {CoolMatrix3x3}
     */
    get inverse(){
        let inverseMatrix = CoolMatrix3x3.identity();
        let r = inverseMatrix.matrix;
        let m = this.matrix;
        r[0][0] = m[1][1] * m[2][2] - m[2][1] * m[1][2];
        r[0][1] = m[2][1] * m[0][2] - m[0][1] * m[2][2];
        r[0][2] = m[0][1] * m[1][2] - m[1][1] * m[0][2];
        r[1][0] = m[2][0] * m[1][2] - m[1][0] * m[2][2];
        r[1][1] = m[0][0] * m[2][2] - m[2][0] * m[0][2];
        r[1][2] = m[1][0] * m[0][2] - m[0][0] * m[1][2];
        r[2][0] = m[1][0] * m[2][1] - m[2][0] * m[1][1];
        r[2][1] = m[2][0] * m[0][1] - m[0][0] * m[2][1];
        r[2][2] = m[0][0] * m[1][1] - m[1][0] * m[0][1];
        let determinant = m[0][0] * r[0][0] + m[0][1] * r[1][0] + m[0][2] * r[2][0];
        r.forEach(function (item) {
            item.forEach(function (item, index, array) {
                array[index] = item / determinant;
            });
        });
        return inverseMatrix;
    }
    
    /**
     * 获取当前矩阵的列
     * @param index {Number} 下标
     * return {[]}
     */
    getColumn(index) {
        if (index < 3 && index > -1)
            return [this.matrix[0][index], this.matrix[1][index], this.matrix[2][index]];
    }

    /**
     * 获取当前矩阵的行
     * @param index {Number} 下标
     * return {[]}
     */
    getRow(index) {
        if (index < 3 && index > -1)
            return [this.matrix[index][0], this.matrix[index][1], this.matrix[index][2]];
    }
    
    /**
     * 利用当前矩阵变换点
     * @param point {CoolVector2} 需要变换的点
     * return {CoolVector2} 变换之后的点
     */
    multiplyPoint(point) {
        let x = point.x;
        let y = point.y;
        let newX = x * this.matrix[0][0] + y * this.matrix[0][1] + this.matrix[0][2];
        let newY = x * this.matrix[1][0] + y * this.matrix[1][1] + this.matrix[1][2];
        let newZ = x * this.matrix[2][0] + y * this.matrix[2][1] + this.matrix[2][2];
        return new CoolVector2(newX / newZ, newY / newZ);
    }

    /**
     * 利用当前矩阵变换方向
     * @param vector2 {CoolVector2} 需要变换的方向
     * return {CoolVector2} 变换之后的方向
     */
    multiplyVector(vector2) {
        let x = vector2.x;
        let y = vector2.y;
        let newX = x * this.matrix[0][0] + y * this.matrix[0][1];
        let newY = x * this.matrix[1][0] + y * this.matrix[1][1];
        return new CoolVector2(newX, newY);
    }

    //----------------------------------------静态属性方法----------------------------------------
    
    /**
     * 根据json数据生成矩阵
     * @param json {Json}
     * return {CoolMatrix3x3}
     */
    static fromJSON(json){
        json = JSON.parse(json);
        if(Array.isArray(json)){
            return new CoolMatrix3x3(...json);
        }else{
            console.error("矩阵的序列化数据不正确!");
            return undefined;
        }
    }
    
    /**
     * 根据数组创建矩阵
     * @param arrayMatrix {[]}
     * return {CoolMatrix3x3}
     */
    static ArrayMatrixInit(arrayMatrix){
        return new CoolMatrix3x3(arrayMatrix[0][0],arrayMatrix[0][1],arrayMatrix[0][2],arrayMatrix[1][0],arrayMatrix[1][1],arrayMatrix[1][2],
            arrayMatrix[2][0],arrayMatrix[2][1],arrayMatrix[2][2]);
    }
    
    /**
     * 创建单位矩阵
     * return {CoolMatrix3x3}
     */
    static identity() {
        return new CoolMatrix3x3(1, 0, 0, 0, 1, 0, 0, 0, 1);
    }
    
    /**
     * 采用DOM初始化方式初始化矩阵
     * @param a-f {Number}
     * return {CoolMatrix3x3}
     */
    static domMatrixInit(a, b, c, d, e, f){
        return new CoolMatrix3x3(a, c, e, b, d, f, 0, 0, 1);
    }

    /**
     * 将SVGMatrix转化为CoolMatrix3x3
     * @param SVGMatrix {SVGMatrix}
     * return {CoolMatrix3x3}
     */
    static SVGMatrixInit(SVGMatrix){
        return CoolMatrix3x3.domMatrixInit(SVGMatrix.a,SVGMatrix.b,SVGMatrix.c,SVGMatrix.d,SVGMatrix.e,SVGMatrix.f);
    }

    /**
     * 构建平移矩阵
     * @param x {Number} 沿x轴平移的距离
     * @param y {Number} 沿y轴平移的距离
     * return 
     */
    static translate(x, y){
        let newM = CoolMatrix3x3.identity();
        newM.matrix[0][2] = x;
        newM.matrix[1][2] = y;
        return newM;
    }
    
    /**
     * 构建基于参照点的旋转矩阵
     * @param angle {Number} 角度
     * @param refx {Number} 参照点x
     * @param refy {Number} 参照点y
     * return {CoolMatrix3x3}
     */
    static rotate(angle, refx, refy) {
        let cos = Math.cos(angle);
        let sin = Math.sin(angle);
        let newM = CoolMatrix3x3.identity();
        newM.matrix[0][0] = cos;
        newM.matrix[0][1] = -sin;
        newM.matrix[1][0] = sin;
        newM.matrix[1][1] = cos;
        newM.matrix[0][2] = refx * (1 - cos) + refy * sin;
        newM.matrix[1][2] = refy * (1 - cos) - refx * sin;
        return newM;
    }
    
    /**
     * 构建基于参照点的缩放矩阵
     * @param x {Number} x轴缩放值
     * @param y {Number} y轴缩放值
     * @param refx {Number} 参照点x
     * @param refy {Number} 参照点y
     * return {CoolMatrix3x3}
     */
    static scale(x, y, refx, refy) {
        let newM = CoolMatrix3x3.identity();
        newM.matrix[0][0] = x;
        newM.matrix[1][1] = y;
        newM.matrix[0][2] = refx * (1 - x);
        newM.matrix[1][2] = refy * (1 - y);
        return newM;
    };

    /**
     * 构建基于参照点沿特定向量的缩放矩阵
     * @param normal {CoolVector2} 缩放方向向量
     * @param k {Number} 缩放值
     * @param refx {Number} 参照点x
     * @param refy {Number} 参照点y
     * return {CoolMatrix3x3}
     */
    static scaleByNormal(normal, k, refx, refy){
        normal.normalize();
        let a = 1 + (k - 1) * Math.pow(normal.x, 2);
        let b = (k - 1) * normal.x * normal.y;
        let c = 1 + (k - 1) * Math.pow(normal.y, 2);
        return CoolMatrix3x3.domMatrixInit(a, b, b, c, (1 - a) * refx - b * refy, (1 - c) * refy - b * refx);
    }

    /**
     * 将矩阵分解成详细的平移、旋转、缩放、错切等信息
     * @param matrix {CoolMatrix3x3}
     * return {Object}
     */
    static decomposeMatrix(matrix){
        function deltaTransformPoint(matrix,point) {
            let dx = point.x * matrix.a + point.y * matrix.c;
            let dy = point.x * matrix.b + point.y * matrix.d;
            return {x:dx,y:dy};
        }
        let px = deltaTransformPoint(matrix,{x:0,y:1});
        let py = deltaTransformPoint(matrix,{x:1,y:0});
        let skewX = Math.atan2(px.y,px.x)-Math.PI*0.5;
        let skewY = Math.atan2(py.y,py.x);
        return{
            translateX:matrix.e,
            translateY:matrix.f,
            scaleX:Math.sqrt(matrix.a*matrix.a+matrix.b*matrix.b),
            scaleY:Math.sqrt(matrix.c*matrix.c+matrix.d*matrix.d),
            skewX:skewX,
            skewY:skewY,
            rotation:skewX
        };
    }
    
    /**
     * 获取旋转矩阵
     * @param matrix {CoolMatrix3x3} 目标矩阵
     * return maxtrix {CoolMatrix3x3} 转换之后的旋转矩阵
     */
    static getRotMatrix(matrix){
        let scaleX = Math.sqrt(matrix.a*matrix.a+matrix.b*matrix.b);
        let scaleY = Math.sqrt(matrix.c*matrix.c+matrix.d*matrix.d);
        let newMatrix = CoolMatrix3x3.identity();
        newMatrix.a = matrix.a/scaleX;
        newMatrix.b = matrix.b;
        newMatrix.c = matrix.c;
        newMatrix.d = matrix.d/scaleY;
        return newMatrix;
    }

    /**
     * 矩阵乘法，可多个标量，多个矩阵
     * @param ...args
     * return {CoolMatrix3x3}
     */
    static multiply(){
        let innerMultiplay = function (left, right) {
            let m1 = left.matrix;
            let m2 = right.matrix;
            if (left instanceof CoolMatrix3x3 && right instanceof CoolMatrix3x3) {
                return new CoolMatrix3x3(
                    m1[0][0] * m2[0][0] + m1[0][1] * m2[1][0] + m1[0][2] * m2[2][0],
                    m1[0][0] * m2[0][1] + m1[0][1] * m2[1][1] + m1[0][2] * m2[2][1],
                    m1[0][0] * m2[0][2] + m1[0][1] * m2[1][2] + m1[0][2] * m2[2][2],
                    m1[1][0] * m2[0][0] + m1[1][1] * m2[1][0] + m1[1][2] * m2[2][0],
                    m1[1][0] * m2[0][1] + m1[1][1] * m2[1][1] + m1[1][2] * m2[2][1],
                    m1[1][0] * m2[0][2] + m1[1][1] * m2[1][2] + m1[1][2] * m2[2][2],
                    m1[2][0] * m2[0][0] + m1[2][1] * m2[1][0] + m1[2][2] * m2[2][0],
                    m1[2][0] * m2[0][1] + m1[2][1] * m2[1][1] + m1[2][2] * m2[2][1],
                    m1[2][0] * m2[0][2] + m1[2][1] * m2[1][2] + m1[2][2] * m2[2][2]
                );
            } else if (left instanceof CoolMatrix3x3 && typeof right == "number") {
                let newMatrix = CoolMatrix3x3.identity();
                for (let i = 0; i < 3; i++) {
                    for (let j = 0; j < 3; j++) {
                        newMatrix.matrix[i][j] = left.matrix[i][j] * right;
                    }
                }
                return newMatrix;
            } else if (typeof left == "number" && right instanceof CoolMatrix3x3) {
                let newMatrix = CoolMatrix3x3.identity();
                for (let i = 0; i < 3; i++) {
                    for (let j = 0; j < 3; j++) {
                        newMatrix.matrix[i][j] = right.matrix[i][j] * left;
                    }
                }
                return newMatrix;
            } else if (typeof left == "number" && typeof right == "number") {
                return left * right;
            } else {
                return undefined;
            }
        };
        let resultM = arguments[0];
        for (let i = 1; i < arguments.length; i++) {
            resultM = innerMultiplay(resultM, arguments[i]);
        }
        return resultM;
    }

    /**
     * 求解矩阵除以一个数
     * @param matrix {CoolMatrix3x3} 目标矩阵
     * @param num {Number} 除数
     * @returns {CoolMatrix3x3}
     */
    static divide(matrix, num) {
        let newMatrix = CoolMatrix3x3.identity();
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                newMatrix.matrix[i][j] = matrix.matrix[i][j] / num;
            }
        }
        return newMatrix;
    };

    //输出CSS字符串
    static toCSS(matrix){
        return "matrix(" + matrix.a + "," + matrix.b + "," + matrix.c + "," + matrix.d + "," + matrix.e + "," + matrix.f + ")";
    }
}