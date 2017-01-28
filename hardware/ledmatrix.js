/**
 * Created by chad on 1/24/17.
 */
var ledmatrix = require("sense-hat-led");
var Promise = require('promise');

var red = [255, 0, 0],
    green = [0, 255, 0],
    blue = [0, 0, 255],
    black = [0, 0, 0];

//playing with promises

function setColor(color, t, cb) {

    if (!t)
            t=0;

    //nodeback
    if (cb) {
        setTimeout(
            function () {
                ledmatrix.clear(color);
                return cb;
            }, t)

    }

    else{
        //promise version
        return new Promise(function (resolve) {
            setTimeout(
                function () {
                    ledmatrix.clear(color);
                    resolve(color);
                }, t)
        })
    }

}

exports.init = function () {

    console.log("LED Matrix loaded");

    setColor(red, 500)
        .then(function (result) {
            return setColor(green, 500)
        })
        .then(function (result) {
            return setColor(blue, 500)
        })
        .then(function (result) {
            return setColor(black, 500)
        });

};


exports.initOld = function () {

    console.log("LED Matrix loaded");
    ledmatrix.clear(red);


    setTimeout(function () {
            ledmatrix.clear(green);
            setTimeout(function () {
                    ledmatrix.clear(blue);
                    setTimeout(function () {
                            ledmatrix.clear(black);
                        },
                        1000);
                },
                1000);
        },
        1000);

};

exports.setColor = setColor;