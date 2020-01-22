import React,{Component}from 'react';
import UIComponent from 'UIComponent';
import "./default-style/home-page-style.scss";
import { Layout, Menu, Icon, Popover, Breadcrumb } from 'antd';
import DataCenter from "../data-center/data-center";

import ContentDefault from "../content-default/content-default";
import ContentReimbursementPrint from "../content-reimbursement-print/content-reimbursement-print";

const { Header, Content, Sider } = Layout;
const { SubMenu } = Menu;


export default class HomePage extends UIComponent{
    declareVars() {
        super.declareVars();
        this.submenuKeys={
            '企业管理':{
                parent:false
            },
            '对账管理':{
                parent:false
            },
            '系统管理':{
                parent:false,
            },
            '业务管理':{
                parent:false
            },
            '版本信息':{
                parent:false
            },
            '权限管理':{
                parent:'系统管理'
            },
            '组织管理':{
                parent:'系统管理'
            },
            '差旅报表':{
                parent:'系统管理'
            },
            '催报管理':{
                parent:'系统管理'
            }
        };
        this.contentKeys={
            index:ContentDefault,
            报销单打印:ContentReimbursementPrint,
        };

        DataCenter.userData={
            userName:"管理员"
        };

    }
    initState() {
        let state = super.initState();
        state.openKeys=[];
        state.breadPath=[];
        state.contentKey="index";
        return state;
    }

    get className() {
        return "home-page";
    }

    get isRegisterEvent(){
        return false;
    }
    //---------------------------------------属性-------------------------------------------
    get hoverContent(){
        return <div style={{display:"inline-flex"}}>
            <img style={{width: "16px", margin: "0px 8px 0px 12px"}}
                src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAATVJREFUOBGlkk9Og1AQxvkXsW6MTdx5A2PbhAAJu9bijo0JV3DlMbq3J+gl2n1dkQBlpxfowm27EzbgN5H3fLYTaeIkj5kM32+GN4ym/dP0U3nHccbQznGioii2gjNE8Jdv4RU0A13XX33fvxH6zgKe500gJviCoKZpruq6vqSYzPp2/JNgiAnutYq9YRgPeZ6/C8IUwaF3Xfce3VY4EjZNMwS8UbXsEFt4eQhnWfYLpkJHMwA8BXgSzBbAnWdK551lWVOus7iGHCI63wIMbdt+rKpqjfgacJimaSHEnJcFCMZ5KcvyHDZGkT7gNw5Sc2oBFy+2WJQhiuyxbR+qsDOO4/isU8QI5G/EDJ4wwBGjYVP40g1sIa8A+BnKO1bNJ2knfgpEUTRKkkRsHY8o2SAIPvEF2hfEkIfynhfZMAAAAABJRU5ErkJggg=="/>
            <span>修改密码</span>
        </div>;
    }

    get breadcrumb(){
        if(UIComponent.fns.TypesCheck.isArray(this.state.breadPath)){
            if(this.state.breadPath.length>0){
                let breadItems=[];
                this.state.breadPath.forEach((_path)=>{
                    let item=<Breadcrumb.Item key={_path}>{_path}</Breadcrumb.Item>;
                    breadItems.push(item);
                });
                let breadcrumb= <div className="breadcrumb-container" ref={"breadcrumbContainer"}>
                    <div className="label"><div className={"label-icon"}/><span className={"label-text"}>当前位置：</span></div>
                    <Breadcrumb separator=">" className={"bread-container"}>
                        {breadItems}
                    </Breadcrumb>
                </div>;
                return breadcrumb;
            }
        }
        return null;
    }

    get contentComponent(){
        let key="index";
        if(this.state.contentKey){
            key=this.state.contentKey;
        }
        let Type=this.contentKeys[key];

        return Type?<Type></Type>:null;
    }
    //---------------------------------------方法-------------------------------------------
    getDataInfo(_key){
        return DataCenter.userData[_key];
    }

