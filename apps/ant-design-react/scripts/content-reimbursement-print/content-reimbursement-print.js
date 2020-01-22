import React,{Component}from 'react';
import UIComponent from 'UIComponent';
import {Row, Col, Table, Select, Input } from 'antd';
import "./default-style/content-reimbursement-print-style.scss"

const { Option } = Select;

export default class ContentReimbursementPrint extends UIComponent{
    declareVars() {
        super.declareVars();
        this.companyName="全部";
        this.reimbursementPerson="";
        this.reimbursementNum="";
        this.submitPerson="";
        this.tripNum="";
        this.submitStartDate="";
        this.submitEndDate="";

    }


    get className() {
        return "content-reimbursement-print";
    }

    get isRegisterEvent(){
        return false;
    }
    //---------------------------------------属性-------------------------------------------

    //---------------------------------------方法-------------------------------------------
    selectCompanyName(value){
        this.companyName=value;
        console.log(this.companyName);
    }
    setReimbursementPerson(value){
        this.reimbursementPerson=value;
        console.log(this.reimbursementPerson);
    }
    //---------------------------------------结构-------------------------------------------
    getChildren(){
        return <React.Fragment>
            <div className="searchBar">
                <div className="condition-container">
                    <div className="condition-group">
                        <span className="label">所属公司：</span>
                        <Select className={"condition-content"} defaultValue={this.companyName} onChange={this.selectCompanyName.bind(this)}>
                            <Option value="全部">全部</Option>
                            <Option value="国网吉林电力有限公司">国网吉林电力有限公司</Option>
                        </Select>
                    </div>
                    <div className="condition-group">
                        <span className="label" className="label">报销人：</span>
                        <Input className={"condition-content"} placeholder="请输入" allowClear onChange={this.setReimbursementPerson.bind(this)} />
                    </div>
                    <div className="condition-group">
                        <span className="label" className="label">报销单号：</span>
                        <Input className={"condition-content"} placeholder="请输入" allowClear onChange={this.setReimbursementPerson.bind(this)} />
                    </div>
                    <div className="condition-group">
                        <span className="label" className="label">提交人：</span>
                        <Input className={"condition-content"} placeholder="请输入" allowClear onChange={this.setReimbursementPerson.bind(this)} />
                    </div>
                    <div className="condition-group">
                        <span className="label" className="label">申请单号：</span>
                        <Input className={"condition-content"} placeholder="请输入" allowClear onChange={this.setReimbursementPerson.bind(this)} />
                    </div>
                    <div className="condition-group">
                        <span className="label" className="label">提交时间：</span>
                        <Input className={"condition-content"} placeholder="请输入" allowClear onChange={this.setReimbursementPerson.bind(this)} />
                    </div>
                    {/*<Row type={"flex"} justify={"center"} align={"middle"} className={"condition-row"}>
                        <Col span={12} className={"condition-col"}>
                            <div className="condition-group">
                                <span className="label">所属公司：</span>
                                <Select defaultValue={this.companyName} style={{ width: 120 }} onChange={this.selectCompanyName.bind(this)}>
                                    <Option value="全部">全部</Option>
                                    <Option value="国网吉林电力有限公司">国网吉林电力有限公司</Option>
                                </Select>
                            </div>
                        </Col>
                        <Col span={12} className={"condition-col"}>
                            <span className="label">报销人：</span>
                            <Input placeholder="请输入" allowClear onChange={this.setReimbursementPerson.bind(this)} />
                        </Col>
                    </Row>
                    <Row type={"flex"} justify={"center"} align={"middle"} className={"condition-row"}>
                        <Col span={12} className={"condition-col"}>col-8</Col>
                        <Col span={12} className={"condition-col"}>col-8</Col>
                    </Row>
                    <Row type={"flex"} justify={"center"} align={"middle"} className={"condition-row"}>
                        <Col span={12} className={"condition-col"}>col-6</Col>
                        <Col span={12} className={"condition-col"}>col-6</Col>
                    </Row>*/}
                </div>
                <div className="button-container">

                </div>
            </div>
        </React.Fragment>;
    }
    domMount() {
        super.domMount();
    }
}
