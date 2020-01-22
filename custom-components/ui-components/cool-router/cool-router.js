import React,{Component} from 'react';
import Event from 'Event';
import Route from './route';
import Lost from './lost';

// hash优化函数
const hashRefine = ()=>{
    let hash = location.hash;
    if(!hash){
        hash = "#/";
        location.hash = hash;
    }
};
hashRefine();

// 单例
let singleInstance = null;

export default class CoolRouter {
    /**
     * 构造函数
     * @param route {{path:"",tagName:"",childRoutes:[]}}
     */
    constructor(route){
        if(!this.initSingle()){
            return;
        }

        this.declareVars(route);
        this.onHashChangeHandle();
        this.refineRoute();
        this.doMatch();
    }
    //-------------------------------------------------内部方法属性-------------------------------------------------
    initSingle(){
        if(singleInstance){
            console.error("不允许实例化多个路由模块！");
            return false;
        }

        singleInstance = this;
        return true;
    }

    declareVars(route){
        this._route = route?route:{};
        this._matchSets = {};
        this._isLost = false;
        this._event = new Event();
    }
    onHashChangeHandle(){
        window.addEventListener("hashchange",()=>{
            hashRefine();
            this.doMatch();
        });
    }
    refine(route){
        route.path = route.path.replace(/[\s\/]/g,"");
        if(route.childRoutes){
            route.childRoutes.forEach((_route)=>{
                this.refine(_route);
            })
        }
    }
    refineRoute(){
        this.refine(this.route);
    }
    match(route){
        //路径
        let routePath = route.path;
        let matchPath = this._matchArray[0];
        //参数匹配
        let routeParasMatch = routePath.match(/\:[A-z|_][A-z|0-9|_]*/g);
        routePath = routePath.replace(/\:[^]*/g,"");
        if(routeParasMatch && routePath===""){
            this._matchArray.splice(0,0,"");
            matchPath = "";
        }
        //路径匹配
        if(matchPath === routePath){
            let matchData = {path:routePath,props:{}};
            if(routeParasMatch){
                let props = {};
                routeParasMatch.forEach((key,index)=>{
                    props[key.replace(":","")] = this._matchArray[index+1]?decodeURI(this._matchArray[index+1]):undefined;
                });
                matchData.props = props;
                this._matchArray.splice(0,routeParasMatch.length+1);
            }else{
                this._matchArray.splice(0,1);
            }
            this._matchSets[route.tagName] = matchData;
            if(this._matchArray.length!==0){
                let childRoutes = route.childRoutes;
                if(childRoutes){
                    childRoutes.some((_route)=>{
                        return this.match(_route);
                    })
                }
            }
            return true;
        }else{
            return false;
        }
    }
    doMatch(){
        this._matchSets = {};
        this._matchArray = this.hash.split("/");
        for(let i=this._matchArray.length-1;i>0;i--){
            if(this._matchArray[i]===""){
                this._matchArray.splice(i,1);
            }
        }
        this.match(this.route);
        let lost = this._matchArray.length!==0;
        if(this._isLost!==lost){
            this._isLost = lost;
            this.dispatchLost();
        }
        this.dispatchMatchChange();
    }
    getMatch(tagName){
        return this._matchSets[tagName];
    }
    dispatchMatchChange(){
        this._event.dispatchEvent({type:"matchChange"});
    }
    onMatchChangeHandle(handle){
        this._event.addEventListener("matchChange",handle);
    }
    offMatchChangeHandle(handle){
        this._event.removeEventListener("matchChange",handle);
    }
    dispatchLost(){
        this._event.dispatchEvent({type:"lost",isLost:this._isLost});
    }
    onLostHandle(handle){
        this._event.addEventListener("lost",handle);
    }
    offLostHandle(handle){
        this._event.removeEventListener("lost",handle);
    }
    //-------------------------------------------------对外属性及方法-------------------------------------------------
    get route(){
        return this._route;
    }
    set route(route){
        this._route = route?route:{};
        this.refineRoute();
        this.doMatch();
    }
    get hash(){
        let hash = location.hash;
        if(hash){
            hash = hash.replace(/\#/g,"");
            hash = hash.replace(/(\/){2,}/g,"/");
            if(!hash.startsWith("/")){
                hash = "/"+hash;
            }
            hash = "#"+hash;
        }
        return hash.replace("#","");
    }
    set hash(hash){
        location.hash = hash;
    }
    pushHash(hash){
        this.hash += hash;
    }
    //-------------------------------------------------静态属性方法-------------------------------------------------
    static get self(){
        return singleInstance;
    }
    static get Route(){
        return Route;
    }
    static get Lost(){
        return Lost;
    }
}