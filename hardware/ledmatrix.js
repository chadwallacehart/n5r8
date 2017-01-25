/**
 * Created by chad on 1/24/17.
 */
var ledmatrix = require("sense-hat-led");

console.log("LED Matrix loaded");
ledmatrix.clear(255,0,0);
setTimeout(function(){ledmatrix.clear(0,0,0)}, 1000);