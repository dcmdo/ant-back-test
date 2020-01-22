import * as THREE from 'three';
import TypesCheck from 'TypesCheck';
import ObjectFns from 'ObjectFns';
export default class TextTexture extends THREE.Texture{
    /**
     * 构造函数
     * @param paras
     * text:{String || [String]} 文字或多行文字。
     * color:{String} 颜色 black。
     * font:{Object} {
     *      fontStyle: normal,
     *      fontWeight: normal,
     *      fontSize: 16,
     *      fontFamily: Arial
     * }
     * letterSpacing: {Number} 字符宽度。
     * width:{Number} 宽度。
     * align:{String} left || center || right
     * scaleValue:{Number} 1
     * outline: {Object} {
     *     color: white
     *     lineWidth:1
     * }
     * shadow: {Object}{
     *     color: gray
     *     x:1
     *     y:1
     *     blur:2
     * }
     */
    constructor( paras, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy){
        let canvas = document.createElement("canvas");
        canvas.width = 2;
        canvas.height = 2;
        minFilter = minFilter || THREE.LinearFilter;
        super(canvas,mapping,wrapS, wrapT, magFilter, minFilter, format, type, anisotropy);
        this.declareVars( paras );
        this.generate();
    }
    
    //----------------------------------------内部属性方法----------------------------------------
    declareVars( paras ){
        //----------私有----------
        this._paras = paras || {};
        this._canvas = this.image;
        this._context = this._canvas.getContext("2d");
        this._width = 0;
        this._height = 0;
        this._textArray = [];
    }

    get scaleValue(){
        return this._paras.scaleValue || 1;
    }

    get fontSize(){
        return this.font.fontSize * this.scaleValue;
    }

    get fontString(){
        let font = this.font;
        return font.fontStyle+" "+font.fontWeight+" "+this.fontSize+"px "+font.fontFamily;
    }

    spliteTextArray(width,letterSpacing,text){
        let widthDecide = this.fontSize + 2 * letterSpacing;
        if(width < widthDecide){
            console.error("您给定的文字宽度不能小于" + widthDecide);
            return [];
        }
        let textArray = [];
        let lineText = "";
        for(let i = 0; i < text.length; i++){
            let char = text[i];
            lineText += char;
            let lineWidth = this._context.measureText(lineText).width + (lineText.length+1)*letterSpacing;
            if( lineWidth > width){
                textArray.push(lineText.slice(0,lineText.length-1));
                lineText = lineText.slice(lineText.length-1,lineText.length);
            }
        }
        if(lineText!==""){
            textArray.push(lineText);
        }
        return textArray;
    }

