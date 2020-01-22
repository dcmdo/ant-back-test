/**
 * 获取特定图片位置的颜色
 * @param imageUrl {String} 图片地址 支持 base64格式
 * @param posX {Number} 图片的x坐标
 * @param posY {Number} 图片的y坐标
 * return Promise(resolve) resolve:(colorString)=>{}
 */
const imageColor = (imageUrl,posX,posY)=>{
    return new Promise((resolve)=>{
        let image = new Image();
        image.src = imageUrl;
        image.onload = ()=>{
            let canvas = document.createElement("canvas");
            let context = canvas.getContext("2d");
            canvas.width = image.width;
            canvas.height = image.height;
            context.drawImage(image,0,0,image.width,image.height);
            let colorData = context.getImageData(posX,posY,1,1).data;
            try{
                resolve("rgba("+colorData[0]+","+colorData[1]+","+colorData[2]+","+colorData[3]+")");
                canvas = null;
                context = null;
                image = null;
            }catch (ex){
                resolve("rgba(0,0,0,0)");
                canvas = null;
                context = null;
                image = null;
            }
        }
    });
};

export default imageColor;
