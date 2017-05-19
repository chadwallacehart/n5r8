//Hardware dependencies
const ledmatrix = require('./hardware/ledmatrix'),
    compass = require('./hardware/compass'),
    range = require('./hardware/range'),
    rover = require('./hardware/j5'),
    www = require('./www/app.js');

const reflexes = require('./control/reflexes.js');

//require('./control/comandParser.js');

//todo: is there a reason to not just initialize on load for these? Maybe so I don't re init on every require?
//Hardware init
ledmatrix.init();
compass.init();
range.init();
rover.init();
//todo: one of the above is causing a promise error




//compass.on('data', (heading) => console.log('heading: ' + heading));




//rangeAttack(5, 140);


/*rover.onReady()
 .then(()=>rover.forward(1, 0.5))
 .then(()=>rover.backward(1, 0.5))
 .then(()=>rover.spinright(1, 0.5))
 .then(()=>rover.spinleft(1, 0.5))
 .then(()=>console.log("done"))
 .catch((err)=>console.log(err));
 */


//rover.onReady(()=>rover.forward( ()=>console.log("done")));