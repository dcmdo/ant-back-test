import React from 'react';
import UIComponent from "UIComponent"
import CoolMath from "CoolMath";
import './default-style/date-range-select.scss';


/**
 * isSelected:{Boolean} false
 * onPointClick:{Function} (tagName,component)=>{}
 */
class Day extends UIComponent{
    get className() {
        return "day";
    }

    get selectedClass(){
        return this.className+"-selected";
    }

    getClassName(){
        let className = super.getClassName();
        if(this.selectedClass){
            className[this.selectedClass] = this.isSelected;
        }
        return className;
    }

    get isRegisterEvent() {
        return true;
    }

    //----------------------------------------内部属性变量----------------------------------------
    get isSelected(){
        return this.props.isSelected;
    }

    pointClick(e) {
        super.pointClick(e);
        e.stopPropagation();
        if(this.props.onPointClick){
            this.props.onPointClick(this.tagName,this);
        }
    }
}

/**
 * title:{ReactElemnt} 标题，如果为空，则不显示
 * weekTitles:{[String]} ["日","一","二","三","四","五","六"] 星期显示文本
 * changeMenuConfig:{Object} {year:false, month:true}
 * showMode: 0-连续显示 1-头尾显示
 * rangeStartDate:{Date} 范围开始日期
 * rangeEndDate:{Date} 范围结束日期
 * selectStartDate:{Date} 已选中的开始日期
 * selectEndDate:{Date} 已选中的结束日期
 * onValueChange:{Function} (startDate, endDate, isManual, component)=>{}
 */
export default class DateRangeSelect extends UIComponent{
    get className() {
        return super.className || "default-date-range-select";
    }
    set className(className){
        super.className = className;
    }

    get isRegisterEvent() {
        return false;
    }

    get controlledPropsWithClone() {
        return [...super.controlledPropsWithClone, "weekTitles", "changeMenuConfig"];
    }

    get controlledProps() {
        return [...super.controlledProps, "title", "showMode", "rangeStartDate", "rangeEndDate", "selectStartDate", "selectEndDate","disableHandle"];
    }

    get clientRectChangeEventType() {
        return {resize:true};
    }

    //-------------------------------------------------内部属性方法-------------------------------------------------
    declareVars() {
        super.declareVars();
        this.onValueChange = null;
        this._isManual = false;
        this._dayClick = (tagName, component) => {
            let disableHandle = this.disableHandle;
            if(disableHandle){
                if(disableHandle(new Date(tagName))){
                    return;
                }
            }

            let startDate = this.selectStartDate;
            let endDate = this.selectEndDate;
            // 开始结束均已选择
            if(startDate && endDate){
                endDate = null;
                startDate = new Date(tagName);
            }else {
                if(!startDate){
                    startDate = new Date(tagName);
                }else if(!endDate){
                    endDate = new Date(tagName);
                }
            }

            if(startDate && endDate){
                if(startDate>endDate){
                    let tDate = startDate;
                    startDate = endDate;
                    endDate = tDate;
                }
            }
            this.selectStartDate = startDate;
            this.selectEndDate = endDate;
            this._isManual = true;
            this.valueChangeDelay();
            if(this.props.onSingleClick){
                this.props.onSingleClick(new Date(tagName), this._isManual, this);
            }
        };
        this.valueChangeDelay = UIComponent.fns.throttle(this.valueChange,100,{leading:false})
    }

    get disableHandle(){
        return this.state.disableHandle;
    }
    set disableHandle(value){
        this.setState({disableHandle:value});
    }

    valueChange(){
        if(this.props.onValueChange){
            this.props.onValueChange(
                this.selectStartDate ? new Date(this.selectStartDate) : null,
                this.selectEndDate? new Date(this.selectEndDate) : null,
                this._isManual, this
            );
        }
        if(this.onValueChange){
            this.onValueChange(
                this.selectStartDate ? new Date(this.selectStartDate) : null,
                this.selectEndDate? new Date(this.selectEndDate) : null,
                this._isManual, this
            );
        }
        this._isManual = false;
    }

    //-------------------------------------------------对外属性方法-------------------------------------------------
    get title(){
        return this.state.title;
    }
    set title(title){
        this.setState({title:title});
    }

    get weekTitles(){
        this.state.weekTitles = this.state.weekTitles || ["日", "一", "二", "三", "四", "五", "六"];
        return this.state.weekTitles;
    }
    set weekTitles(weekTitles){
        this.setState({weekTitles:weekTitles});
    }

    get changeMenuConfig(){
        let config = {
            year:true, month:true,
            ...this.state.changeMenuConfig
        };
        config.year = config.year === false ? false : true;
        config.month = config.month === false ? false : true;
        return this.state.changeMenuConfig || config;
    }
    set changeMenuConfig(changeMenuConfig){
        this.setState({changeMenuConfig: changeMenuConfig});
    }

    get showMode(){
        this.state.showMode = this.state.showMode || 0;
        return this.state.showMode;
    }
    set showMode(showMode){
        this.setState({showMode: showMode});
    }

    get rangeStartDate(){
        this.state.rangeStartDate = this.state.rangeStartDate || new Date();
        return this.state.rangeStartDate;
    }
    set rangeStartDate(rangeStartDate){
        this.setState({rangeStartDate:rangeStartDate});
    }

