//禁用拖动物体在浏览器中打开新标签
const documentElement = document.documentElement;
documentElement.addEventListener('drop',(e)=>{
    e.preventDefault();
    e.stopPropagation();
    return false;
},{ passive: false });
