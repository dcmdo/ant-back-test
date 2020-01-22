export default class Increment {
    constructor(){
        this.declareVars();
    }
    declareVars(){
        this._value = 0;
    }
    increment(){
        this._value += 1;
        return this._value;
    }
}
