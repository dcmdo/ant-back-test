import echarts from 'echarts/lib/echarts';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/title';
import 'echarts/lib/component/legend';
import React from 'react';
import UIComponent from 'UIComponent';

//@option
export default class ECharts extends UIComponent{
    get className(){
        let className = super.className;
        return className?className:"default-echarts";
    }
    domMount(){
        super.domMount();
        this.myChart = echarts.init(this.refs.parent);
        this.myChart.setOption(this.props.option);
    }
}