    onOpenChange(openKeys) {
        const latestOpenKey = openKeys.find(key => this.state.openKeys.indexOf(key) === -1);
        let keys=[];
        this.addOpenKey(latestOpenKey,keys);
        this.setState({
            openKeys: keys,
        });
    };
    addOpenKey(_key,_container){
        if(this.submenuKeys[_key]){
            if(this.submenuKeys[_key].parent){
                this.addOpenKey(this.submenuKeys[_key].parent,_container);
            }
            _container.push(_key);
        }
    }
    onMenuClick(_event){
        if(this.state.contentKey!==_event.key){
            this.setState({contentKey:_event.key});
        }
        this.setState({breadPath:_event.keyPath.reverse()})
    }
    //---------------------------------------结构-------------------------------------------
    getChildren(){
        return <Layout className={"all-container"}>
            <Sider className={"left-container"} width={"13vw"}>
                <div className="top">
                    <div className="title">State Grid</div>
                    <img src="data:image/png;base64,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"/>
                    <p><span>你好，</span>{this.getDataInfo("userName")}</p>
                </div>
                <Menu theme={"dark"} className={"left-menu"} mode="inline" openKeys={this.state.openKeys} onOpenChange={this.onOpenChange.bind(this)} onClick={this.onMenuClick.bind(this)} style={{ width: "100%" }}>
                    <SubMenu key="企业管理" className={"left_submenu"} title={<span><span className={"menu-icon"}/><span>企业管理</span></span>}>
                        <Menu.Item key="报销单打印">报销单打印</Menu.Item>
                        <Menu.Item key="业务审批配置">业务审批配置</Menu.Item>
                        <Menu.Item key="出差申请单打印" >出差申请单打印</Menu.Item>
                    </SubMenu>
                    <SubMenu key="对账管理" className={"left_submenu"} title={<span><span className={"menu-icon"}/><span>对账管理</span></span>}>
                        <Menu.Item key="总账查询" >总账查询</Menu.Item>
                        <Menu.Item key="详单查询" >详单查询</Menu.Item>
                        <Menu.Item key="月度账单">月度账单</Menu.Item>
                        <Menu.Item key="模板管理" >模板管理</Menu.Item>
                    </SubMenu>
                    <SubMenu key="系统管理" className={"left_submenu"} title={<span><span className={"menu-icon"}/><span>系统管理</span></span>}>
                        <SubMenu key="权限管理" title="权限管理">
                            <Menu.Item key="岗位管理" ><span><span className={"menu-icon-round"}/><span>岗位管理</span></span></Menu.Item>
                            <Menu.Item key="系统角色" ><span><span className={"menu-icon-round"}/><span>系统角色</span></span></Menu.Item>
                            <Menu.Item key="权限维护" ><span><span className={"menu-icon-round"}/><span>权限维护</span></span></Menu.Item>
                        </SubMenu>
                        <SubMenu key="组织管理" title="组织管理">
                            <Menu.Item key="企业组织管理" ><span><span className={"menu-icon-round"}/><span>企业组织管理</span></span></Menu.Item>
                            <Menu.Item key="企业部门管理" ><span><span className={"menu-icon-round"}/><span>企业部门管理</span></span></Menu.Item>
                            <Menu.Item key="企业用户管理" ><span><span className={"menu-icon-round"}/><span>企业用户管理</span></span></Menu.Item>
                        </SubMenu>
                        <SubMenu key="差旅报表" title="差旅报表">
                            <Menu.Item key="报销单查询" ><span><span className={"menu-icon-round"}/><span>报销单查询</span></span></Menu.Item>
                            <Menu.Item key="审批详情" ><span><span className={"menu-icon-round"}/><span>审批详情</span></span></Menu.Item>
                            <Menu.Item key="自付单据报表" ><span><span className={"menu-icon-round"}/><span>自付单据报表</span></span></Menu.Item>
                        </SubMenu>
                        <SubMenu key="催报管理" title="催报管理">
                            <Menu.Item key="未使用机票列表" ><span><span className={"menu-icon-round"}/><span>未使用机票列表</span></span></Menu.Item>
                            <Menu.Item key="垫付单据超期催报管理" ><span><span className={"menu-icon-round"}/><span>垫付单据超期催报管理</span></span></Menu.Item>
                        </SubMenu>
                    </SubMenu>
                    <SubMenu key="业务管理" className={"left_submenu"} title={<span><span className={"menu-icon"}/><span>业务管理</span></span>}>
                        <Menu.Item key="代办" >代办</Menu.Item>
                        <Menu.Item key="已办" >已办</Menu.Item>
                    </SubMenu>
                    <SubMenu key="版本信息" className={"left_submenu"} title={<span><span className={"menu-icon"}/><span>版本信息</span></span>}>
                        <Menu.Item key="历史版本" >历史版本</Menu.Item>
                        <Menu.Item key="研发进展" >研发进展</Menu.Item>
                        <Menu.Item key="未来计划" >未来计划</Menu.Item>
                    </SubMenu>
                </Menu>
            </Sider>
            <Layout className={"right-container"}>
                <Header className={"header"}>
                    <div className={"left"}>
                        <div className={"left-title"}>商旅业务管理平台</div>
                        <p>Business Trip Operation Management System</p></div>
                    <div className={"right"}>
                        <Popover content={this.hoverContent} className="account">
                            <img className="accountIcon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAURJREFUOBGN0r1LQlEYx/FzItN8AafWIBJsaMhNQZz8E2oKp2hsjvbaGoTGGoQI2lrc/AucXBwaJNpcgoio7MXb9wd5Ofd4L/bAB8/zcq56zjUmIYIgsCihgpWEsfgyG3YxxhSfmOAMmfgdTpWhFl5wgDxSaGKEG2d0fslABs9o+V1qW9Cvqfu9MKdZxTdWw6KzoN7HiVMyS27CehmqJR2aHvyB+ODpWbzi2J+g1oB+3Y7fi+QM6PA0eA5dYRlH0Nm0I8NxCUO6/wu8YxZfLLrI+XusW2CgRH6JbXQwhs5F97+HFA6ttT0+o8HmIh5xh7Vo1xhqaZxCL1XF72vgFgOk55pOgf4V7pENyyQbUCS/JH/TzOSg89lXSf9PUcUEQxoFFRbEgH4N17MHrJPo5XnCf+NNg+Et8M2bbr7gKQH9B27j5xfndxF+WPhR+QAAAABJRU5ErkJggg=="/>
                            <p className="user-name">{this.getDataInfo("userName")}</p>
                            <img className="accountOpenIcon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAMdJREFUOBHt0L0KwjAUhuEi+EfxZ6gi4iYI6uSFegveRxfBQRxFETo5iKCLqCDopPE90gQS2joLBh6SnPMlpfG8//i8gFKqjzFy356ETAVr+CbLZgEZc5RMw1nQq+IFGRPTZjPACQ/MUDTNeEGtjgiS2SKwMhS6OEMCUxR0gLV8eYM7dmjonjXT6OECuSREHvLPK0htj5Z1yN0QkAe9Ql+yjNcH5rabT9wTHOIGebAnjugkhtOKHBhBj1paLrPO6SbKmaHfb74B/ori/1vrj6EAAAAASUVORK5CYII=" />
                        </Popover>
                        <div className="vertical"></div>
                        <div className="quit">
                            <img className={"quit-icon"} src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAARCAYAAADUryzEAAAAAXNSR0IArs4c6QAAAV5JREFUOBGtkk0rRGEUx+dOpLxMQzQlGy+zkCz4AFIW8gkUkbK1oGThE1jJytJK2SovZUkUWysvzZQaxSiKKHm5fv87z3N75o6r1Jz6dc7/nP9z7p15biJR7fB9Pwtp6IMipKAZun97VtI2jWkLfQmT0GZIkWfgGs8mpKnLg2Y75OAeJjQlD4Oiw+hp6ge4gky4AZGEM7iBVjugLltglmToF+AYvMBLMQVfMGQPG3PFAtMfwfsN43bBAWLbPfzXAjPb58yuav2Jg3Ak8Y84xDsgvxY0wrNEJC7QG1CM9CVfoElFDdxCl4QbnufdoWfdnlPLXwg0v2UddDW1jiG2xFcHeVizC3oRH7ASe8oZ4FuFd8iGbcQy6CrnoHS/4bRU0Nf3Mg+6wsXIOPjylhi8wQmMQr1M5AYYg1N4hYWKw7bBsAf24BMUWqiQ3oFO67U57nVbMPSD8iOccytP5OrHDy9TRVvFVVzPAAAAAElFTkSuQmCC"/>
                            <span className={"quit-text"}>退出系统</span>
                        </div>
                    </div>
                </Header>
                <Content className={"main-content"}>
                    {this.breadcrumb}
                    <div className="content-component-container">
                        {this.contentComponent}
                    </div>
                </Content>
            </Layout>
        </Layout>;
    }
    domMount() {
        super.domMount();
    }
}
