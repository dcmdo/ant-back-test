import * as THREE from 'three';
import TypesCheck from 'TypesCheck';

const Dispose = {
    disposeObject3D:(object3D)=>{
        //递归剔除
        object3D.traverse((go)=>{
            go.raycast = null;
            //释放自定义组件
            if(go._disposeComponents){
                go._disposeComponents.forEach((disposeComponent)=>{
                    disposeComponent._dispose(go);
                });
                go._disposeComponents = null;
            }
            if(go.geometry){//释放mesh
                go.geometry.dispose();
            }
            if(go.material){
                if(TypesCheck.isArray(go.material)){
                    go.material.forEach((material)=>{
                        Dispose.disposeMaterial(material);
                    })
                }else{
                    Dispose.disposeMaterial(go.material);
                }
            }
        });
        //从父物体移除
        object3D.raycast = null;
        if(object3D.parent){
            object3D.parent.remove(object3D);
        }
        THREE.Cache.clear();
    },

    disposeMaterial:(material)=>{
        for (let k in material) {
            try{
                if (material[k].isTexture) {
                    material[k].dispose();
                }
            }catch (e) {}
        }
        material.dispose();
    }
};

export default Dispose;