    get rangeEndDate(){
        this.state.rangeEndDate = this.state.rangeEndDate || new Date();
        return this.state.rangeEndDate;
    }
    set rangeEndDate(rangeEndDate){
        this.setState({rangeEndDate:rangeEndDate});
    }

    get selectStartDate(){
        this.state.selectStartDate = this.state.selectStartDate || null;
        return this.state.selectStartDate;
    }
    set selectStartDate(selectStartDate){
        this.setState({selectStartDate:selectStartDate});
    }

    get selectEndDate(){
        this.state.selectEndDate = this.state.selectEndDate || null;
        return this.state.selectEndDate;
    }
    set selectEndDate(selectEndDate){
        this.setState({selectEndDate:selectEndDate});
    }
    
    //-------------------------------------------------组件结构生命周期-------------------------------------------------
    get titleElement(){
        if(!this.title){
            return null;
        }
        return UIComponent.fns.constElement(
            this,"_title",this.statesHasChanged("title"),()=>{
                return <div className={"range-title"}>
                    {this.title}
                </div>
            }
        )
    }

    get weekTitleElements(){
        return UIComponent.fns.constElement(this, "_week_title", this.statesHasChanged("weekTitles"), ()=>{
            let wts = this.weekTitles;
            let wElements = [];
            wts.forEach((item, index)=>{
                wElements.push(
                    <span key={"week"+index}>
                        {item}
                    </span>
                )
            });
            return  <div className={"week-container"}>
                {wElements}
            </div>
        })
    }

    getDayArea(date){
        let _date = new Date(date);
        let year = _date.getFullYear();
        let month = _date.getMonth()+1;
        let fDay = CoolMath.getFirstDay(year, month);
        let mDays = CoolMath.getDayCount(year,month);

        let dElements = [];

        // 补全上月空白
        for(let i=0; i<fDay; i++){
            dElements.push(
                <div key={"null-"+i} className={"day out-day"}/>
            )
        }

        // 补全当月
        let startDate = this.selectStartDate;
        let endDate = this.selectEndDate;
        for(let i=0; i<mDays; i++){
            let _date = new Date(date);
            _date.setDate(i + 1);
            let _time = _date.getTime();

            let year = _date.getFullYear();
            let month = _date.getMonth();
            let d = _date.getDate();
            let isSelected = false;
            if(startDate){
                let sYear = startDate.getFullYear();
                let sMonth = startDate.getMonth();
                let sd = startDate.getDate();
                if(year===sYear && month===sMonth && d===sd){
                    isSelected = true;
                }
            }
            if(endDate){
                let eYear = endDate.getFullYear();
                let eMonth = endDate.getMonth();
                let ed = endDate.getDate();
                if(year===eYear && month===eMonth && d===ed){
                    isSelected = true;
                }
            }
            let inRangeClass = null;
            if(!isSelected){
                if(_date>startDate && _date<endDate){
                    inRangeClass = "in-range-day";
                }
            }
            dElements.push(
                <Day key={_time+""} tagName={_time} className={"day"}
                            extraClass={inRangeClass}
                            isSelected = {isSelected}
                            onPointClick = {this._dayClick}
                >
                    {_date.getDate()}
                </Day>
            )
        }

        // 补全下月
        let maxCount = 35;
        if(fDay+mDays > maxCount){
            maxCount = 42;
        }
        for(let i=mDays; i<maxCount-fDay; i++){
            dElements.push(
                <div key={"null-"+i} className={"day out-day"}/>
            )
        }

        let dayRows = [];
        let days = [];
        dElements.forEach((item, index)=>{
            let i = (index+1) % 7;
            if(i===0){
                days.push(item);
                dayRows.push(
                    <div key={dayRows.length} className={"days-row"}>
                        {days}
                    </div>
                );
                days = [];
            }else{
                days.push(item);
            }
        });

        return <div key={year+"/"+month} className={"range-day-area"}>
            <span>{year+"年"+month+"月"}</span>
            <div className={"days-container"}>
                {dayRows}
            </div>
        </div>
    }

    get dayContainer(){
        let sDate = new Date(this.rangeStartDate);
        let eDate = new Date(this.rangeEndDate);

        let dayAreas = [];

        while (sDate <= eDate){
            dayAreas.push(
                this.getDayArea(sDate)
            );
            sDate = CoolMath.addMonth(sDate,1);
        }

        return <div ref={"range_day_container"} className={"range-day-container"}>
            {dayAreas}
        </div>
    }

    get mode1Element(){
        if(this.showMode !== 0){
            return null;
        }
        return UIComponent.fns.constElement(this,"_mode1_element",this.statesHasChanged(
            "showMode", "rangeStartDate", "rangeEndDate", "selectStartDate", "selectEndDate"
        ),()=>{
            return <React.Fragment>
                {this.weekTitleElements}
                {this.dayContainer}
            </React.Fragment>
        })
    }

    get mode2Element(){
        if(this.showMode !== 1){
            return null;
        }
        return <React.Fragment>
            还未开发
        </React.Fragment>
    }

    getChildren() {
        return <React.Fragment>
            {this.titleElement}
            {this.mode1Element}
            {this.mode2Element}
        </React.Fragment>
    }

    domDidChange() {
        super.domDidChange();
        // 处理一下valueChange
        this.valueChangeDelay();
    }
}