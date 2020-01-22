import React from 'react';
import UIComponent from 'UIComponent';
import Increment from 'Increment';
import TreeNode from './tree-node';
import './default-style/tree.scss';
//-------------------------------------------------全局默认属性及函数-------------------------------------------------
const defaultTreeNodePropsHandle=(data)=>{
    return {};
};
const defaultExpansionHandle=(data)=>{
    return {};
};
const defaultSelectionHandle=(data)=>{
    return {};
};
const defaultChecksHandle=(data)=>{
    return [];
};
const expansionTrue = <i className={"cool-icon-2"}/>;
const expansionFalse = <i className={"cool-icon-4"}/>;
const defaultStateRender = (index) => {
    switch (index) {
        case 1:
            return null;
        case 2:
            return <i className={"cool-icon-31"}/>;
        case 3:
            return <i className={"cool-icon-33"}/>;
    }
};
const defaultStateRule = (index) => {
    if (index === 1 || index === 3)
        return 2;
    if (index === 2)
        return 1;
};
/**
 * 属性说明
 * datas:[{key:value,...},{key:value,...}]
 * treeNodePropsHandle:(data)=>{
                        return:{
                            isParent:true or false,
                            nodeContent:component,
                            icon:component,
                            childDatas:[]
                            ...其他属性
                        }
                     }
 * expansionPropsHandle:(data)=>{
                    return {
                                props:{},toggleProps
                                canExpansion:true or false,
                                isExpansion:true or false,
                                onExpansion:(treeNode,isExpansion)=>{}
                            }
                }
 * selectionPropsHandle:(data)=>{
                    return {
                        canSelect:true or fase,
                        isSelected:true or false,
                        canCancel:true or false
                        onSelect:(removeData,addData)=>{}
                    }
                }
  //允许多个勾选框
  * checksPropsHandle:(data)=>{
                    return [
                        {
                             props:{},stateIndexProps
                             canCheck:true or false,
                             isChecked:true or false,
                             onCheck:(checkedSet)=>{}
                        }
                    ]
                }
 */
export default class Tree extends UIComponent{
    get className() {
        let className = super.className;
        return className?className:"default-tree";
    }
    get isRegisterEvent() {
        return false;
    }
    get controlledPropsWithClone() {
        return ["datas"];
    }

