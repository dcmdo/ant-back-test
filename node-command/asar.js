var fs = require('fs');
var exec = require('child_process').exec;
var Path = require('path');
var dns = require('dns');
node_config = {
    root_path:__dirname,
    temp_path:Path.join(__dirname,"resource/temp"),
    output_path:Path.join(__dirname,"resource/output"),
    record_path:Path.join(__dirname,"userinfo.txt"),
    download_config_path:Path.join(__dirname,"downloadInfo.txt"),
    tool_version_config_path:Path.join(__dirname,"toolversion.txt"),
    operation_record_path:Path.join(__dirname,"operation.txt"),
    tool_version_save_path:Path.join(__dirname,"package.zip"),
    save_path:Path.join(__dirname,"resource"),
    ipconfig_path:Path.join(__dirname,"iplocation.json"),
    temp_path:Path.join(__dirname,"temp"),
    test_path:Path.join(__dirname,"/resource/304.asar")
};
node_fns = {};
//……………………删除文件夹…………………………………………
node_fns.deleteFolder = function(path) {
    let files = [];
    if( fs.existsSync(path) ) {
        files = fs.readdirSync(path);
        files.forEach(function(file,index){
            var curPath = Path.resolve(path,file);
            if(fs.statSync(curPath).isDirectory()) { // recurse
                node_fns.deleteFolder(curPath);
            } else { // delete file
                try {
                    fs.unlinkSync(curPath);
                }catch (e) {
                    console.log("删除文件失败！",e)
                }
            }
        });
        try {
            fs.rmdirSync(path);
        }catch (e) {
            console.log("删除文件夹失败！",e)
        }

    }
};
//……………………清空文件夹…………………………………………
node_fns.clearFolder = function(path,isRoot) {
    let files = [];
    if( fs.existsSync(path) ) {
        files = fs.readdirSync(path);
        files.forEach(function(file,index){
            var curPath =Path.resolve(path,file);
            if(fs.statSync(curPath).isDirectory()) { // recurse
                node_fns.clearFolder(curPath,false);
            } else { // delete file
                try{
                    fs.unlinkSync(curPath);
                }catch (e) {
                    console.log("删除文件失败！",e)
                }
            }
        });
        if(!isRoot){
            try{
                fs.rmdirSync(path);
            }catch (e) {
                console.log("删除文件夹失败！",e)
            }
        }

    }
};
//……………………拷贝文件夹…………………………………………
node_fns.copyFolder=function(from, to) {        // 复制文件夹到指定目录
    let files = [];
    if (fs.existsSync(to)) {           // 文件是否存在 如果不存在则创建
        files = fs.readdirSync(from);
        files.forEach(function (file, index) {
            let targetPath =Path.resolve(to,file);
            let fromPath=Path.resolve(from,file);
            if (fs.statSync(fromPath).isDirectory()) {
                node_fns.copyFolder(fromPath,targetPath);
            } else {
                try {
                    fs.writeFileSync(targetPath, fs.readFileSync(fromPath));
                    console.log("write成功！");
                }catch (e) {
                    try{
                        console.log("write失败！",e)
                        fs.renameSync(targetPath,targetPath+".obj");
                        fs.writeFileSync(targetPath, fs.readFileSync(fromPath));
                    }catch (e) {
                        console.log("write再次失败！",e)
                    }
                }
            }
        });
    } else {
        fs.mkdirSync(to);
        node_fns.copyFolder(from,to);
    }
};
//……………………文件是否存在…………………………………………
node_fns.isExistFolder= function(path,_callback){
    fs.exists(path,_callback);
};
//……………………判断文件是否存在…………………………………………
node_fns.exist = function(path) {
    process.noAsar = true;
    return fs.existsSync(path);
};
//……………………删除文件…………………………………………
node_fns.deleteFile = function(path) {
    if(node_fns.exist(path)){
        console.log("文件存在！")
        try {
            process.noAsar = true;
            fs.unlinkSync(path);
            console.log("删除成功！");
        }catch (e) {
            console.log("删除失败！",e)
        }
    }else{
        console.log("文件不存在！")
    }
};
//……………………读取文件夹…………………………………………
node_fns.readFolders = function(path) {
    var files = [];
    if( fs.existsSync(path) ) {
        files = fs.readdirSync(path);
        return files;
    }else{
        console.log("路径不存在！");
    }
};
//……………………重组工具资源…………………………………………
//callback:-1 无需更新 0开始更新  1更新失败 2更新成功
node_fns.reForm = function(callback){
    var toolPaths = [];
    function getToolsDir (path,parent){
        var files = [];
        if( fs.existsSync(path) ) {
            files = fs.readdirSync(path);
            files.forEach(function(file,index){
                var curPath = path + "/" + file;
                if(fs.statSync(curPath).isDirectory()) { // recurse
                    if(parent==="tools"){
                        toolPaths.push({tool:file,path:curPath});
                    }else{
                        getToolsDir(curPath,file);
                    }
                }
            });
        }
    }
    getToolsDir(node_config.subjects_path);
    if(toolPaths.length>0){
        callback(0,"开始重组工具结构,可能需要一些时间,请勿以任何形式中断该操作！");
        setTimeout(()=>{
            var errorList = [];
            toolPaths.forEach(function (item,index) {
                var targetPath = Path.resolve(node_config.tools_path,item.tool);
                //……………………如果存在…………………………………………
                if(fs.existsSync(Path.resolve(targetPath))){
                    try{node_fns.deleteFolder(item.path);}catch (ex){
                        console.log(ex,"删除文件夹");
                    }
                }else{
                    //……………………如果不存在…………………………………………
                    try {
                        fs.renameSync(Path.resolve(__dirname,item.path),targetPath);
                    }catch (ex){
                        errorList.push(item);
                    }
                }
            });
            if(errorList.length>0){
                callback(1,"有部分工具重组失败，稍后请重启程序重新重组！");
            }else{
                callback(2,"工具重组成功！请稍后！");
            }
        },2000);
    }else{
        callback(-1);
    }
};
//……………………检测网络是否连接…………………………………………
node_fns.checkNetwork = function (callback) {
    dns.resolve('www.baidu.com',function (err) {
        if(err){
            callback(0);
        }else{
            callback(1);
        }
    })
};
//……………………写入本地文件…………………………………………
node_fns.writeFile = fs.writeFileSync;
//……………………读取本地文件…………………………………………
node_fns.readFile = fs.readFileSync;
//……………………创建文件夹…………………………………………
node_fns.createFloder=fs.mkdirSync;
//……………………重命名…………………………………………
node_fns.rename=fs.renameSync;
//……………………拷贝文件…………………………………………
node_fns.copyFile=function(src, dst) {
    fs.writeFileSync(dst, fs.readFileSync(src));
};




/*let tool_version_config_path=Path.join(__dirname,"toolversion.txt");
let token=Jwt.sign({version:"1.2.3"},'虚拟仿真实验室');
node_fns.writeFile(tool_version_config_path,token);
let str=node_fns.readFile(tool_version_config_path,'utf8');
let obj=Jwt.verify(str,"虚拟仿真实验室")
console.log(obj);*/
let folders="F:/webframe/coolplay-web-framework/apps/国网商旅v2.0/builds/images";


function readFileList(dir,beforePath, filesList = []) {
    const files = fs.readdirSync(dir);
    files.forEach((item, index) => {
        let fullPath = Path.join(dir, item);
        let addPath=Path.join(beforePath, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            readFileList(fullPath,addPath, filesList);  //递归读取文件
        } else {
            let str="./"+addPath.replace(/\\/g,'/',);
            let obj={href:str,as:"image"};
            filesList.push(obj);
        }
    });
    return filesList;
}

var filesList = [];
readFileList(folders,"./images",filesList);
let strJson=JSON.stringify(filesList);
let config_path=Path.join(__dirname,"testimage.json");
node_fns.writeFile(config_path,strJson);



