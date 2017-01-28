/**
 * Created by chad on 1/27/17.
 */

var events = require('events');
eventEmitter = new events.EventEmitter();

const Stream = require('stream').Duplex;
var stream = new Stream;

var nodeimu  = require('nodeimu');
var IMU = new nodeimu.IMU();

function headingCorrection(h, offset) {
    if (typeof offset ==='undefined')
        offset = 0;

    // Once you have your heading, you must then add your 'Declination Angle', which is the 'Error' of the magnetic field in your location.
    // Find yours here: http://www.magnetic-declination.com/
    var declinationAngle =  0.2563; //0.03106686;

    h += declinationAngle + offset;

    // Correct for when signs are reversed.
    if (h < 0)
        h += 2 * Math.PI;

    // Check for wrap due to addition of declination.
    if (h > 2 * Math.PI)
        h -= 2 * Math.PI;

    return h;
}

function headingToDegree(h) {
    // Convert radians to degrees for readability.
    return h * 180 / Math.PI;
}

var init = false,
    running = false,
    lastHeading,
    currentHeading;



function compassInit(err,data){

    if (err) {
        console.log(err);
        return;
    }

    if(data){
        heading = headingToDegree(headingCorrection(data.tiltHeading )).toFixed(0);
        if(!init){
            module.exports.eventEmitter.emit('init', heading);
            init = true;
        }
    }
}


function compassStream(err,data){

    if (err) {
        console.log(err);
        return;
    }

    if(data){
        if(!running)
            return;

        module.exports.heading = h = headingToDegree(headingCorrection(data.tiltHeading )).toFixed(0);
        if(!init){
            eventEmitter.emit('init', module.exports.heading);
            init = true;
        }

        if (Math.abs(module.exports.heading - lastHeading) > 1) {
            //eventEmitter.emit('HeadingChange', module.exports.heading)
            stream._write(h);
        }

        setTimeout(function(){IMU.getValue(compassStream)}, module.exports.interval);
    }
}


module.exports = {
    interval: 100,
    start: function(){
        running = true;
        IMU.getValue(compassStream);
        eventEmitter.on('init', function(heading){
            console.log("Compass started: current heading is " + module.exports.heading + " degrees");
        });

        //stream.pipe(process.stdout);
        /*stream.on('data', function(data){
            console.log(data);
        });*/

    },

    stop: function() {
        running = false;
        //stream.write(null);
    },
    data: stream,
    events: eventEmitter

};






/*
var tic = new Date();
var callb = function (e, data) {
    var toc = new Date();

    if (e) {
        console.log(e);
        return;
    }

    var str = data.timestamp.toISOString() + " ";
    str += print_vector3('Accel', data.accel)
    //uncommented
    str += print_vector3('Gyro', data.gyro)
    str += print_vector3('Compass', data.compass)
    str += print_vector3('Fusion', data.fusionPose)
    str += util.format('TiltHeading: %s ', headingToDegree(headingCorrection(data.tiltHeading, Math.PI / 2)).toFixed(0));

    var str2 = "";
    if (data.temperature && data.pressure && data.humidity) {
        var str2 = util.format('%s %s %s', data.temperature.toFixed(4), data.pressure.toFixed(4), data.humidity.toFixed(4));
    }
    if ((num % 10) == 0) {
        console.log(str + str2);
    }



    num++;
    if (num == numStop) {
        console.timeEnd("async");
    } else {
        setTimeout(function() { tic = new Date(); IMU.getValue(callb); } , 20 - (toc - tic));
    }
}

IMU.getValue(callb);
*/

