const linear = (t)=>{
	return t;
};
const getPowIn = (pow)=>{
	return (t)=>{
		return Math.pow(t,pow);
	};
};
const getPowOut = (pow)=>{
	return (t)=>{
		return 1-Math.pow(1-t,pow);
	};
};
const getPowInOut = (pow)=>{
	return (t)=>{
		if ((t*=2)<1){
			return 0.5*Math.pow(t,pow);
		}
		return 1-0.5*Math.abs(Math.pow(2-t,pow));
	};
};
const getBackIn = (amount)=>{
	return (t)=>{
		return t*t*((amount+1)*t-amount);
	};
};
const getBackOut = (amount)=>{
	return (t)=>{
		return (--t*t*((amount+1)*t + amount) + 1);
	};
};
const getBackInOut = (amount)=>{
	amount*=1.525;
	return (t)=>{
		if ((t*=2)<1){
			return 0.5*(t*t*((amount+1)*t-amount));
		}
		return 0.5*((t-=2)*t*((amount+1)*t+amount)+2);
	};
};
const getElasticIn = (amplitude,period)=>{
	let pi2 = Math.PI*2;
	return (t)=>{
		if (t==0 || t==1){
			return t;
		}
		let s = period/pi2*Math.asin(1/amplitude);
		return -(amplitude*Math.pow(2,10*(t-=1))*Math.sin((t-s)*pi2/period));
	};
};
const getElasticOut = (amplitude,period)=>{
	let pi2 = Math.PI*2;
	return (t)=>{
		if (t==0 || t==1){
			return t;
		}
		let s = period/pi2 * Math.asin(1/amplitude);
		return (amplitude*Math.pow(2,-10*t)*Math.sin((t-s)*pi2/period )+1);
	};
};
const getElasticInOut = (amplitude,period)=>{
	let pi2 = Math.PI*2;
	return (t)=>{
		let s = period/pi2 * Math.asin(1/amplitude);
		if ((t*=2)<1){
			return -0.5*(amplitude*Math.pow(2,10*(t-=1))*Math.sin( (t-s)*pi2/period ));
		}
		return amplitude*Math.pow(2,-10*(t-=1))*Math.sin((t-s)*pi2/period)*0.5+1;
	};
};

const Ease = {
	linear,
	none: linear,
	easeInQuad: getPowIn(2),
	easeOutQuad: getPowOut(2),
	easeInOutQuad: getPowInOut(2),
	easeInCubic: getPowIn(3),
	easeOutCubic: getPowOut(3),
	easeInOutCubic: getPowInOut(3),
	easeInQuart: getPowIn(4),
	easeOutQuart: getPowOut(4),
	easeInOutQuart : getPowInOut(4),
	easeInQuint : getPowIn(5),
	easeOutQuint : getPowOut(5),
	easeInOutQuint : getPowInOut(5),
	easeInSine(t){
		return 1-Math.cos(t*Math.PI/2);
	},
	easeOutSine(t){
		return Math.sin(t*Math.PI/2);
	},
	easeInOutSine(t){
		return -0.5*(Math.cos(Math.PI*t) - 1);
	},
	easeInBack: getBackIn(1.7),
	easeOutBack: getBackOut(1.7),
	easeInOutBack: getBackInOut(1.7),
	easeInCirc(t){
		return -(Math.sqrt(1-t*t)- 1);
	},
	easeOutCirc(t){
		return Math.sqrt(1-(--t)*t);
	},
	easeInOutCirc(t){
		if ((t*=2) < 1){
			return -0.5*(Math.sqrt(1-t*t)-1);
		}
		return 0.5*(Math.sqrt(1-(t-=2)*t)+1);
	},
	easeInBounce(t){
		return 1-Ease.easeOutBounce(1-t);
	},
	easeOutBounce(t){
		if (t < 1/2.75) {
			return (7.5625*t*t);
		} else if (t < 2/2.75) {
			return (7.5625*(t-=1.5/2.75)*t+0.75);
		} else if (t < 2.5/2.75) {
			return (7.5625*(t-=2.25/2.75)*t+0.9375);
		} else {
			return (7.5625*(t-=2.625/2.75)*t +0.984375);
		}
	},
	easeInOutBounce(t){
		if (t<0.5){
			return Ease.easeInBounce (t*2) * .5;
		}
		return Ease.easeOutBounce(t*2-1)*0.5+0.5;
	},
	easeElasticIn: getElasticIn(1,0.3),
	easeElasticOut: getElasticOut(1,0.3),
	easeElasticInOut: getElasticInOut(1,0.3*1.5)
};

export default Ease;