import * as THREE from 'three';

const getAssetInfo = (url)=>{
    if(url){
        let infos = url.split("/");
        let name;

        if(infos.length>0){
            name = infos[infos.length-1];
        }

        if(name){
            let nameInfos = name.split(".");

            if(nameInfos.length>0){
                let extension = nameInfos[nameInfos.length-1].toLowerCase();
                let type = getType(extension);
                if(type){
                    return  {
                        type: type,
                        name: name,
                        url: url
                    };
                }
            }
        }
    }
    console.error("资源：<"+ url +">不可预加载，请检查资源路径及类型是否合法！");
    return null;
};
const loaderMap = {
    "texture":THREE.TextureLoader,
    "model":THREE.GLTFLoader,
    "audio":THREE.AudioLoader
};
const typeMap = {
    "texture":["jpg","jpeg","svg","png","tif"],
    "model":["glb"],
    "audio":["mp3"]
};
const getType = (extension)=>{
    let type = null;
    for(let k in typeMap){
        let maps = typeMap[k];
        if(maps.indexOf(extension)!==-1){
            type = k;
            break;
        }
    }
    return type;
};
const getLoader = (type)=>{
   return loaderMap[type];
};

//resourceQueue:[url,url]
export default class Loader {
    constructor(urlQueue){
      this.declareVars(urlQueue);
    }
    
    //----------------------------------------内部属性变量----------------------------------------
    declareVars(urlQueue){
        //----------私有----------
        this._urlQueue = urlQueue || [];
        // 版本来自globalHandle的全局配置
        this._versionString = window._version || "v1.0";
        this._loadedUrls = [];
        this._loadedAssets = [];
        this._isLoading = false;

        //----------公有----------
        this.assetSet = {};
    }

    get canLoad(){
        return this._urlQueue.length > 0;
    }

    /**
     * 加载资源具体逻辑
     * @param assetInfo {Object} {name:"" , type:"", url:""}
     * @param onProgress {Function} (name, progress)=>{}
     * @returns {Promise<any>}
     */
    loadHandle(assetInfo,onProgress){
        return new Promise((resolve,reject)=>{
            let loader = getLoader(assetInfo.type);
            loader = new loader();
            loader.load(assetInfo.url+"?"+this._versionString,(asset)=>{
                onProgress(assetInfo.name,1);
                resolve(asset);
            },(event)=>{
                onProgress(assetInfo.name,event.loaded/event.total);
            },(errMessage)=>{
                reject(errMessage);
            })
        })
    }

    loadQueue(onProgress, onLoad){
        let loadedProgresses = [];
        let onProgressHandle = (name)=>{
            let progress = 0;
            loadedProgresses.forEach((_progress)=>{
                progress += _progress;
            });
            onProgress(name, progress / this._urlQueue.length);
        };

        let loadedCheck = ()=>{
            if(this._loadedAssets.length === this._urlQueue.length){
                onLoad();
            }
        };

        this._urlQueue.forEach((url, index)=>{
            let assetInfo = getAssetInfo(url);
            if(assetInfo){
                this.loadHandle(assetInfo,(name,progress)=>{
                    loadedProgresses[index] = progress;
                    onProgressHandle(name);
                }).then((asset)=>{
                    assetInfo.asset = asset;
                    this._loadedAssets.push(assetInfo);
                    loadedCheck();
                },(errMessage)=>{
                    this._loadedAssets.push(false);
                    loadedCheck();
                })
            }
        })
    }
    
    //----------------------------------------对外属性方法----------------------------------------
    pushUrlQueue(urlQueue){
        //过滤已加载
        for(let i = (urlQueue.length-1);i>=0;i--){
            let url = urlQueue[i];
            if(this._loadedUrls.indexOf(url) !== -1){
                urlQueue.splice(i,1);
            }
        }
        this._urlQueue = [...this._urlQueue,...urlQueue];
    }

    /**
     * 开始加载
     * @param onStart ()=>{} 开始加载
     * @param onProgress (assetName, progress)=>{}
     * @param onError (errorUrls)=>{}
     * @param onLoad ()=>{}
     */
    startLoad(onStart,onProgress,onError,onLoad){
        if(this._isLoading){
            return;
        }

        if(!this.canLoad){
            if(onStart){
                onStart();
            }
            if(onLoad){
                onLoad();
            }
            return;
        }

        this._loadedAssets = [];
        if(this._urlQueue){
            this._isLoading = true;

            if(onStart){
                onStart();
            }

            this.loadQueue((assetName, progress)=>{
                if(onProgress){
                    onProgress(assetName, Math.round(progress*100));
                }
            },()=>{
                this._loadedAssets.forEach((assetInfo)=>{
                    if(assetInfo){
                        this.assetSet[assetInfo.name] = assetInfo.asset;
                        this._loadedUrls.push(assetInfo.url);
                        let index = this._urlQueue.indexOf(assetInfo.url);
                        this._urlQueue.splice(index,1);
                    }
                });

                this._loadedAssets = [];
                this._isLoading = false;
                if(this._urlQueue.length === 0){
                    if(onLoad){
                        onLoad();
                    }
                }else{
                    if(onError){
                        onError([...this._urlQueue]);
                    }
                    this._urlQueue = [];
                }
            });
        }
    }

    getAsset(assetName){
        return this.assetSet[assetName];
    }
}