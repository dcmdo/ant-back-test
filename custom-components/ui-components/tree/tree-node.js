import React from 'react';
import UIComponent from 'UIComponent';
import Toggle from 'Toggle';
import StateSelect from 'StateSelect';

/**
 * isSelected
 * canSelect
 * canCancel
 * onValueChange:(isSelected,isManual)=>{}
 */
class NodeContent extends UIComponent{
    get className() {
        return this.isSelected?"node-content node-content-selected":"node-content";
    }
    get controlledProps() {
        return [...super.controlledProps,"isSelected"];
    }

    get style() {
        let addtionStyle = this.canSelect?{}:{pointerEvents:"none"};
        return {...super.style,...addtionStyle};
    }

    //-------------------------------------------------内部属性方法-------------------------------------------------
    declareVars(){
        super.declareVars();
        this.isManual = false;
        this._oldIsSelected;//旧的选择值，用以判断isSelected值是否更改
    }
    get canCancel(){
        return this.props.canCancel;
    }
    get canSelect(){
        return this.props.canSelect;
    }
    //-------------------------------------------------对外属性-------------------------------------------------
    get isSelected(){
        return this.state.isSelected;
    }
    set isSelected(isSelected){
        this.setState({isSelected:isSelected});
    }
    //-------------------------------------------------生命周期-------------------------------------------------
    domDidChange() {
        super.domDidChange();
        if(this.isSelected!==this._oldIsSelected){
            this._oldIsSelected = this.isSelected;
            this.props.onValueChange(this.isSelected,this.isManual);
        }
        this.isManual = false;
    }
    //-------------------------------------------------交互事件-------------------------------------------------
    pointClick(e) {
        super.pointClick(e);
        if(this.canSelect){
            this.isManual = true;
            if(this.isSelected){
                if(this.canCancel){
                    this.isSelected = false;
                }
            }else{
                this.isSelected = true;
            }
        }
    }
}
class SubTreeNode extends UIComponent{
    get className() {
        return "sub-tree-node";
    }
    get isRegisterEvent() {
        return false;
    }
}
/**
 * isParent
 * expansion:{
    props:{},toggleProps
    canExpansion:true or false,
    isExpansion:true or false,
    onExpansion:(treeNode,isExpansion)=>{}
  }
 * checks:[
    {
        props:{},stateIndexProps
        canCheck:true or false,
        isChecked:true or false,
        onCheck:(checkedSet)=>{}
     }
  ]
 * icon
 * nodeContent:component
 * selection:{
     canSelect:true or fase,
     isSelected:true or false,
     canCancel:true or false
     onSelect:(removeData,addData)=>{}
  }
 * childDatas:[]
 //以下属性被动添加无需手动赋值
 * tree
 * path
 * data
 */
export default class TreeNode extends UIComponent{
    get className() {
        let className = super.className;
        return className?className:"tree-node";
    }
    get isRegisterEvent() {
        return false;
    }
    get controlledProps() {
        return [...super.controlledProps,"data","childDatas"];
    }

