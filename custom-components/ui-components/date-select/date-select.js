import React from 'react';
import UIComponent from 'UIComponent';
import Button from 'Button';
import CoolMath from 'CoolMath';
import './default-style/date-select.scss';

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
 * showDate:{Date} 当前显示的日期
 * date:{Date} 当前选择的日期
 * disableHandle:{Function} (data)=>{ return true or false }
 * onValueChange:(tagName, date, isManual, component)=>{}
 */
export default class DateSelect extends UIComponent{
    get className() {
        return super.className || "default-date-select";
    }

    get isRegisterEvent() {
        return false;
    }

    get controlledPropsWithClone() {
        return [...super.controlledPropsWithClone, "weekTitles", "changeMenuConfig"];
    }

    get controlledProps() {
        return [...super.controlledProps, "title", "showDate", "date", "disableHandle"];
    }

    //----------------------------------------内部属性方法----------------------------------------
    declareVars() {
        super.declareVars();
        this.onValueChange = null;
        this._isManual = false;
        this._oldDate = undefined;
        this._dayClick = (tagName, component)=>{
            if(tagName){
                let disableHandle = this.disableHandle;
                if(disableHandle){
                    if(disableHandle(new Date(tagName))){
                        return;
                    }
                }
                let newDate = new Date(tagName);
                this._isManual = true;
                const isEqual = UIComponent.fns.ObjectFns.isEqual;
                if(isEqual(this._oldDate, newDate)){
                    if(this.props.onValueChange){
                        this.props.onValueChange(this.tagName, newDate, true, this);
                    }
                    if(this.onValueChange){
                        this.onValueChange(this.tagName, newDate, true, this);
                    }
                }else {
                    this.date = new Date(tagName);
                }
            }
        }
    }

    get disableHandle(){
        return this.state.disableHandle;
    }
    set disableHandle(value){
        this.setState({disableHandle:value});
    }

