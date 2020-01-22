import React from 'react';
import UIComponent from 'UIComponent';
import Button from 'Button';
import ProgressBar from 'ProgressBar';
import './default-style/singler-uploader.scss';
import '../default-style/svg-sprite/default.svg';
import Upload from 'Upload';
import typeFilter from './type-filter';
import fileImage from './file-image';

/**
 * option{
 *      url 选填或在onBeforeUpload方法中使用 upload.setOption()添加
 *      chunk_size 选填 未添加时默认不分片上传
 *      max_file_size 选填 未添加时默认‘2048mb’
 *      typeFilter 选填，可上传的文件类型,不添加时可上传任意类型文件 ["jpg","gif"]
 * }
 * onFilesAdded {Function} (uploader,files)=>{}
 * onFilesRemoved {Function} (uploader,files)=>{}
 * onBeforeUpload {Function} (uploader,file)=>{}
 * onUploadProgress {Function} (uploader,file)=>{}
 * onFileUploaded {Function} (uploader,file,result)=>{}
 * onUploadComplete {Function} (uploader,files)=>{}
 * onError {Function} (uploader,error)=>{}
 */
export default class SingleUploader extends UIComponent{
    awake(){
        super.awake();
        //错误判断
        if(this.props.option===undefined){
            this.option = {};
        }else{
            this.option = UIComponent.fns.ObjectFns.clone(this.props.option);
        }
    }
    get className(){
        let className = super.className;
        return className?className:"default-single-uploader";
    }
    get file(){
        try {return this.upload.files[0];}catch(ex){return undefined;}
    }
    get fileName(){
        return this.file?this.file.name:"";
    }
    get extension(){
        return this.file?this.file.extension:"";
    }
    get fileType(){
        let fileType = undefined;
        let extension = this.extension;
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
    get percent(){
        return this.file?this.file.percent*0.01:0;
    }
    get fileImage(){
        if(UIComponent.fns.TypesCheck.isEmpty(this.file)){
            return fileImage["none"];
        }
        return fileImage[this.fileType];
    }
    get canAddFile(){
        if(this.file===undefined){
            return true;
        }else{
            if(this.file.status === Upload.Plupload.UPLOADING){
                return false;
            }else{
                return true;
            }
        }
    }
    get decideDeleteState(){
        let state = {};
        if(this.file){
            let status = this.file.status;
            state.icon = "cool-icon-30";
            state.canDelete = true;
            if(status === Upload.Plupload.DONE){
                state.icon = "cool-icon-31";
                state.canDelete = false;
            }else if(status===Upload.Plupload.UPLOADING){
                state.icon = "cool-icon-19";
                state.canDelete = false;
            }
        }
        return state;
    }
    getChildren(){
        return(
            [
                <div ref="container" key='container' style={{pointerEvents:'none'}}></div>,
                <svg className="preview" key='show' viewBox="0 0 5 6" preserveAspectRatio="none" width="95%">
                    <use xlinkHref={"fonts/default.svg#"+this.fileImage}/>
                </svg>,
                <div ref='drop_area' key="drop-area" style={{pointerEvents:this.canAddFile?"auto":"none",position:'absolute',width:'100%',height:'100%'}}
                     onDragEnter={()=>{
                         if(this.hoverClass!==undefined)
                             this.setState({isHover:true});
                     }}
                     onDragLeave={()=>{
                         if(this.hoverClass!==undefined)
                             this.setState({isHover:false});
                     }}
                >
                    <Button className="remove" extraClass={this.decideDeleteState.icon} isRender={this.file!==undefined}
                            onClick={()=>{
                                if(this.decideDeleteState.canDelete){
                                    this.upload.clearFiles();
                                }
                            }}/>
                    {this.file!==undefined?<span className="fileName" style={{pointerEvents:'none'}}>{this.fileName}</span>:null}
                    <ProgressBar ref="progress" className="progress" style={{pointerEvents:'none'}} isRender={this.file!==undefined} progress={this.percent}/>
                </div>
            ]
        );
    }
    domMount(){
        super.domMount();
        let drop_area = UIComponent.fns.getReactDOM(this.refs.drop_area);
        this.option.browse_button = drop_area;
        this.option.drop_element = drop_area;
        this.option.container = UIComponent.fns.getReactDOM(this.refs.container);
        this.option.multi_selection = false;
        this.upload = new Upload(this.option,
            (uploader,files,success)=>{//添加文件
                if(success){
                    if(this.upload.files.length>1){
                        this.upload.removeFile(this.file);
                    }
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