    //-------------------------------------------------内部属性方法-------------------------------------------------
    declareVars(){
        super.declareVars();
        this._expansionComponent;//展开收起组件实例
        this._checkComponents=[];//勾选组件实例
        this._subTreeNodeComponent;//子树组件实例
        this._nodeContentComponent;//节点内容组件实例
        this._globalVars = {};//全局作用域的变量集合，避免局部访问时的变量不更新问题
    }
    //树节点
    get tree(){
        return this.props.tree;
    }
    //----------展开相关属性----------
    //展开属性
    get expansion(){
        return this.props.expansion;
    }
    //是否可展开
    get canExpansion(){
        return this.expansion.canExpansion;
    }
    //展开事件
    get onExpansion(){
        return this.expansion.onExpansion;
    }
    //----------勾选相关----------
    get checks(){
        return this.props.checks;
    }
    get checkCount(){
        return this.checks.length;
    }
    getCheckProps(checkIndex){
        return this.checks[checkIndex].props;
    }
    getCanCheck(checkIndex){
        return this.checks[checkIndex].canCheck;
    }
    getOnCheck(checkIndex){
        return this.checks[checkIndex].onCheck;
    }
    //----------选择相关----------
    get selection(){
        return this.props.selection;
    }
    get canSelect(){
        return this.selection.canSelect;
    }
    get canCancelSelect(){
        return this.selection.canCancel;
    }
    get onSelect(){
        return this.selection.onSelect;
    }
    //-------------------------------------------------对外属性及方法-------------------------------------------------
    get isParent(){
        return this.props.isParent;
    }
    get path(){
        return this.props.path;
    }
    //----------数据相关----------
    get data(){
        return this.state.data;
    }
    set data(data){
        this.setState({data:data});
    }
    get childDatas(){
        return this.state.childDatas;
    }
    set childDatas(childDatas){
        this.setState({childDatas:childDatas});
    }
    //----------展开相关----------
    get isExpansion(){
        return this.expansion.isExpansion;
    }
    set isExpansion(isExpansion){
        this.expansion.isExpansion = isTrue;
        this.data._treeExtra.isExpansion = isTrue;
        this._expansionComponent.isTrue = isExpansion;
    }
    //----------勾选相关----------
    getIsChecked(checkIndex){
        return this.checks[checkIndex].isChecked;
    }
    setIsChecked(checkIndex,isChecked,canHierarchy=true){
        this._checkComponents[checkIndex]._canHierarchy = canHierarchy;
        //第一时间设置勾选值有助于对被动选择时数值的获取
        this.checks[checkIndex].isChecked = isChecked===true?true:false;
        this.data._treeExtra.isCheckeds[checkIndex] = isChecked===true?true:false;
        if(this.isParent){
            if(isChecked!==true && isChecked!==false){
                return this._checkComponents[checkIndex].index = 3;
            }
        }
        this._checkComponents[checkIndex].index = isChecked?2:1;
    }
    //----------选择相关----------
    get isSelected(){
        return this.selection.isSelected;
    }
    set isSelected(isSelected){
        //第一时间设置选择
        this.selection.isSelected = isSelected;
        this.data._treeExtra.isSelected = isSelected;
        this._nodeContentComponent.isSelected = isSelected;
    }
    //-------------------------------------------------组件结构及生命周期-------------------------------------------------
    //----------nodeRender相关组件----------
    //展开组件
    get expasionElement(){
        if(this.isParent){
            return <Toggle className={"expansion"} trueChild={this.tree.expansionTrue}
                           falseChild={this.tree.expansionFalse}
                           {...this.expansion.props}
                           isTrue={this.isExpansion}
                           isEnable={this.canExpansion}
                           callbackComponent={
                               UIComponent.fns.constObject(this,"_expansion_callback",
                                   (component)=>{
                                       this._expansionComponent = component;
                                   })
                           }
                           onValueChange={
                               UIComponent.fns.constObject(this,"_expansion_value_change",
                                   (tagName,isTrue,isManual)=>{
                                       if(isManual){
                                           this.expansion.isExpansion = isTrue;
                                           this.data._treeExtra.isExpansion = isTrue;
                                       }
                                       this._subTreeNodeComponent.isVisible = isTrue;
                                       if(this.onExpansion){
                                           this.onExpansion(this,isTrue);
                                       }
                                   })
                           }
            />
        }
        return null;
    }
    //勾选组件
    get checkElements(){
        let checkCount = this.checkCount;
        let checkElements = [];
        for(let i = 0;i<checkCount;i++){
            let canCheck = this.getCanCheck(i);
            let isChecked = this.getIsChecked(i);
            let onCheck = this.getOnCheck(i);
            //刷新全局变量
            let checkVars = {};
            this._globalVars["checkVars_"+i] = checkVars;
            checkVars.onCheck = onCheck;
            checkVars.treeNode = this;
            checkElements.push(<StateSelect
                key={"check_"+i} className={"check"}
                stateRender={this.tree.defaultStateRender}
                {...this.getCheckProps(i)}
                tagName={i}
                stateRule={this.tree.defaultStateRule}
                isEnable={canCheck}
                stateCount={this.isParent?3:2}
                index={isChecked?2:1}
                callbackComponent={
                    UIComponent.fns.constObject(this,"_check_callback",
                        (component)=>{
                            let checkVars = this._globalVars["checkVars_"+component.tagName];
                            component.treeNode = checkVars.treeNode;
                            component.onCheck = checkVars.onCheck;
                            component.isInit = true;
                            this._checkComponents[component.tagName] = component;
                            if(component.treeNode.isParent){
                                this.tree.addCheckParentTreeNode(component.tagName,component.treeNode);
                            }else{
                                this.tree.addCheckChildTreeNode(component.tagName,component.treeNode);
                            }
                        })
                }
                onDestroy={
                    UIComponent.fns.constObject(this,"_check_destroy",
                        (component)=>{
                            if(component.treeNode.isParent){
                                this.tree.removeCheckParentTreeNode(component.tagName,component.treeNode);
                            }else{
                                this.tree.removeCheckChildTreeNode(component.tagName,component.treeNode);
                                if(component.index===2){
                                    component.treeNode.checks[component.tagName].isChecked = false;
                                    component.treeNode.data._treeExtra.isCheckeds[component.tagName] = false;
                                    this.tree.checkChild(component.tagName,component.onCheck,false,component.treeNode,true);
                                }else{
                                    this.tree.decideParentCheck(component.tagName);
                                }
                            }
                        })
                }
                onValueChange={
                    UIComponent.fns.constObject(this,"_check_value_change",
                        (tagName,index,isManual,component)=>{
                            let isChecked = index===2;
                            if(isManual){
                                component.treeNode.checks[tagName].isChecked = isChecked;
                                component.treeNode.data._treeExtra.isCheckeds[tagName] = isChecked;
                            }
                            if(index!==3){
                                if(component.isInit){
                                    component.isInit = false;
                                    if(!isChecked){
                                        return;
                                    }
                                }
                                let canHierarchy = component._canHierarchy===false?false:true;
                                delete component._canHierarchy;
                                if(component.treeNode.isParent){
                                    this.tree.checkParent(tagName,component.onCheck,isChecked,component.treeNode,canHierarchy);
                                }else{
                                    this.tree.checkChild(tagName,component.onCheck,isChecked,component.treeNode,canHierarchy);
                                }
                            }
                        })
                }
            />)
        }
        return checkElements;
    }
    //图标组件
    get icon(){
        return this.props.icon;
    }
    //node内容显示
    get nodeContent(){
        return <NodeContent isSelected={this.isSelected} canCancel={this.canCancelSelect}
                            canSelect={this.canSelect}
                            callbackComponent={
                                UIComponent.fns.constObject(this,"_node_content_callback",
                                    (component)=>{
                                        this._nodeContentComponent = component;
                                    })
                            }
                            onValueChange={
                                UIComponent.fns.constObject(this,"_node_content_value_change",
                                    (isSelected,isManual)=>{
                                        if(isManual){
                                            this.selection.isSelected = isSelected;
                                            this.data._treeExtra.isSelected = isSelected;
                                        }
                                        this.tree.treeNodeSelect(this,isSelected);
                                    })
                            }
        >
            {this.props.nodeContent}
        </NodeContent>
    }
    //nodeRender
    get nodeRender(){
        return <div className={"node-render"}>
            {this.expasionElement}
            {this.checkElements}
            {this.icon}
            {this.nodeContent}
        </div>;
    }
    //----------subTreeNode组件相关----------
    get subTreeNode(){
        let childDatas = this.childDatas;
        if(childDatas){
            let childTreeNodes = [];
            childDatas.forEach((data,index)=>{
                childTreeNodes.push(this.tree.initTreeNode(data,this.path,index));
            });
            return <SubTreeNode
                isVisible={this.expansion}
                callbackComponent={
                    UIComponent.fns.constObject(this,"_sub_tree_node",
                        (component)=>{
                            this._subTreeNodeComponent = component;
                        })
                }
            >
                {childTreeNodes}
            </SubTreeNode>
        }
        return null;
    }
    //----------渲染nodeRender与subTree----------
    getChildren() {
        return <React.Fragment>
            {this.nodeRender}
            {this.subTreeNode}
        </React.Fragment>
    }
}