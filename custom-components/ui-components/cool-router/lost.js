import React,{Component} from 'react';
import CoolRouter from "./cool-router";
import LostPage from './lost-page/lost-page';
//lostPage
export default class Lost extends Component{
    constructor(props,context){
        super(props,context);
        if(!CoolRouter.self){
            console.error("为实例化CoolRouter对象");
            return;
        }
        this.initState();
        this.declareVars();
        this.onLostHandle();
    }
    render(){
        return this.state.isLost?<LostPage/>:null;
    }
    shouldComponentUpdate(nextProps, nextState) {
        return this.state.isLost!==nextState.isLost;
    }
    componentWillUnmount(){
        this.offLostHandle();
    }
    //-------------------------------------------------内部属性方法-------------------------------------------------
    declareVars(){
        this._lostHandle = this.lost.bind(this);
    }
    initState(){
        this.state = {isLost:CoolRouter.self.isLost};
    }
    onLostHandle(){
        CoolRouter.self.onLostHandle(this._lostHandle);
    }
    offLostHandle(){
        CoolRouter.self.offLostHandle(this._lostHandle);
    }
    lost(event){
        this.setState({isLost:event.isLost});
    }
    get LostPage(){
        return this.props.lostPage?this.props.lostPage:LostPage;
    }
}