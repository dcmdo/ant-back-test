import ForceOrientation from 'ForceOrientation';
const fontSizeAdapterSet = [];

window.addEventListener("resize",()=>{
    fontSizeAdapterSet.forEach((fontSizeAdapter)=>{
        fontSizeAdapter.adapter();
    });
},{passive:false});

export default class FontSizeAdapter {
    /**
     * @param element {DomElement}
     * @param sizeConfig {Object} (width or height) fontSize
     */
    constructor(element,sizeConfig){
        this.declareVars(element,sizeConfig);
        this.addToFontSizeAdapterSet();
        this.adapter();
    }
    //----------------------------------------内部属性变量----------------------------------------
    declareVars(element,sizeConfig){
        //----------私有----------
        this._element = element;
        this._sizeConfig = sizeConfig;
    }

    addToFontSizeAdapterSet(){
        if(fontSizeAdapterSet.indexOf(this) === -1){
            fontSizeAdapterSet.push(this);
        }
    }

    get sizeConfig(){
        return this._sizeConfig || {
            width: window.innerWidth,
            fontSize: 16
        }
    }

    adapter(){
        if(!this.element){
            this.dispose();
            return;
        }

        if(!this.adapterFontSize){
            return;
        }

        let size = ForceOrientation.orientationClientRect(
            this.element.getBoundingClientRect()
        );
        if(this.adapterWidth){
            this.element.style.fontSize = (size.width/this.adapterWidth) *
                this.adapterFontSize + "px";
        }else if(this.adapterHeight){
            this.element.style.fontSize = (size.height/this.adapterHeight) *
                this.adapterFontSize + "px";
        }
    }
    //----------------------------------------对外方法----------------------------------------
    get element(){
        return this._element;
    }

    set element(element){
        if(element){
            this._element = element;
            this.addToFontSizeAdapterSet();
        }
        this.adapter();
    }

    get adapterWidth(){
        return this.sizeConfig.width || 0;
    }
    set adapterWidth(adapterWidth){
        this.sizeConfig.width = adapterWidth;
        this.adapter();
    }

    get adapterHeight(){
        return this.sizeConfig.height || 0;
    }
    set adapterHeight(adapterHeight){
        this.sizeConfig.height = adapterHeight;
        this.adapter();
    }

    get adapterFontSize(){
        return this.sizeConfig.fontSize || 16;
    }
    set adapterFontSize(adapterFontSize){
        this.sizeConfig.adapterFontSize = adapterFontSize;
        this.adapter();
    }

    dispose(){
        let index = fontSizeAdapterSet.indexOf(this);
        if(index!==-1){
            fontSizeAdapterSet.splice(index,1);
        }
    }
}