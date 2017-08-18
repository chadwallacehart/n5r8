/**
 * Created by chad on 1/28/17.
 */
let util = require('util');
let Barcli = require("barcli");
let graphs = [];


/*** Compass test ***/
let compass = require('../hardware/compass');
graphs.push( new Barcli({ label: "Heading",  range: [0, 360], autoRange: false}) );

compass.init();
compass.on('data', function(h){
    graphs[0].update(parseInt(h.toString("utf8")));
    //console.log('heading: ' + h);
});


/*** USonic test ***/
let range = require('../hardware/range');
graphs.push(new Barcli({label: "Usonic1 - Front Right", range: [0, 300], autoRange: false}));
graphs.push( new Barcli({label: "Usonic2 - Front Left", range: [0, 300], autoRange: false}));
graphs.push(new Barcli({label: "Usonic3 - Rear Right", range: [0, 300], autoRange: false}));
graphs.push(new Barcli({label: "Usonic4 - Rear Left", range: [0, 300], autoRange: false}));

range.init();
range.on('data', (data) => {
    switch( data.location ){
        case "front right":
            graphs[1].update(parseInt(data.distance.toString("utf8")));
            break;
        case "front left":
            graphs[2].update(parseInt(data.distance.toString("utf8")));
            break;
        case "rear right":
            graphs[3].update(parseInt(data.distance.toString("utf8")));
            break;
        case "rear left":
            graphs[4].update(parseInt(data.distance.toString("utf8")));
            break;
    }

    //console.log(data)
});
