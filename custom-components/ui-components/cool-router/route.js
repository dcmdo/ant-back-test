import React,{Component} from 'react';
import Immutable from "immutable";
import CoolRouter from './cool-router';

/**
 * 路由组件
 * tagName {String} 路由标识
 * component {ReactComponent} 路由匹配时要初始化的组件
 */
export default class Route extends Component{
    constructor(props,context){
        super(props,context);
        if(!CoolRouter.self){
            console.error("为实例化CoolRouter对象");
            return;
        }
        this.declareVars();
        this.initState();
        this.onMatchChangeHandle();
    }
    //-------------------------------------------------内部属性方法-------------------------------------------------
    declareVars(){
        this._matchChangeHandle = this.matchChange.bind(this);
        this.alive = true;
    }
    initState(){
        this.state = {match:CoolRouter.self.getMatch(this.props.tagName)};
    }
    onMatchChangeHandle(){
        CoolRouter.self.onMatchChangeHandle(this._matchChangeHandle);
    }
    offMatchChangeHandle(){
        CoolRouter.self.offMatchChangeHandle(this._matchChangeHandle);
    }
    matchChange(){
        if(this.alive){
            this.setState({match:CoolRouter.self.getMatch(this.props.tagName)});
        }
    }
    get match(){
        return this.state.match;
    }

    //----------------------------------------组件结构及生命周期----------------------------------------
    render(){
        const MyComponent = this.props.component;
        let match = this.match;
        if(match){
            return <React.Fragment>
                {MyComponent?<MyComponent {...match.props}/>:null}
                {this.props.children}
            </React.Fragment>
        }else{
            return null;
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        return !Immutable.is(Immutable.fromJS(nextState.match),Immutable.fromJS(this.state.match));
    }

    componentWillUnmount(){
        this.alive = false;
        this.offMatchChangeHandle();
    }
}