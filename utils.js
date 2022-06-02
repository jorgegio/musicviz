export function avg(arr) {
    return arr.reduce((sum, b) => sum + b) / arr.length;
}

export function max(arr) {
    return arr.reduce((a, b) => Math.max(a, b));
}
