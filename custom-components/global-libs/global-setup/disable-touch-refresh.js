import ForceOrientation from 'ForceOrientation';
import Coroutine from "Coroutine";
//----------禁用移动端下拉刷新----------
(()=>{
    let scrollContainers = [];
    const getScrollContainer = (element,scrollSet = [])=>{
        if(!element){
            return scrollSet;
        }

        let overflowSets = ["visible","hidden"];
        let style = getComputedStyle(element);

        if(overflowSets.indexOf(style.overflowY)!==-1 && overflowSets.indexOf(style.overflowX)!==-1){
            if(element.parentElement){
                getScrollContainer(element.parentElement,scrollSet);
            }
            return ;
        }

        let scrollHeight = element.scrollHeight;
        let offsetHeight = element.offsetHeight;
        let scrollWidth = element.scrollWidth;
        let offsetWidth = element.offsetWidth;

        if(scrollHeight>offsetHeight||scrollWidth>offsetWidth){
            scrollSet.push(element);
            if(element.parentElement){
                getScrollContainer(element.parentElement,scrollSet);
            }
        }else{
            if(element.parentElement){
                getScrollContainer(element.parentElement,scrollSet);
            }
        }
    };

    const scrollHandle = (deltaX,deltaY)=>{
        if(scrollDir === 1){
            for(let i = 0; i< scrollContainers.length; i++){
                let container = scrollContainers[i];
                if(deltaX !== 0){
                    let scrollWidth = container.scrollWidth;
                    let scrollLeft = container.scrollLeft;
                    let offsetWidth = container.offsetWidth;
                    if(scrollLeft+deltaX <= 0){
                        let _deltaX = 0-scrollLeft;
                        container.scrollLeft += _deltaX;
                        deltaX -= _deltaX;
                    }else if(scrollLeft+offsetWidth+deltaX >= scrollWidth){
                        let _deltaX = scrollWidth - scrollLeft - offsetWidth;
                        if(_deltaX<0){
                            _deltaX = 0;
                        }
                        container.scrollLeft += _deltaX;
                        deltaX -= _deltaX;
                    }else {
                        container.scrollLeft += deltaX;
                        deltaX = 0;
                    }
                }
            };
        }else if(scrollDir === 2){
            for(let i = 0; i< scrollContainers.length; i++){
                let container = scrollContainers[i];
                if(deltaY !== 0){
                    let scrollHeight = container.scrollHeight;
                    let scrollTop = container.scrollTop;
                    let offsetHeight = container.offsetHeight;
                    if(scrollTop+deltaY <= 0){
                        let _deltaY = 0-scrollTop;
                        container.scrollTop += _deltaY;
                        deltaY -= _deltaY;
                    }else if(scrollTop+offsetHeight+deltaY >= scrollHeight){
                        let _deltaY = scrollHeight - scrollTop - offsetHeight;
                        if(_deltaY<0){
                            _deltaY = 0;
                        }
                        container.scrollTop += _deltaY;
                        deltaY -= _deltaY;
                    }else {
                        container.scrollTop += deltaY;
                        deltaY = 0;
                    }
                }
            };
        }
    };

    let startPoint = [0,0];
    let speedQueue = [];
    let speeds = [0,0];
    let speedSigns = [1,1];
    let scrollDir = null;
    let startTime = 0;
    let duringTime = 1;
    window.addEventListener("touchstart",(event)=>{
        smoothMoveCoroutine.stop();
        scrollContainers = [];
        getScrollContainer(event.target,scrollContainers);
        if(scrollContainers.length > 0){
            let touch = ForceOrientation.orientationEventPoint(event.touches[0]);
            startPoint = [touch.clientX,touch.clientY];
            speeds = [0,0];
            speedQueue = [];
            startTime = performance.now();
        }
        scrollDir = null;
    },{ passive: true });

    window.addEventListener("touchmove",(event)=>{
        if(event.cancelable){
            event.preventDefault();
        }
        if(scrollContainers.length < 1){
            return;
        }
        let touch = ForceOrientation.orientationEventPoint(event.touches[0]);
        let endPoint = [touch.clientX,touch.clientY];
        let deltaX = startPoint[0] - endPoint[0];
        let deltaY = startPoint[1] - endPoint[1];
        startPoint[0] = endPoint[0];
        startPoint[1] = endPoint[1];

        if(scrollDir === null){
            if(Math.abs(deltaX) > Math.abs(deltaY)){
                scrollDir = 1;//水平移动
            }else{
                scrollDir = 2;//垂直移动
            }
            deltaX = 0;
            deltaY = 0;
        }

        let endTime = performance.now();
        duringTime = (endTime - startTime)/20;
        startTime = endTime;

        speeds = [Math.abs(deltaX)/duringTime,Math.abs(deltaY)/duringTime];
        speedSigns = [deltaX<0?-1:1,deltaY<0?-1:1];
        speedQueue.unshift(speeds);
        speedQueue.length = 10;


        scrollHandle(deltaX,deltaY);
    },{ passive: false });

    let curSpeed = [0,0];
    let smoothMoveCoroutine = new Coroutine((delta)=>{
        let speedX = 0;
        let speedY = 0;

        let stopNum = 0;
        if(curSpeed[0] <= 0){
            stopNum += 1;
        }else{
            speedX = curSpeed[0] * speedSigns[0];
        }
        if(curSpeed[1] <= 0){
            stopNum += 1;
        }else{
            speedY = curSpeed[1] * speedSigns[1];
        }
        if(stopNum === 2){
            smoothMoveCoroutine.stop();
        }else {
            scrollHandle(speedX,speedY);
        }
        curSpeed[0] -= 8 * delta;
        curSpeed[1] -= 8 * delta;
    });

    window.addEventListener("touchend",(event)=>{
        if(scrollContainers.length<1){
            return;
        }

        let speedX = 0;
        let speedy = 0;
        let speedCount = 0;
        speedQueue.forEach((speed)=>{
            if(speed){
                speedX += speed[0];
                speedy += speed[1];
                speedCount += 1;
            }
        });

        speedX /= speedCount;
        speedy /= speedCount;

        curSpeed = [Math.min(speedX,64),Math.min(speedy,64)];
        smoothMoveCoroutine.start();
    },{passive:true})
})();