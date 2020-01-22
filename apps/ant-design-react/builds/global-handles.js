//----------------------------------------全局配置----------------------------------------
var _gConfig={
    // 全局版本配置
    version:"v1.0",
    /**
     * 预加载队列配置
     * [{href:"" as:""}...]
     */
    preloadQueue:[]
};
//----------------------------------------确定版本----------------------------------------
var _gDecideVersion = function () {
    let version = _gConfig.version || "v1.0";
    window._version = version;
};
//----------------------------------------自适应----------------------------------------
var _gAdapter = {
    documentElement:document.documentElement,
    adapterInfo:function(){
        var _type = Math.min(window.screen.width,window.screen.height)<=640?"small":"large";
        var _bodyStyle = document.body.style;
        var _bodySize = {width:parseFloat(_bodyStyle.width),height:parseFloat(_bodyStyle.height)};
        if(isNaN(_bodySize.width) || isNaN(_bodySize.height)){
            _bodySize = document.body.getBoundingClientRect();
        }
        _gAdapter.documentElement.className = "adapter-"+_type;
        if(_type==="small"){
            _gAdapter.documentElement.className += _bodySize.width<_bodySize.height?" adapter-portrait":" adapter-landscape";
        }
        return [_type,_bodySize];
    },
    remSize:function(){
        var _gAdapterInfo = _gAdapter.adapterInfo();
        var _type = _gAdapterInfo[0];
        var _bodySize = _gAdapterInfo[1];
        if(_type==="small"){
            return Math.min(_bodySize.width,_bodySize.height)/20+"px";
        }else{
            return 16+"px";
        }
    },
    adapteRem:function () {
        _gAdapter.documentElement.style.fontSize = _gAdapter.remSize();
    }
};
//----------------------------------------动态加载样式及脚本----------------------------------------
var _gLoadCSSJS = function () {
    setTimeout(()=>{
        var style = document.createElement("link");
        style.rel="stylesheet";
        style.href="./main.css?"+window._version;
        document.documentElement.appendChild(style);

        var script = document.createElement("script");
        script.src="./main.build.js?" + window._version;
        document.documentElement.appendChild(script);
    },1);
};
//----------------------------------------动态添加预加载资源----------------------------------------
var _gPreloadAssets = function(){
    setTimeout(()=>{
        var node = document.documentElement;
        _gConfig.preloadQueue.forEach((linkItem)=>{
            var _link = document.createElement("link");
            _link.rel = "preload";
            _link.href = linkItem.href;
            _link.as = linkItem.as;
            node.appendChild(_link);
        })
    },2)
};

//----------------------------------------执行函数事件----------------------------------------
window.onload = function () {
    // 确定版本
    _gDecideVersion();
    // 激活自适应
    _gAdapter.adapteRem();
    window.addEventListener("resize",_gAdapter.adapteRem,{ passive: false });
    // 动态加载样式脚本
    _gLoadCSSJS();
    // 预加载资源
    _gPreloadAssets();
};