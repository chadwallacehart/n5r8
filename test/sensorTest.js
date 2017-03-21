/**
 * Created by chad on 1/28/17.
 */
var util = require('util')
var Barcli = require("barcli");

var compass = require('./hardware/compass');
var graphHeading = new Barcli({ label: "Heading",  range: [0, 360], autoRange: false});

compass.init();
compass.on('data', function(h){
    graphHeading.update(parseInt(h.toString("utf8")));
    //console.log('heading: ' + h);
});
