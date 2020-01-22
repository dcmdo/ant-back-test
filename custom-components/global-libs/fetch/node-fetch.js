import url from 'url';
import fetch from 'node-fetch';
const URL = url.URL;

const getUrlWithParas = (urlString,paras)=>{
    let url = new URL(urlString);
    if(paras){
        for(let k in paras){
            url.searchParams.append(k,paras[k]);
        }
    }
    return url;
};

const NodeFetch = {
    fetch:fetch,

    /**
     * get请求
     * @param url {String} 接口地址
     * @param paras {Object} key: value 请求参数
     * @param responseType {String} json text arrayBuffer blob formData
     * @param option {Object}
     * return Promise(resolve, reject) resolve(result); reject(error:{status,info});
     */
    get(url,paras,responseType="json",option){
        return new Promise((resolve,reject)=>{
            let _url = getUrlWithParas("http://localhost",paras);
            _url = url+_url.search;
            let _option = option?option:{};
            _option.method = "GET";
            fetch(_url,_option)
                .then((response)=>{
                    if(response.status!==200){
                        return reject({status:response.status,info:response.statusText});
                    }
                    response[responseType]().then((res)=>{
                        resolve(res);
                    }).catch((ex)=>{
                        reject({status:response.status,info:ex.message});
                    })
                }).catch((ex)=>{
                    reject({status:undefined,info:ex.message});
                })
        })
    },

    /**
     * post请求
     * @param url {String} 接口地址
     * @param paras {Object} key: value 请求参数
     * @param responseType {String} json text arrayBuffer blob formData
     * @param option {Object}
     * return Promise(resolve, reject) resolve(result); reject(error:{status,info});
     */
    post(url,paras,responseType="json",option){
        return new Promise((resolve,reject)=>{
            let _search = getUrlWithParas("http://localhost",paras).search.substring(1);
            let _option = option?option:{};
            _option.headers = _option.headers?_option.headers:{};
            _option.headers["Content-Type"]=_option.headers["Content-Type"]?_option.headers["Content-Type"]:'application/x-www-form-urlencoded;charset=UTF-8';
            _option.body = _option.body?_option.body:_search;
            _option.method = "POST";
            fetch(url,_option)
                .then((response)=>{
                    if(response.status!==200){
                        return reject({status:response.status,info:response.statusText});
                    }
                    response[responseType]().then((res)=>{
                        resolve(res);
                    }).catch((ex)=>{
                        reject({status:response.status,info:ex.message});
                    })
                }).catch((ex)=>{
                    reject({status:undefined,info:ex.message});
            })
        })
    }
};
export default NodeFetch;
