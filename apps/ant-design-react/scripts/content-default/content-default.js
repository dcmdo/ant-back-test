import React,{Component}from 'react';
import UIComponent from 'UIComponent';
import {Icon, Table ,ConfigProvider} from 'antd';
import "./default-style/content-default-style.scss"


export default class ContentDefault extends UIComponent{
    declareVars() {
        super.declareVars();
        this.columns = [
            {
                title: '单号',
                dataIndex: 'tripNum',
            },
            {
                title: '出差人',
                dataIndex: 'tripPerson',
            },
            {
                title: '出差人部门',
                dataIndex: 'tripPersonDepartment',
            },
            {
                title: '提交人',
                dataIndex: 'submitPerson',
            },
            {
                title: '递交日期',
                dataIndex: 'submitDate',
            },
            {
                title: '报账金额',
                dataIndex: 'ReimbursementAmount',
            },
            {
                title: '出发日期',
                dataIndex: 'startDate',
            },
            {
                title: '返回日期',
                dataIndex: 'backDate',
            }
        ];

    }


    get className() {
        return "content-default";
    }

    get isRegisterEvent(){
        return false;
    }
    //---------------------------------------属性-------------------------------------------

    //---------------------------------------方法-------------------------------------------

    customizeRenderEmpty(){
        return <div style={{ textAlign: 'center' }}>
            <p>暂无数据</p>
        </div>;
    }
    //---------------------------------------结构-------------------------------------------
    getChildren(){
        return <React.Fragment>
            <div className="home_wrapper">
                <div className="lead">
                    <div className="leadLeft">出差申请单待办</div>
                    <div className="leadRight">
                        <span className="leadRightText">查看更多</span>
                        <Icon type="right" className={"leadRightIcon"} />
                    </div>
                </div>
                <div className="table-container">
                    <ConfigProvider renderEmpty={this.customizeRenderEmpty}>
                        <Table columns={this.columns} bordered></Table>
                    </ConfigProvider>
                </div>
            </div>
        </React.Fragment>;
    }
    domMount() {
        super.domMount();
    }
}
