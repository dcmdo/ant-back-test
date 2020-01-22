class ScreenConsole {
    constructor(){
        this.declareVars();
        this.initDom();
    }
    //----------------------------------------内部属性变量----------------------------------------
    declareVars(){
        this._element = null;
        this._infoSet = {};
    }

    initDom(){
        this._element = document.createElement("pre");
        this._element.style.position = "fixed";
        this._element.style.left = "0";
        this._element.style.right = "0";
        this._element.style.top = "0";
        this._element.style.bottom = "0";
        this._element.style.zIndex = "10000";
        this._element.style.pointerEvents = "none";
        this._element.style.whiteSpace = "pre-wrap";
        this._element.style.backgroundColor = "rgba(255,255,255,0.5)";
        document.body.appendChild(this._element);
    }

    console(key,...values){
        this._infoSet[key] = values;
        let text = "";
        for(let k in this._infoSet){
            let _values = this._infoSet[k];
            text += "\n"+k+"->"+_values.join(", ")+"\n";
        }
        this._element.innerText = text;
    }
}

export default new ScreenConsole();