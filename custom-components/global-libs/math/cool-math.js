import ArrayFns from "ArrayFns";
//弧度转角度系数
const factor = 180/Math.PI;

const CoolMath = {
    /**
     * 角度转弧度
     * @param deg {Number} 角度
     * @returns {Number} 弧度
     */
    deg2rad(deg){
        return deg/factor;
    },

    degs2rads(degs){
        let rads = [];
        degs.forEach((deg)=>{
            rads.push(CoolMath.deg2rad(deg));
        });
        return rads;
    },

    /**
     * 弧度转角度
     * @param rad {Number} 弧度
     * @returns {number} 角度
     */
    rad2deg(rad){
        return rad*factor;
    },

    rads2degs(rads){
        let degs = [];
        rads.forEach((rad)=>{
            degs.push(CoolMath.rad2deg(rad));
        });
        return degs;
    },

    /**
     * 限定值
     * @param min {Number} 最小值
     * @param max {Number} 最大值
     * @param value {Number} 当前值
     * @returns {Number} 限定值
     */
    clamp(min,max,value){
        if(value>max)
            return max;
        if(value<min)
            return min;
        return value;
    },

    /**
     * 插值
     * @param min {Number} 最小值
     * @param max {Number} 最大值
     * @param interpolation {Number} 差值系数
     * @returns {Number} 差值
     */
    lerp(min,max,interpolation){
        if(min === max){
            return min;
        }
        interpolation = CoolMath.clamp(0,1,interpolation);
        return min + (max - min)*interpolation;
    },

    /**
     * 反插值
     * @param min {Number} 最小值
     * @param max {Number} 最大值
     * @param value {Number} 当前值
     * @returns {Number} 差值系数
     */
    inverseLerp(min,max,value){
        if(min === max)
            return 0;
        return CoolMath.clamp(0,1,(value-min)/(max-min));
    },

    /**
     * 获取插值范围
     * @param sections {[[time,value],[time,value],[time,value]]} 差值区间
     * @param interpolation {Number} 差值系数
     * @returns {[{Number} 最小值,{Number} 最大值,{Number} 差值系数]}
     */
    getSectionLerpRange(sections,interpolation){
        let min,max;
        for(let i = 0, len = sections.length-1; i<len; i++){
            let item = sections[i];
            if(item[0]<=interpolation){
                min = item;
                max = sections[i+1];
            }
        }
        let rate = (interpolation-min[0])/(max[0]-min[0]);
        return [min[1],max[1],rate];
    },

    /**
     * 范围插值
     * @param sections {[[interpolation,value],[interpolation,value],[interpolation,value]]} 差值区间
     * @param interpolation {Number} 差值系数
     * @returns {Number} 差值
     */
    sectionLerp(sections,interpolation){
        if(sections.length < 2){
            console.error("section不合法!");
            return 0;
        }
        let lerpRange = CoolMath.getSectionLerpRange(sections,interpolation);
        if(lerpRange[0]===lerpRange[1]){
            return lerpRange[0];
        }
        return CoolMath.lerp(...lerpRange);
    },

    // 浮点数随机
    randomFloat(min,max){
        if(min === max){
            return min;
        }
        return Math.random()*(max-min)+min;
    },
    // 整数随机
    randomInt(min,max){
        if(min === max){
            return min;
        }
        return Math.floor(Math.random()*(max+1-min)+min);
    },
    // 多整数随机
    randomIntMutiply(min,max,count){
        if(min === max){
            let res = [];
            for(let i = 0; i < count; i++){
                res.push(min);
            }
            return res;
        }
        let list = [];
        for(let i = min;i<=max;i++){
            list.push(i);
        }
        let res = [];
        while (res.length<count){
            let index = CoolMath.randomInt(0,list.length-1);
            res.push(list[index]);
            list.splice(index,1)
        }
        return res;
    },
    randomFloatMutiply(min,max,count){
        if(min === max){
            let res = [];
            for(let i = 0; i < count; i++){
                res.push(min);
            }
            return res;
        }
        let res = [];
        for(let i = 0; i < count; i++){
            res.push(CoolMath.randomFloat(min,max));
        }
        return res;
    },
    // 两个数组之间的随机
    randomFloatArray(array1,array2){
        if(array1.length !== array2.length){
            console.warn("数组长度不一致！");
            return array1;
        }
        let array  = [];
        array1.forEach((a1,index)=>{
            array.push(CoolMath.randomFloat(a1,array2[index]));
        });
        return  array;
    },
    randomIntArray(array1,array2){
        if(array1.length !== array2.length){
            console.warn("数组长度不一致！");
            return array1;
        }
        let array  = [];
        array1.forEach((a1,index)=>{
            array.push(CoolMath.randomInt(a1,array2[index]));
        });
        return  array;
    },
    // 权重随机
    randomWeightIndex(weightArray,maxWeight){
        return ArrayFns.sortedIndex(weightArray,CoolMath.randomFloat(0,maxWeight));
    },
    //----------日期运算----------
    // 加年份
    addYear(date,year){
        let newDate = new Date(date);
        let oldDate = newDate.getDate();
        newDate.setDate(1);
        newDate.setFullYear(date.getFullYear()+year);
        let newMday = CoolMath.getDayCount(newDate.getFullYear(),newDate.getMonth()+1);
        if(oldDate > newMday){
            oldDate = newMday;
        }
        newDate.setDate(oldDate);
        return newDate;
    },
    // 加月份
    addMonth(date,month){
        let newDate = new Date(date);
        let oldDate = newDate.getDate();
        newDate.setDate(1);
        newDate.setMonth(date.getMonth()+month);
        let newMday = CoolMath.getDayCount(newDate.getFullYear(),newDate.getMonth()+1);
        if(oldDate > newMday){
            oldDate = newMday;
        }
        newDate.setDate(oldDate);
        return newDate;
    },
    // 加天
    addDay(date,day){
        let newDate = new Date(date);
        newDate.setDate(date.getDate()+day);
        return newDate;
    },
    // 加小时
    addHour(date,hour){
        let newDate = new Date(date);
        newDate.setHours(date.getHours()+hour);
        return newDate;
    },
    // 加分钟
    addMinute(date,minute){
        let newDate = new Date(date);
        newDate.setMinutes(date.getMinutes()+minute);
        return newDate;
    },
    // 加秒
    addSecond(date,second){
        let newDate = new Date(date);
        newDate.setSeconds(date.getSeconds()+second);
        return newDate;
    },
    // 加毫秒
    addMillisecond(date,millisecond){
        let newDate = new Date(date);
        newDate.setMilliseconds(date.getMilliseconds()+millisecond);
        return newDate;
    },
    // 获取特定年月的天数
    getDayCount(year, month){
        let date = new Date(year, month, 0);
        return date.getDate();
    },
    // 获取特定年月的第一天是星期几
    getFirstDay(year, month){
        let date = new Date(year, month-1, 1);
        return date.getDay();
    },
    // 限定日期
    clampDate(minDate, maxDate, date){
        if(date<=minDate){
            return minDate;
        }
        if(date>=maxDate){
            return maxDate;
        }
        return date;
    },
    //文件大小计算
    fileSizeFormat(size){
        let ref = {b:[1,1024],kb:[1024,1048576],mb:[1048576,1073741824],gb:[1073741824,Infinity]};
        for(let k in ref){
            if(size<ref[k][1])
                return (size/ref[k][0]).toFixed(2)+k;
        }
    }
};

export default CoolMath;