    generate(){
        this._context.clearRect(0,0,this._canvas.width,this._canvas.height);
        this._context.font = this.fontString;

        let text = this.text;
        this._textArray = [];

        let shadow = this.shadow;
        let outline = this.outline;

        let scaleValue = this.scaleValue;
        let fontSize = this.fontSize;
        let letterSpacing = this.letterSpacing * scaleValue;
        let lineSegment = Math.round(fontSize * 0.2);

        let letterSpacingAddtion = 0;
        let lineSegmentAddtion = 0;
        if(shadow){
            letterSpacingAddtion = Math.abs(shadow.x * scaleValue);
            lineSegmentAddtion = shadow.y * scaleValue;
        }
        if(outline){
            let lineOutLetterSpacing = Math.abs( outline.lineWidth * scaleValue );
            let lineOutHeight = Math.abs(outline.lineWidth * scaleValue );
            if(letterSpacingAddtion < lineOutLetterSpacing){
                letterSpacingAddtion = lineOutLetterSpacing;
            }
            if(lineSegmentAddtion < lineOutHeight){
                lineSegmentAddtion = lineOutHeight;
            }
        }

        letterSpacing += letterSpacingAddtion;
        lineSegment += lineSegmentAddtion;

        // 求宽高及文字数组
        this._width = this._paras.width || 0;
        // 如果给定width
        if(this._width){
            this._width *= scaleValue;
            if(TypesCheck.isArray(text)){
                text.forEach((lineText)=>{
                    this._textArray.push(...this.spliteTextArray(this._width,letterSpacing,lineText));
                })
            }else{
                this._textArray = this.spliteTextArray(this._width,letterSpacing,text);
            }

            let addtionHeight = (this._textArray.length+1) * lineSegment;
            this._height = this._textArray.length * fontSize + addtionHeight;
        }else{
            this._width = 0;
            if(TypesCheck.isArray(text)){
                let lineCount = 0;
                text.forEach((lineText)=>{
                    let lineWidth = this._context.measureText(lineText).width;
                    if(lineWidth > this._width){
                        this._width = lineWidth;
                        lineCount = lineText.length;
                    }
                });
                this._textArray = text;

                this._width += letterSpacing * (lineCount + 1);
            }else{
                for(let i = 0; i < text.length; i++){
                    let char = text[i];
                    this._width += this._context.measureText(char).width;
                }
                this._textArray = [ text ];

                this._width += letterSpacing * (text.length + 1);
            }

            let addtionHeight = (this._textArray.length+1) * lineSegment;
            this._height = this._textArray.length * fontSize + addtionHeight;
        }

        this._canvas.width = this.width;
        this._canvas.height = this.height;

        this._context.font = this.fontString;
        this._context.fillStyle = this.color;
        this._context.textAlign = this.align;
        this._context.textBaseline = "top";

        if(shadow){
            this._context.shadowColor = shadow.color;
            this._context.shadowBlur = shadow.blur * scaleValue;
            this._context.shadowOffsetX = shadow.x * scaleValue;
            this._context.shadowOffsetY = shadow.y * scaleValue;
        }

        if(outline){
            this._context.strokeStyle = outline.color;
            this._context.lineWidth = outline.lineWidth * scaleValue;
            this._textArray.forEach((lineText,index)=>{
                let lineWidth = this._context.measureText(lineText).width + (lineText.length+1) * letterSpacing;
                let x = 0;
                for( let i = 0; i < lineText.length; i++){
                    x += letterSpacing;
                    let char = lineText[i];
                    let textParas = [];
                    if(this.align === "left"){
                        textParas = [x,index * fontSize + (index+1) * lineSegment];
                        x += this._context.measureText(char).width;
                    }else if(this.align === "right"){
                        x += this._context.measureText(char).width;
                        textParas = [this._width - lineWidth + x,index * fontSize + (index+1) * lineSegment];
                    }else{
                        let addWidth = this._context.measureText(char).width * 0.5;
                        x += addWidth;
                        textParas = [(this._width - lineWidth)/2 + x,index * fontSize + (index+1) * lineSegment];
                        x += addWidth;
                    }
                    this._context.strokeText(char,...textParas);
                }
            });
        }

        // 绘制文字
        this._textArray.forEach((lineText,index)=>{
            let lineWidth = this._context.measureText(lineText).width + (lineText.length+1) * letterSpacing;
            let x = 0;
            for( let i = 0; i < lineText.length; i++){
                x += letterSpacing;
                let char = lineText[i];
                let textParas = [];
                if(this.align === "left"){
                    textParas = [x,index * fontSize + (index+1) * lineSegment];
                    x += this._context.measureText(char).width;
                }else if(this.align === "right"){
                    x += this._context.measureText(char).width;
                    textParas = [this._width - lineWidth + x,index * fontSize + (index+1) * lineSegment];
                }else{
                    let addWidth = this._context.measureText(char).width * 0.5;
                    x += addWidth;
                    textParas = [(this._width - lineWidth)/2 + x,index * fontSize + (index+1) * lineSegment];
                    x += addWidth;
                }
                this._context.fillText(char,...textParas);
            }
        });
        this.needsUpdate = true;
    }

    //----------------------------------------对外属性及方法----------------------------------------
    get text(){
        return  this._paras.text || this._paras.text + "" || "";
    }
    set text( text ){
        this._paras.text = text;
        this.generate();
    }

    get color(){
        return this._paras.color || "#ffffff";
    }
    set color( color ){
        this._paras.color = color;
        this.generate();
    }

    get font(){
        return {
            fontStyle:"normal",
            fontWeight:"normal",
            fontSize:16,
            fontFamily:"Arial",
            ...this._paras.font
        };
    }
    set font(font){
        this._paras.font = {...this._paras.font, ...font};
        this.generate();
    }

    get height(){
        let height = this._height || 0;
        return height/this.scaleValue;
    }

    get letterSpacing(){
        return this._paras.letterSpacing || this.font.fontSize*0.1;
    }
    set letterSpacing(letterSpacing){
        this._paras.letterSpacing = letterSpacing;
        this.generate();
    }

    get width(){
        let width = this._width || 0;
        return width/this.scaleValue;
    }
    set width( width ){
        this._paras.width = width;
        this.generate();
    }

    get align(){
        return this._paras.align || "center";
    }
    set align( align ){
        this._paras.align = align;
        this.generate();
    }

    get outline(){
        return this._paras.outline ?
            {
                color:"#000000",
                lineWidth:this.font.fontSize * 0.1,
                ...this._paras.outline
            } :
            null;
    }
    set outline(outline){
        this._paras.outline = outline;
        this.generate();
    }

    get shadow(){
        return this._paras.shadow ?
            {
                color:"#808080",
                x:0,
                y:this.font.fontSize * 0.1,
                blur:this.font.fontSize * 0.2
            } :
            null;
    }

    // 重写父组件方法
    clone() {
        return new TextTexture(ObjectFns.clone(this._paras));
    }
    copy(source) {
        super.copy(source);
        this._paras = ObjectFns.clone(source._paras);
        this.generate();
        return this;
    }
}