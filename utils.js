export function avg(arr) {
    return arr.reduce((sum, b) => sum + b) / arr.length;
}

export function max(arr) {
    return arr.reduce((a, b) => Math.max(a, b));
}

export function randomPointSphere(radius) {
	let theta = 2 * Math.PI * Math.random();
	let phi = Math.acos(2 * Math.random() - 1);
	let x = radius * Math.sin(phi) * Math.cos(theta);
	let y = radius * Math.sin(phi) * Math.sin(theta);
	let z = radius * Math.cos(phi);
	return {x, y, z};
}