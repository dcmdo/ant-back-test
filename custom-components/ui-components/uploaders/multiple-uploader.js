import React from 'react';
import UIComponent from 'UIComponent';
import Button from 'Button';
import Upload from 'Upload';
import typeFilter from './type-filter';
import fileImage from './file-image';
import CoolMath from 'CoolMath';
import './default-style/multiple-uploader.scss';
import '../default-style/svg-sprite/default.svg';

/**
 * option{
 *     url 选填或在onBeforeUpload方法中使用 upload.setOption()添加
 *     chunk_size 选填 未添加时默认不分片上传
 *     max_file_size 选填 未添加时默认‘2048mb’
 *     typeFilter 选填，可上传的文件类型,不添加时可上传任意类型文件 ["jpg","gif"]
 *     maxCount  选填，最大文件数，一次性可上传的最大文件数 默认无限制
 * }
 * onFilesAdded {Function} (uploader,files)=>{}
 * onFilesRemoved {Function} (uploader,files)=>{}
 * onBeforeUpload {Function} (uploader,file)=>{}
 * onUploadProgress {Function} (uploader,file)=>{}
 * onFileUploaded {Function} (uploader,file,result)=>{}
 * onUploadComplete {Function} (uploader,files)=>{}
 * onError {Function} (uploader,error)=>{}
 */
export default class MultipleUploader extends UIComponent{
    awake(){
        super.awake();
        //错误判断
        if(this.props.option===undefined){
            this.option = {};
        }else{
            this.option = UIComponent.fns.ObjectFns.clone(this.props.option);
        }
        //最大文件数
        this.maxCount = this.option.maxCount;
    }
    get className(){
        let className = super.className;
        return className?className:"default-multiple-uploader";
    }
    get files(){
        if(this.upload===undefined)
            return [];
        return this.upload.files!==undefined?this.upload.files:[];
    }
    fileType(file){
        let fileType = undefined;
        let extension = file.extension;
        if(extension!==undefined){
            for(let k in typeFilter){
                let extensions = typeFilter[k].extensions;
                if(extensions.indexOf(extension)!==-1){
                    fileType = k;
                    break;
                }
            }
        }
        return fileType;
    }
    getImage(file){
        if(UIComponent.fns.TypesCheck.isEmpty(this.files)){
            return fileImage["none"];
        }
        return fileImage[this.fileType(file)];
    }
    get totalInfo(){
        if(this.upload===undefined)
            return "";
        else{
            let total = this.upload.total;
            if(total.size===0)
                return "";
            return  "上传进度:"+Math.round((total.loaded/total.size)*100)+"%    文件大小:"+CoolMath.fileSizeFormat(total.size);
        }
    }
    get canUpload(){
        let canUpload = false;
        this.files.some((item)=>{
            if(item.status === Upload.Plupload.QUEUED || item.status === Upload.Plupload.FAILED){
                canUpload = true;
                return true;
            }
        });
        return canUpload;
    }
    get canAddFile(){
        if(this.maxCount===undefined){
            return true;
        }else{
            return this.files.length<this.maxCount;
        }
    }
    initFileList(){
        let fileList = [];
        this.files.forEach((item)=>{
            let status = item.status;
            let canDelete = true;
            let icon = "cool-icon-30";
            if(status === Upload.Plupload.DONE){
                icon = "cool-icon-31";
                canDelete = false;
            }else if(status===Upload.Plupload.UPLOADING){
                icon = "cool-icon-19";
                canDelete = false;
            }
            fileList.push(
                <div className="file-item" key={item.id}>
                    <svg className="preview" key='show' viewBox="0 0 5 6" preserveAspectRatio="none" width="95%">
                        <use xlinkHref={"fonts/default.svg#"+this.getImage(item)}/>
                    </svg>
                    <Button className="remove" extraClass={icon}
                            onClick={()=>{
                                if(canDelete){
                                    this.upload.removeFile(item);
                                }
                            }}
                    />
                    <span className="fileName" style={{pointerEvents:'none'}}>{item.name}</span>
                </div>
            );
        });
        return fileList;
    }
    getChildren(){
        return[
            <div ref="container" key="container"/>,
            <div className="drop-area" key="drop-area" ref="drop_area">
                <span className="tip-text">拖放文件区</span>
                <div className="files-list-area">
                    {this.initFileList()}
                </div>
            </div>,
            <div className="tool-bar" key="tool-bar">
                <div className="buttons">
                    <Button className="button" ref="add_file" isEnable={this.canAddFile}>添加文件</Button>
                    <Button className="button" isEnable={this.canUpload}
                            onClick={()=>{
                                this.upload.start();
                            }}
                    >开始上传</Button>
                </div>
                <div className="info">{this.totalInfo}</div>
            </div>
        ];
    }
    domMount(){
        super.domMount();
        let drop_area = UIComponent.fns.getReactDOM(this.refs.drop_area);
        let add_file = UIComponent.fns.getReactDOM(this.refs.add_file);
        this.option.browse_button = add_file;
        this.option.drop_element = drop_area;
        this.option.container = UIComponent.fns.getReactDOM(this.refs.container);
        this.option.multi_selection = true;
        this.upload = new Upload(this.option,
            (uploader,files,success)=>{//添加文件
                if(success){
                    if(this.props.onFilesAdded){
                        this.props.onFilesAdded(uploader,files);
                    }
                }
                this.forceUpdate();
            },
            (uploader,files)=>{//删除文件
                if(this.props.onFilesRemoved){
                    this.props.onFilesRemoved(uploader,files);
                }
                this.forceUpdate();
            },
            (uploader,file)=>{//上传之前
                if(this.props.onBeforeUpload){
                    this.props.onBeforeUpload(uploader,file);
                }
            },
            (uploader,file)=>{//上传进度更新
                if(this.props.onUploadProgress){
                    this.props.onUploadProgress(uploader,file);
                }
                this.forceUpdate();
            },
            (uploader,file,result)=>{//文件上传成功
                if(this.props.onFileUploaded){
                    this.props.onFileUploaded(uploader,file,result);
                }
                this.forceUpdate();
            },
            (uploader,files)=>{//文件队列上传成功
                if(this.props.onUploadComplete){
                    this.props.onUploadComplete(uploader,files);
                }
                this.forceUpdate();
            },
            (uploader,error)=>{//出错
                if(this.props.onError){
                    this.props.onError(uploader,error);
                }
                this.forceUpdate();
            }
        );
    }
}