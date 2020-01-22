import DSMatrix3x3 from './cool-matrix3x3';

const SVGAddon = {
    //………………………………………………………………
    //屏幕坐标转svg坐标
    //svg：svg元素
    //point：{x,y}
    //………………………………………………………………
    screen2local:(svg,screenPoint)=>{
        return DSMatrix3x3.SVGMatrixInit(svg.getScreenCTM()).inverse.multiplyPoint(screenPoint);
    },
    local2screen:(svg,localPoint)=>{
        return DSMatrix3x3.SVGMatrixInit(svg.getScreenCTM()).multiplyPoint(localPoint)
    },
    from_to_matrix:(fromSVG,toSVG)=>{
        let fromMatrix = $DS.DSMatrix3x3.SVGMatrixInit(fromSVG.getScreenCTM());
        let toMatrix = $DS.DSMatrix3x3.SVGMatrixInit(toSVG.getScreenCTM()).inverse;
        let SVGMatrix = $DS.DSMatrix3x3.multiply(toMatrix,fromMatrix);
        return SVGMatrix;
    }
};

export default SVGAddon;
