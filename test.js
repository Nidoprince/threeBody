var space = require("./space.js");

let zero = new space.Vector(0,-1);
let fortyfive = new space.Vector(1,-1);
let ninety = new space.Vector(1,0);
let onethirtyfive = new space.Vector(1,1);
let oneeighty = new space.Vector(0,1);
let twotwentyfive = new space.Vector(-1,1);
let twoseventy = new space.Vector(-1,0);
let threeohfive = new space.Vector(-1,-1);

console.log(space.Vector.angleBetween(zero,fortyfive));
console.log(space.Vector.angleBetween(zero,ninety));
console.log(space.Vector.angleBetween(zero,twotwentyfive));
console.log(space.Vector.angleBetween(fortyfive,zero));
console.log(space.Vector.angleBetween(oneeighty,fortyfive));
console.log(space.Vector.angleBetween(threeohfive,zero));
console.log(space.Vector.angleBetween(twoseventy,fortyfive));
console.log(space.Vector.angleBetween(fortyfive,twotwentyfive));
