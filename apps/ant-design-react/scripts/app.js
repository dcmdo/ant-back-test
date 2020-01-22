import 'Polyfill';
import React,{Component}from 'react';
import ReactDOM from 'react-dom';
import 'disable-touch-refresh';
import ForceOrientation from 'ForceOrientation';
import UIComponent from 'UIComponent';
import './app-style.scss';
import HomePage from "./home-page/home-page";

ForceOrientation.forceLandscape();

class App extends UIComponent{
    get isRegisterEvent(){
        return false;
    }
    render(){
        return <HomePage/>;
    }
    domMount() {
        super.domMount();
    }
}
ReactDOM.render(
    <App/>,
    document.getElementById('react-container')
);