    //-------------------------------------------------内部属性方法-------------------------------------------------
    //初始化变量
    declareVars(){
        super.declareVars();
        //----------自增模块----------
        this._increment = new Increment();
        //----------树节点集合----------
        this._treeNodeSet = [];
        this._treeParentSet = [];
        //----------勾选相关变量----------
        this._checkParentTreeNodeSet = [];//可勾选的父节点集合
        this._checkChildTreeNodeSet = [];//可勾选的子节点集合
        this._childCheckedTreeNodeSet = [];//当前选中的子节点的集合
        this._lastChildCheckedImmutable = [];//上一次选中的子节点集合的不可变值
        this._childCheckedDelayHandle = UIComponent.fns.throttle((checkIndex,onCheck)=>{
            let Immutable = UIComponent.fns.Immutable;
            let currentCheckedImmutable = Immutable.fromJS(this._childCheckedTreeNodeSet[checkIndex]);
            if(!Immutable.is(this._lastChildCheckedImmutable[checkIndex],currentCheckedImmutable)){
                if(onCheck){
                    let checkedDataSet = [];
                    if(this._childCheckedTreeNodeSet[checkIndex]){
                        this._childCheckedTreeNodeSet[checkIndex].forEach((treeNode)=>{
                            checkedDataSet.push(treeNode.data);
                        })
                    }
                    onCheck(checkedDataSet);
                }
                this._lastChildCheckedImmutable[checkIndex] = currentCheckedImmutable;
            }
        },100,{leading: false});
        //----------选择相关变量----------
        this._selectedTreeNode;//当前选中节点
        this._lastSelectedTreeNode;//上一次选中节点
        this._selectDelayHandle = UIComponent.fns.throttle((onSelect)=>{
            if(this._selectedTreeNode!==this._lastSelectedTreeNode){
                if(onSelect){
                    let removeData = this._lastSelectedTreeNode===undefined?undefined:this._lastSelectedTreeNode.data;
                    let addData = this._selectedTreeNode===undefined?undefined:this._selectedTreeNode.data;
                    if(removeData!==addData){
                        onSelect(removeData,addData);
                    }
                }
                this._lastSelectedTreeNode = this._selectedTreeNode;
            }
        },100,{leading:false});
    }
    //----------treeNode相关函数----------
    get treeNodePropsHandle(){
        return this.props.treeNodePropsHandle? this.props.treeNodePropsHandle:defaultTreeNodePropsHandle;
    }
    treeNodePropsRevise(data,treeNodeProps,parentPath,index){
        //给数据附加额外标识数据
        data._treeExtra = data._treeExtra?data._treeExtra:{};
        //path
        let path = parentPath?parentPath+"-"+index:index+"";
        data._treeExtra.path = path;
        //index
        data._treeExtra.index = index;
        //是否是父节点
        if(treeNodeProps.childDatas){
            treeNodeProps.isParent = true;
        }else{
            treeNodeProps.isParent = treeNodeProps.isParent===true?true:false;
        }
        //附加isParent属性
        data._treeExtra.isParent = treeNodeProps.isParent;
        //----------展开相关----------
        if(treeNodeProps.isParent){
            treeNodeProps.expansion = this.expansionPropsHandle(data);
            treeNodeProps.expansion.canExpansion = treeNodeProps.expansion.canExpansion===false?false:true;
            //附加expansion属性
            if(data._treeExtra.isExpansion===undefined){
                treeNodeProps.expansion.isExpansion = treeNodeProps.expansion.isExpansion===true?true:false;
                data._treeExtra.isExpansion = treeNodeProps.expansion.isExpansion;
            }else{
                treeNodeProps.expansion.isExpansion = data._treeExtra.isExpansion;
            }
        }
        //----------勾选相关----------
        treeNodeProps.checks = this.checksPropsHandle(data);
        data._treeExtra.isCheckeds = [];
        for(let i = 0;i<treeNodeProps.checks.length;i++){
            let check = treeNodeProps.checks[i];
            check = check?check:{};
            check.props = check.props?check.props:{};
            check.canCheck = check.canCheck===false?false:true;
            //附加isChecked属性
            if(data._treeExtra.isCheckeds[i]===undefined){
                check.isChecked = check.isChecked===true?true:false;
                data._treeExtra.isCheckeds[i] = check.isChecked;
            }else{
                check.isChecked = data._treeExtra.isCheckeds[i];
            }
        }
        //----------节点选择相关----------
        treeNodeProps.selection = this.selectionPropsHandle(data);
        treeNodeProps.selection.canSelect = treeNodeProps.selection.canSelect===false?false:true;
        treeNodeProps.selection.canCancel = treeNodeProps.selection.canCancel===true?true:false;
        //附加isSelected属性
        if(data._treeExtra.isSelected===undefined){
            treeNodeProps.selection.isSelected = treeNodeProps.selection.isSelected===true?true:false;
            data._treeExtra.isSelected = treeNodeProps.isSelected;
        }else{
            treeNodeProps.selection.isSelected = data._treeExtra.isSelected;
        }
        return treeNodeProps;
    }
    //TreeNode初始化函数
    initTreeNode(data,parentPath,index){
        let treeNodeProps = this.treeNodePropsRevise(data,this.treeNodePropsHandle(data),parentPath,index);
        return <TreeNode key={"tree_node_"+this._increment.increment()} {...treeNodeProps}
                         tree={this} data={data} path={data._treeExtra.path}
                         callbackComponentMount={
                             UIComponent.fns.constObject(this,"_tree_node_callback_mount",
                                 (component)=>{
                                    this.addTreeNode(component);
                                 })
                         }
                         onDestroy={
                             UIComponent.fns.constObject(this,"_tree_node_destroy",
                                 (component)=>{
                                    this.removeTreeNode(component);
                                 })
                         }
        />
    };
    //添加treeNode到集合
    addTreeNode(treeNode){
        let index = this._treeNodeSet.indexOf(treeNode);
        if(index===-1){
            this._treeNodeSet.push(treeNode);
        }
    }
    //移除treeNode
    removeTreeNode(treeNode){
        let index = this._treeNodeSet.indexOf(treeNode);
        if(index!==-1){
            this._treeNodeSet.splice(index,1);
        }
    }
    //----------expansion相关----------
    get expansionPropsHandle(){
        return this.props.expansionPropsHandle?this.props.expansionPropsHandle:defaultExpansionHandle;
    }
    get expansionFalse(){
        return expansionFalse;
    }
    get expansionTrue(){
        return expansionTrue;
    }
    //----------checks相关----------
    get checksPropsHandle(){
        return this.props.checksPropsHandle?this.props.checksPropsHandle:defaultChecksHandle;
    }
    get defaultStateRender(){
        return defaultStateRender;
    }
    get defaultStateRule(){
        return defaultStateRule;
    }
    addCheckParentTreeNode(checkIndex,treeNode){
        if(this._checkParentTreeNodeSet[checkIndex]===undefined){
            this._checkParentTreeNodeSet[checkIndex] = [];
        }
        let parentSet = this._checkParentTreeNodeSet[checkIndex];
        if(parentSet.indexOf(treeNode)===-1){
            parentSet.push(treeNode);
        }
    }
    addCheckChildTreeNode(checkIndex,treeNode){
        if(this._checkChildTreeNodeSet[checkIndex]===undefined){
            this._checkChildTreeNodeSet[checkIndex] = [];
        }
        let childSet = this._checkChildTreeNodeSet[checkIndex];
        if(childSet.indexOf(treeNode)===-1){
            childSet.push(treeNode);
        }
    }
    removeCheckParentTreeNode(checkIndex,treeNode){
        try{
            let parentSet = this._checkParentTreeNodeSet[checkIndex];
            let index = parentSet.indexOf(treeNode);
            if(index!==-1){
                parentSet.splice(index,1);
            }
        }catch (ex) {}
    }
    removeCheckChildTreeNode(checkIndex,treeNode){
        try{
            let childSet = this._checkChildTreeNodeSet[checkIndex];
            let index = childSet.indexOf(treeNode);
            if(index!==-1){
                childSet.splice(index,1);
            }
        }catch (ex) {}
    }
    getChildTreeNodes(checkIndex,treeNode){
        let childTreeNodes = [];
        let childSet = this._checkChildTreeNodeSet[checkIndex];
        if(childSet){
            let path = treeNode.path;
            childSet.forEach((childTreeNode)=>{
                if(childTreeNode.path.startsWith(path)){
                    childTreeNodes.push(childTreeNode);
                }
            })
        }
        return childTreeNodes;
    }
    getChildParentTreeNodes(checkIndex,treeNode){
        let childParentTreeNodes = [];
        let parentSet = this._checkParentTreeNodeSet[checkIndex];
        if(parentSet){
            let path = treeNode.path;
            parentSet.forEach((parentTreeNode)=>{
                if(parentTreeNode.path!==path && parentTreeNode.path.startsWith(path)){
                    childParentTreeNodes.push(parentTreeNode);
                }
            })
        }
        return childParentTreeNodes;
    }
    checkParent(checkIndex,onCheck,isChecked,treeNode,canHierarchy){
        if(!canHierarchy)
            return;
        let childParentTreeNodes = this.getChildParentTreeNodes(checkIndex,treeNode);
        let childTreeNodes = this.getChildTreeNodes(checkIndex,treeNode);
        childParentTreeNodes.forEach((childParentTreeNode)=>{
            if(childParentTreeNode.getCanCheck(checkIndex) && childParentTreeNode.getIsChecked(checkIndex)!==isChecked){
                childParentTreeNode.setIsChecked(checkIndex,isChecked,false);
            }
        });
        childTreeNodes.forEach((childTreeNode)=>{
            if(childTreeNode.getCanCheck(checkIndex) && childTreeNode.getIsChecked(checkIndex)!==isChecked){
                childTreeNode.setIsChecked(checkIndex,isChecked,false);
            }
        });
        this.decideParentCheck(checkIndex);
    }

