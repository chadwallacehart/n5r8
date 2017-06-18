/**
 * Created by chad on 1/28/17.
 */
let util = require('util');
let Barcli = require("barcli");

let compass = require('./hardware/compass');
let graphHeading = new Barcli({ label: "Heading",  range: [0, 360], autoRange: false});

compass.init();
compass.on('data', function(h){
    graphHeading.update(parseInt(h.toString("utf8")));
    //console.log('heading: ' + h);
});
