//Hardware dependencies
var ledmatrix = require('./hardware/ledmatrix'),
     compass = require('./hardware/compass');

//var compass = Compass();

ledmatrix.init();
compass.init();


compass.on('data', function(heading){
    console.log('heading: ' + heading);
});

setTimeout(compass.stop, 10000);

//compass.pipe(process.stdout);
