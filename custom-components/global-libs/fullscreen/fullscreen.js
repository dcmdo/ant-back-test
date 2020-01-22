const FullScreen = {
    on(element){
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        }
        setTimeout(()=>{
            element.focus();
        },0);
    },
    off(){
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
    },
    isFull(){
        return document.fullscreenElement ||document.webkitFullscreenElement ||document.mozFullScreenElement;
    }
};

export default FullScreen;

