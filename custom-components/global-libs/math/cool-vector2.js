export default class CoolVector2{
    constructor(x,y){
        this.vector2 = [x,y];
    }
    //----------------------------------------对外属性及方法----------------------------------------
    toString(){
        return this.vector2.toString();
    }

    toJSON(){
        return JSON.stringify(this.vector2);
    }

    //----------元素属性----------
    get x(){
        if(this.vector2 === undefined)
            return undefined;
        return this.vector2[0];
    }
    set x(x){
        if(this.vector2 === undefined)
            return;
        this.vector2[0] = x;
    }
    get y(){
        if(this.vector2 === undefined)
            return undefined;
        return this.vector2[1];
    }
    set y(y){
        if(this.vector2 === undefined)
            return;
        this.vector2[1] = y;
    }

    /**
     * 设置向量的值
     * @param x {Number}
     * @param y {Number}
     */
    setValue(x,y){
        this.vector2 = [x,y];
    }

    /**
     * 获取当前向量的单位
     * @returns {CoolVector2}
     */
    get normalized() {
        var M = this.magnitude;
        return new CoolVector2(this.x / M, this.y / M);
    }

    /**
     * 将当前向量单位化
     */
    normalize() {
        var M = this.magnitude;
        this.setValue(this.x / M, this.y / M);
    }

    /**
     * 计算当前向量的模
     * @returns {number}
     */
    get magnitude() {
        return Math.sqrt(this.sqrMagnitude);
    }

    /**
     * 计算当前向量的元素平方和
     * @returns {number}
     */
    get sqrMagnitude() {
        return Math.pow(this.x, 2) + Math.pow(this.y, 2);
    }

    //----------------------------------------静态属性方法----------------------------------------
    /**
     * 根据json数据生成向量
     * @param json {Json}
     * return {CoolVector2}
     */
    static fromJSON(json){
        json = JSON.parse(json);
        if(Array.isArray(json)){
            return new CoolVector2(...json);
        }else{
            console.error("向量的序列化数据不正确!");
            return undefined;
        }
    }

    /**
     * 从数组实例化向量
     * @param Array
     * @returns {CoolVector2}
     * @constructor
     */
    static ArrayVectorInit(array){
        return new CoolVector2(array[0],array[1]);
    }

    /**
     * 计算两个向量相加
     * @returns {CoolVector2}
     */
    static plus(){
        function inner_plus(v1,v2) {
            return new CoolVector2(v1.x + v2.x, v1.y + v2.y);
        }
        let result = arguments[0];
        for(let i =1,len=arguments.length;i<len;i++){
            result = inner_plus(result,arguments[i]);
        }
        return result;
    }

    /**
     * 计算两个向量相减
     * @param v1 {CoolVector2}
     * @param v2 {CoolVector2}
     * @returns {CoolVector2}
     */
    static minus(v1, v2) {
        function inner_minus(v1,v2) {
            return new CoolVector2(v1.x - v2.x, v1.y - v2.y);
        }
        let result = arguments[0];
        for(let i =1,len=arguments.length;i<len;i++){
            result = inner_minus(result,arguments[i]);
        }
        return result;
    }

    /**
     * 计算向量乘以数字
     * @param v1 {CoolVector2}
     * @param num {Number}
     * @returns {CoolVector2}
     */
    static multiply(v1, num) {
        return new CoolVector2(v1.x * num, v1.y * num);
    }

    /**
     * 计算向量除以数字
     * @param v1 {CoolVector2}
     * @param num {Number}
     * @returns {CoolVector2}
     */
    static divide(v1, num) {
        return new CoolVector2(v1.x / num, v1.y / num);
    }

    /**
     * 判断两个向量是否相等
     * @param {CoolVector2}
     * return {Boolen}
     */
    static equal(v1, v2) {
        return v1.x === v2.x && v1.y === v2.y;
    }

    /**
     * 判断两个向量是否不相等
     * @param {CoolVector2}
     * return {Boolen}
     */
    static unEqual(v1, v2) {
        return v1.x !== v2.x || v1.y !== v2.y;
    }

    /**
     * 计算两个向量点乘（内积，数量积）
     * @param v1 {CoolVector2}
     * @param v2 {CoolVector2}
     * @returns {number}
     */
    static dot(v1, v2) {
        return v1.x * v2.x + v1.y * v2.y;
    }

    /**
     * 计算两个向量的叉乘（外积，向量积）
     * @param v1 {CoolVector2}
     * @param v2 {CoolVector2}
     * @returns {number}
     */
    static cross(v1, v2) {
        return v1.x * v2.y - v2.x * v1.y;
    }

    /**
     * 计算两个向量的夹角(0-PI)
     * @param v1 {CoolVector2}
     * @param v2 {CoolVector2}
     * @returns {number}
     */
    static angle(v1, v2) {
        var v1normal = v1.normalized;//单位化v1
        var v2normal = v2.normalized;//单位化v2
        return Math.acos(CoolVector2.dot(v1normal, v2normal));
    }

    /**
     * 计算两个向量的夹角+-(0-PI)
     * @param v1 {CoolVector2}
     * @param v2 {CoolVector2}
     * @returns {number}
     */
    static fromToAngle(v1, v2) {
        var cross = CoolVector2.cross(v1, v2);
        if (cross < 0)
            return -CoolVector2.angle(v1, v2);
        else
            return CoolVector2.angle(v1, v2);
    }

    /**
     * 计算两点的距离
     * @param v1 {CoolVector2}
     * @param v2 {CoolVector2}
     * @returns {number}
     */
    static distance(v1, v2) {
        var newV = CoolVector2.minus(v1, v2);
        return newV.magnitude;
    }

    /**
     * 计算投影
     * @param v {CoolVector2}
     * @param refV {CoolVector2}
     * @returns {CoolVector2}
     */
    static project(v,refV){
        let normal = refV.normalized;
        return CoolVector2.multiply(normal,CoolVector2.dot(v,normal));
    }

    /**
     * 计算投影长度
     * @param v
     * @param refV
     * @returns {number}
     */
    static projectLength(v,refV){
        let normal = refV.normalized;
        return CoolVector2.dot(v,normal);
    }
}