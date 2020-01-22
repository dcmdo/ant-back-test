import {TweenMax} from 'gsap';
import Ease from 'Ease';

const animType = {
  loop:"loop",
  pingPang:"pingPang",
  once:"once"
};

export default class Animation{
    static get ease(){
        return Ease;
    }

    static get animType(){
        return animType;
    }
    /**
     * 创建动画对象
     * @param elements 需要变换的元素
     * @param props 变换属性
     * @param option {
     *      animType:once、loop、pingPang,
     *      duration: number
     *      delay: number
     *      autoPlay:true、false,
     *      ease: 参见https://easings.net/
     * }
     * @param onStart
     * @param onUpdate
     * @param onComplete
     * @returns anime对象
     */
    static to(elements,props,option,onStart,onUpdate,onComplete){
        let duration = option.duration || 1;
        option.paused = option.autoPlay === true ? false : true;
        option.animType = option.animType || "once";

        if(option.animType !== "once"){
            option.repeat = -1;
        }else{
            option.repeat = 0;
        }
        if(option.animType === "pingPang"){
            option.yoyo = true;
        }
        option.overwrite = 1;

        delete option.duration;
        delete option.autoPlay;
        delete option.animType;

        let toProps = {
            ...props,
            ...option,
            onStart:onStart,
            onUpdate:onUpdate,
            onComplete:onComplete
        };
        return  TweenMax.to(elements,duration,toProps);
    }

    /**
     * 创建动画对象
     * @param elements 需要变换的元素
     * @param props 变换属性
     * @param option {
     *      animType:once、loop、pingPang,
     *      duration: number
     *      delay: number
     *      autoPlay:true、false,
     *      ease: 参见https://easings.net/
     * }
     * @param onStart
     * @param onUpdate
     * @param onComplete
     * @returns anime对象
     */
    static from(elements,props,option,onStart,onUpdate,onComplete){
        let duration = option.duration || 1;
        option.paused = option.autoPlay === true ? false : true;
        option.animType = option.animType || "once";

        if(option.animType !== "once"){
            option.repeat = -1;
        }else{
            option.repeat = 0;
        }
        if(option.animType === "pingPang"){
            option.yoyo = true;
        }
        option.overwrite = 1;

        delete option.duration;
        delete option.autoPlay;
        delete option.animType;

        let fromProps = {
            ...props,
            ...option,
            onStart:onStart,
            onUpdate:onUpdate,
            onComplete:onComplete
        };
        return  TweenMax.from(elements,duration,fromProps);
    }

    static fromTo(elements,fromProps,toProps,option,onStart,onUpdate,onComplete){
        let duration = option.duration || 1;
        option.paused = option.autoPlay === true ? false : true;
        option.animType = option.animType || "once";

        if(option.animType !== "once"){
            option.repeat = -1;
        }else{
            option.repeat = 0;
        }
        if(option.animType === "pingPang"){
            option.yoyo = true;
        }
        option.overwrite = 1;

        delete option.duration;
        delete option.autoPlay;
        delete option.animType;

        let _toProps = {
            ...toProps,
            ...option,
            onStart:onStart,
            onUpdate:onUpdate,
            onComplete:onComplete
        };
        return  TweenMax.from(elements,duration,fromProps,_toProps);
    }

    static playForward(anim){
        anim.play();
    }

    static playBackward(anim){
        anim.reverse();
    }

    static play(anim){
        anim.play();
    }

    static pause(anim){
        anim.pause();
    }

    static stop(anim){
        anim.restart();
        anim.pause();
    }

    //取值范围0-1
    static sample(anim,normalTime){
        anim.time(anim.duration()*normalTime,true);
    }
}