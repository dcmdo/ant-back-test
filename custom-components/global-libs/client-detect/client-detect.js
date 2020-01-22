import isMobile from 'is-mobile';

const ClientDetect = {
    canTouch(){
        return "createTouch" in document;
    },
    isMobile(){
        return isMobile();
    }
};
export default ClientDetect;