    checkChild(checkIndex,onCheck,isChecked,treeNode,canHierarchy){
        if(this._childCheckedTreeNodeSet[checkIndex]===undefined){
            this._childCheckedTreeNodeSet[checkIndex] = [];
        }
        let checkedSet = this._childCheckedTreeNodeSet[checkIndex];
        let index = checkedSet.indexOf(treeNode);
        if(isChecked){
            if(index === -1){
                checkedSet.push(treeNode);
                this._childCheckedDelayHandle(checkIndex,onCheck);
            }
        }else{
            if(index !== -1){
                checkedSet.splice(index,1);
                this._childCheckedDelayHandle(checkIndex,onCheck);
            }
        }
        if(canHierarchy){
            this.decideParentCheck(checkIndex);
        }
    }
    decideParentCheck(checkIndex){
        let parentSet = this._checkParentTreeNodeSet[checkIndex];
        if(parentSet){
            parentSet.forEach((parentTreeNode)=>{
                let hasFalse = false;
                let hasTrue = false;
                let childTreeNodes = this.getChildTreeNodes(checkIndex,parentTreeNode);
                if(childTreeNodes){
                    childTreeNodes.forEach((childTreeNode)=>{
                        if(childTreeNode.getCanCheck(checkIndex)){
                            if(childTreeNode.getIsChecked(checkIndex)){
                                hasTrue = true;
                            }else{
                                hasFalse = true;
                            }
                        }
                    });
                    if (hasFalse && hasTrue) {
                        if(parentTreeNode._checkComponents[checkIndex].index!==3){
                            parentTreeNode.setIsChecked(checkIndex);
                        }
                    } else if (hasFalse && !hasTrue) {
                        if(parentTreeNode._checkComponents[checkIndex].index!==1){
                            parentTreeNode.setIsChecked(checkIndex,false,false);
                        }
                    } else if (hasTrue && !hasFalse) {
                        if(parentTreeNode._checkComponents[checkIndex].index!==2){
                            parentTreeNode.setIsChecked(checkIndex,true,false);
                        }
                    }
                }
            });
        }
    }
    //----------select相关----------
    get selectionPropsHandle(){
        return this.props.selectionPropsHandle?this.props.selectionPropsHandle:defaultSelectionHandle;
    }
    treeNodeSelect(treeNode,isSelected){
        if(isSelected){
            if(this._selectedTreeNode!==treeNode){
                try{
                    this._selectedTreeNode.isSelected = false;
                }catch (e) {}
                this._selectedTreeNode = treeNode;
            }
        }else{
            if(this._selectedTreeNode===treeNode){
                this._selectedTreeNode = undefined;
            }
        }
        this._selectDelayHandle(treeNode.onSelect);
    }
    //-------------------------------------------------对外属性-------------------------------------------------
    //----------数据get set----------
    get datas(){
        return this.state.datas?this.state.datas:[];
    }
    set datas(datas){
        return this.setState({datas:datas});
    }
    /**
     * 获取树节点
     * @param selectHandle:(treeNode)=>{ return true or false }
     * return treeNodes:[] or treeNode
     */
    getTreeNodes(selectHandle,isMultiple = false){
        let treeNodes = isMultiple ? [] : null;
        for( let i = 0, len = this._treeNodeSet.length; i<len; i++){
            let _treeNode = this._treeNodeSet[i];
            if(isMultiple){
                treeNodes.push(_treeNode);
            }else{
                if(selectHandle(_treeNode)){
                    return _treeNode;
                }
            }
        }
        return treeNodes;
    }

