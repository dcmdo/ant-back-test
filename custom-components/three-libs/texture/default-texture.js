import * as THREE from 'three';

export default class DeFaultTexture extends THREE.Texture{
    constructor(width,height,color,mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy){
        let _width = width?width:2;
        let _height = height?height:2;

        let canvas = document.createElement("canvas");
        let context = canvas.getContext('2d');
        canvas.width = _width;canvas.height = _height;
        context.fillStyle = color || "#ffffff";
        context.fillRect(0,0,_width,_height);

        minFilter = minFilter || THREE.LinearFilter;
        super(canvas,mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy);
        this.needsUpdate = true;
    }
}

// const defaultTexture = (width,height,color)=>{
//     let _width = width?width:2;
//     let _height = height?height:2;
//
//     let canvas = document.createElement("canvas");
//     let context = canvas.getContext('2d');
//     canvas.width = _width;canvas.height = _height;
//     context.fillStyle = color || "#ffffff";
//     context.fillRect(0,0,_width,_height);
//
//     let texture = new THREE.Texture(canvas);
//     texture.minFilter = THREE.LinearFilter;
//     texture.needsUpdate = true;
//
//     return texture;
// };
