import React from 'react';
import UIComponent from 'UIComponent';
import KeepZoomRatio from 'KeepZoomRatio';
import Image from 'Image';
import LostImage from './image/lost.svg';
import './default-style.scss';
export default class LostPage extends UIComponent{
    get isRegisterEvent() {
        return false;
    }
    get className() {
        return "default-lost-page";
    }
    getChildren() {
        return  <div className="lost-page-window">
            <KeepZoomRatio widthHeightRadio={8/5}>
                <Image src={LostImage} style={{position:"absolute",width:"auto",height:"auto",left:"2rem",right:"2rem",top:"2rem",bottom:"5rem"}}/>
                <div className="text-container">
                    <span style={{color:"#96a6a6",fontSize:"1.2rem",fontWeight:"bold"}}>错误：</span>
                    <span style={{color:"#ed7474",fontSize:"0.8rem",fontWeight:"bold"}}>页面丢失请检查链接地址！</span>
                    <a href={"#/"} style={{color:"#1bbc9d",marginLeft:"0.5rem",fontSize:"0.8rem",fontWeight:"bold",textDecoration:"none"}}>
                        返回首页
                    </a>
                    <i className="cool-icon-38" style={{color:"#1bbc9d",fontSize:"1.5rem"}}/>
                </div>
            </KeepZoomRatio>
        </div>;
    }
}