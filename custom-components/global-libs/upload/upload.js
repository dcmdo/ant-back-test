import Plupload from 'plupload';
import TypesCheck from 'TypesCheck'
import 'stop-browser-default-drop';

/**
 * 给文件添加后缀
 * @param file {File}
 */
const addExtension = (file)=>{
    if(file===undefined){
        return;
    }
    let name = file.name;
    if(name!==""){
        file.extension = name.substring(name.lastIndexOf('.')+1).toLowerCase();
    }else{
        file.extension = undefined;
    }
};

/**
 * 类型过滤器是否包含特定文件类型
 * @param typeFilter
 * @param file
 * @returns {boolean}
 */
const containExtension = (typeFilter,file)=>{
    if(typeFilter===undefined){
        return true;
    }
    return typeFilter.indexOf(file.extension)!==-1;
};

/**
 * option:{
 *      browse_button 必填
 *      container 必填
 *      drop_element 选填 拖拽添加文件的区域
 *      unique_names 生成唯一name
 *      url 选填或在onBeforeUpload方法中使用 upload.setOption()添加
 *      chunk_size 选填 未添加时默认不分片上传 "10mb"
 *      max_file_size 选填 未添加时默认‘2048mb’
 *      multi_selection 是否支持多选 默认为false
 *      typeFilter 选填，可上传的文件类型,不添加时可上传任意类型文件 ["jpg","gif"]
 *      maxCount  选填，最大文件数，一次性可上传的最大文件数 默认无限制
 * }
 * onFilesAdded:(uploader,files,success)=>{}
 * onFilesRemoved:(uploader,files)=>{}
 * onBeforeUpload:(uploader,file)=>{}
 * onUploadProgress:(uploader,file)
 * onFileUploaded:(uploader,file,result)=>{}
 * onUploadComplete:(uploader,files)=>{}
 * onError:(uploader,error)=>{}
 */
export default class Upload{
    constructor(option,onFilesAdded,onFilesRemoved,onBeforeUpload,onUploadProgress,onFileUploaded,onUploadComplete,onError){
        if(!option){
            console.error("未添加 option属性！");
            return;
        }
        this.declareVars(onFilesAdded,onFilesRemoved,onBeforeUpload,onUploadProgress,onFileUploaded,onUploadComplete,onError);
        this.initUploader(option);
    }
    //----------------------------------------内部属性变量----------------------------------------
    declareVars(onFilesAdded,onFilesRemoved,onBeforeUpload,onUploadProgress,onFileUploaded,onUploadComplete,onError){
        //----------私有----------
        //事件变量
        this._onFilesAdded = onFilesAdded;
        this._onFilesRemoved = onFilesRemoved;
        this._onBeforeUpload = onBeforeUpload;
        this._onUploadProgress = onUploadProgress;
        this._onFileUploaded = onFileUploaded;
        this._onUploadComplete = onUploadComplete;
        this._onError = onError;

        //----------共有----------
        this.uploader;
    }

    initUploader(option){
        //隐藏container对象
        option.container.style.display = "none";
        //默认为html5上传
        option.runtimes = 'html5';
        //错误重传次数
        option.max_retries = 3;
        //设置文件类型及最大上传文件大小
        option.filters = {};
        option.filters.max_file_size = option.max_file_size || "2048mb";
        delete option.max_file_size;
        if(option.typeFilter!==undefined){
            this.typeFilter = option.typeFilter;
            let mime_types = [{
                title:"限定类型",
                extensions:option.typeFilter.toString()
            }];
            option.filters.mime_types = mime_types;
            delete option.typeFilter;
        }
        //上传最大文件数
        if(option.maxCount!==undefined){
            this.maxCount = option.maxCount;
            delete option.maxCount;
        }
        option.init = {
            FilesAdded: (uploader,files)=>{
                let _files = [];
                files.forEach((item)=>{
                    addExtension(item);
                    if(containExtension(this.typeFilter,item)){
                        _files.push(item);
                    }else{
                        this.uploader.removeFile(item,false);
                    }
                });
                if(this.maxCount!==undefined){
                    if(this.files.length>this.maxCount){
                        let removeCount = this.files.length-this.maxCount;
                        this.splice(0,removeCount,false);
                        if(_files.length>this.maxCount){
                            removeCount = _files.length - this.maxCount;
                            _files.splice(0,removeCount);
                        }
                    }
                }
                if(TypesCheck.isFunction(this._onFilesAdded)){
                    this._onFilesAdded(uploader,_files,_files.length>0);
                }
            },
            FilesRemoved:(uploader,files)=>{
                if(this.triggerRemoveEvent){
                    if(TypesCheck.isFunction(this._onFilesRemoved)){
                        this._onFilesRemoved(uploader,files);
                    }
                }else{
                    this.triggerRemoveEvent = true;
                }
            },
            BeforeUpload:(uploader,file)=>{
                if(TypesCheck.isFunction(this._onBeforeUpload)){
                    this._onBeforeUpload(uploader,file);
                }
            },
            UploadProgress:(uploader,file)=>{
                if(TypesCheck.isFunction(this._onUploadProgress)){
                    this._onUploadProgress(uploader,file);
                }
            },
            FileUploaded: (uploader,file,info)=>{
                if(TypesCheck.isFunction(this._onFileUploaded)){
                    this._onFileUploaded(uploader,file,info);
                }
            },
            UploadComplete:(uploader,files)=>{
                if(TypesCheck.isFunction(this._onUploadComplete)){
                    this._onUploadComplete(uploader,files);
                }
            },
            Error: (uploader,err)=>{
                if(TypesCheck.isFunction(this._onError)){
                    console.log("上传失败，错误信息为："+err.message);
                    this._onError(uploader,err);
                }
            }
        };
        this.uploader = new Plupload.Uploader(option);
        this.uploader.init();
    }

    //----------------------------------------对外属性方法----------------------------------------
    setOption(option){
        this.uploader.setOption(option);
    }
    get files(){
        return this.uploader.files;
    }
    get total(){
        return this.uploader.total;
    }
    start(){
        this.uploader.start();
    }
    stop(){
        this.uploader.stop();
    }
    disableBrowse(disable){
        this.uploader.disableBrowse(disable);
    }
    removeFile(file,triggerEvent=true){
        this.triggerRemoveEvent = triggerEvent;
        this.uploader.removeFile(file);
    }
    splice(start,length,triggerEvent=true){
        this.triggerRemoveEvent = triggerEvent;
        this.uploader.splice(start,length);
    }
    clearFiles(){
        let files = this.files;
        if(files!==undefined){
            this.splice(0,files.length);
        }
    }
    static get Plupload(){
        return Plupload;
    }
}