    getTreeNodeByIndex(index){
        return this._treeNodeSet[index] || null;
    }

    getLastTreeNode(treeNode){
        return this.getTreeNodeByIndex(treeNode.index-1);
    }

    getNextTreeNode(treeNode){
        return this.getTreeNodeByIndex(treeNode.index+1);
    }

    getParentTreeNodes(treeNode){
        let path = treeNode.path;
        let parentNodes = [];
        for( let i = 0, len = this._treeParentSet.length; i<len; i++){
            let _treeNode = this._treeParentSet[i];
            if(_treeNode.path !== path){
                if(path.startsWith(_treeNode.path)){
                    parentNodes.unshift(_treeNode);
                }
            }else{
                break;
            }
        }
        return parentNodes;
    }

    //-------------------------------------------------组件结构-------------------------------------------------
    getChildren() {
        return UIComponent.fns.constElement(this,"_tree_nodes",
            this.propsHasChanged("treeNodePropsHandle","expansionPropsHandle","selectionPropsHandle","checksPropsHandle")||
            this.statesHasChanged("datas"),
            ()=>{
                let datas = this.datas;
                let treeNodes = [];
                datas.forEach((data,index)=>{
                    treeNodes.push(this.initTreeNode(data,"",index));
                });
                return treeNodes;
            });
    }

    domDidChange() {
        super.domDidChange();
        this._treeNodeSet.sort((a,b)=>{
            let aPathes = a.path.split("-");
            let bPathes = b.path.split("-");
            let maxLength = Math.max(aPathes.length,bPathes.length);
            for(let i = 0; i<maxLength; i++){
                let a = aPathes[i] || -1;
                let b = bPathes[i] || -1;
                if(a!==b){
                    return parseInt(a) - parseInt(b);
                }
            }
        });
        this._treeParentSet = [];
        this._treeNodeSet.forEach((_treeNode,index)=>{
            _treeNode.index = index;
            if(_treeNode.isParent){
                this._treeParentSet.push(_treeNode);
            }
        })
    }
}