    valueChange(){
        const isEqual = UIComponent.fns.ObjectFns.isEqual;
        if(!isEqual(this._oldDate, this.date)){
            let newDate = this.date ? new Date(this.date) : null;
            if(this.props.onValueChange){
                this.props.onValueChange(this.tagName, newDate, this._isManual, this);
            }
            if(this.onValueChange){
                this.onValueChange(this.tagName, newDate, this._isManual, this);
            }
            this._isManual = false;
            this._oldDate = this.date ? new Date(this.date) : null;
        }
    }
    //----------------------------------------对外属性及方法----------------------------------------
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
        this.state.changeMenuConfig = config;
        return this.state.changeMenuConfig;
    }
    set changeMenuConfig(changeMenuConfig){
        this.setState({changeMenuConfig: changeMenuConfig});
    }

    get showDate(){
        this.state.showDate = this.state.showDate || this.date || new Date();
        return this.state.showDate;
    }
    set showDate(date){
        this.setState({showDate:date});
    }

    get date(){
        return this.state.date || null;
    }
    set date(date){
        this.setState({date:date});
    }

    //----------------------------------------组件结构生命周期----------------------------------------
    get titleElement(){
        if(!this.title){
            return null;
        }
        return UIComponent.fns.constElement(
            this,"_title",this.statesHasChanged("title"),()=>{
                return <div className={"date-select-title"}>
                    {this.title}
                </div>
            }
        )
    }

    get yearMonthSelectElement(){
        return UIComponent.fns.constElement(
            this,"_year_month",this.statesHasChanged("changeMenuConfig", "showDate"),()=>{
                let date = this.showDate;
                let changeMenuConfig = this.changeMenuConfig;
                return <div className={"date-select-year-month"}>
                    <div className={"change-button-container"}>
                        {
                            changeMenuConfig.year ?
                                <Button className={"change-button"}
                                        onClick={()=>{
                                            this.showDate = CoolMath.addYear(this.showDate,-1);
                                        }}
                                >
                                    <i className={"cool-icon-11"}/>
                                </Button> : null
                        }
                        {
                            changeMenuConfig.month ?
                                <Button className={"change-button"}
                                        onClick={()=>{
                                            this.showDate = CoolMath.addMonth(this.showDate,-1);
                                        }}
                                >
                                    <i className={"cool-icon-3"}/>
                                </Button> : null
                        }
                    </div>
                    <span>
                        {date.getFullYear()+"年"+(date.getMonth()+1)+"月"}
                    </span>
                    <div className={"change-button-container"}>
                        {
                            changeMenuConfig.month ?
                                <Button className={"change-button"}
                                        onClick={()=>{
                                            this.showDate = CoolMath.addMonth(this.showDate,1);
                                        }}
                                >
                                    <i className={"cool-icon-4"}/>
                                </Button> : null
                        }
                        {
                            changeMenuConfig.year ?
                                <Button className={"change-button"}
                                        onClick={()=>{
                                            this.showDate = CoolMath.addYear(this.showDate,1);
                                        }}
                                >
                                    <i className={"cool-icon-12"}/>
                                </Button> : null
                        }
                    </div>
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

    get dayElements(){
        let dElements = [];

        let showDate = this.showDate;
        let date = this.date;

        let cYear = showDate.getFullYear();
        let cMonth = showDate.getMonth()+1;
        let fDay = CoolMath.getFirstDay(cYear, cMonth);
        let mDay = CoolMath.getDayCount(cYear, cMonth);

        let lDate = CoolMath.addMonth(showDate,-1);
        let lmDay = CoolMath.getDayCount(lDate.getFullYear(),lDate.getMonth()+1);

        let nDate = CoolMath.addMonth(showDate,1);

        // 填充上月日期数
        for(let i = 0; i < fDay; i++){
            let _date = new Date(lDate);
            _date.setDate(lmDay + i - fDay + 1);
            let _time = _date.getTime();
            let isSelected = date ? (
                _date.getFullYear() === date.getFullYear()
                && _date.getMonth() === date.getMonth()
                && _date.getDate() === date.getDate()
                ) : false;
            dElements.push(
                <Day key={_time} tagName={_time} className={"day"} extraClass={"out-day"} isSelected={isSelected}
                     onPointClick={this._dayClick}
                >
                    {_date.getDate()}
                </Day>
            )
        }

        // 填充当月日期数
        for(let i = 0; i < mDay; i++){
            let _date = new Date(showDate);
            _date.setDate(i + 1);
            let _time = _date.getTime();
            let isSelected = date ? (
                _date.getFullYear() === date.getFullYear()
                && _date.getMonth() === date.getMonth()
                && _date.getDate() === date.getDate()
            ) : false;
            dElements.push(
                <Day key={_time} tagName={_time} className={"day"} isSelected={isSelected}
                     onPointClick={this._dayClick}
                >
                    {_date.getDate()}
                </Day>
            );
        }

        // 填充下月日期数
        for(let i = 0; i < (42-mDay-fDay); i++){
            let _date = new Date(nDate);
            _date.setDate(i + 1);
            let _time = _date.getTime();
            let isSelected = date ? (
                _date.getFullYear() === date.getFullYear()
                && _date.getMonth() === date.getMonth()
                && _date.getDate() === date.getDate()
            ) : false;
            dElements.push(
                <Day key={_time} tagName={_time} className={"day"} extraClass={"out-day"} isSelected={isSelected}
                     onPointClick={this._dayClick}
                >
                    {_date.getDate()}
                </Day>
            );
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

        return dayRows;
    }

    getChildren() {
        return <React.Fragment>
            {this.titleElement}
            {this.yearMonthSelectElement}
            {
                UIComponent.fns.constElement(
                    this,"_days",this.statesHasChanged("date","showDate"),()=>{
                        return <div className={"date-select-days"}>
                            {this.weekTitleElements}
                            <div className={"days-container"}>
                                {this.dayElements}
                            </div>
                        </div>
                    }
                )
            }
        </React.Fragment>
    }

    domDidChange() {
        super.domDidChange();
        this.valueChange();
    }
}