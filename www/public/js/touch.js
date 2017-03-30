/**
 * Created by chad on 3/25/17.
 */

/****Most of this is from the source below: *****/
/*multi-touch game controller demo. for more information http://sebleedelisle.com/2011/04/multi-touch-game-controller-in-javascripthtml5-for-ipad

 Copyright (c)2010-2011, Seb Lee-Delisle, sebleedelisle.com
 All rights reserved.

 Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

 * Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.

 * Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

 THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
function touch() {
    console.log("loaded");


    let canvas,
        c, // c is the canvas' context 2D
        container,
        //halfWidth,
        thirdWidth,
        halfHeight,
        leftTouchID = -1,
        leftTouchPos = new Vector2(0, 0),
        leftTouchStartPos = new Vector2(0, 0),
        leftVector = new Vector2(0, 0),

        rightTouchID = -1,
        rightTouchPos = new Vector2(0, 0),
        rightTouchStartPos = new Vector2(0, 0),
        rightVector = new Vector2(0, 0),

        shootTouchID = -1;

    setupCanvas();

    let mouseX, mouseY,
        // is this running in a touch capable environment?
        touchable = 'createTouch' in document,
        touches = []; // array of touch vectors

    let message = {
        left: "left message",
        right: "right message",
        shoot: "shoot message"
    };

    setInterval(draw, 1000 / 35);

    if (touchable) {
        canvas.addEventListener('touchstart', onTouchStart, false);
        canvas.addEventListener('touchmove', onTouchMove, false);
        canvas.addEventListener('touchend', onTouchEnd, false);
        window.onorientationchange = resetCanvas;
        window.onresize = resetCanvas;
    } else {

        canvas.addEventListener('mousemove', onMouseMove, false);
    }

    function resetCanvas(e) {
        // resize the canvas - but remember - this clears the canvas too.
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        halfWidth = canvas.width / 2;
        thirdWidth = canvas.width / 3;
        halfHeight = canvas.height / 2;

        //make sure we scroll to the top left.
        window.scrollTo(0, 0);
    }

    function draw() {

        c.clearRect(0, 0, canvas.width, canvas.height);


        c.fillStyle = "grey";
        c.font = '16px Arial';

        c.beginPath();
        c.textAlign = "end";
        c.fillText(message.left, thirdWidth - 10, halfHeight);

        c.beginPath();
        c.textAlign = "start";
        c.fillText(message.right, (thirdWidth * 2)  + 10, halfHeight);

        c.beginPath();
        c.textAlign = "center"; //(c.measureText(message.shoot)/2)
        c.fillText(message.shoot, halfWidth, halfHeight);

        //draw a circle in the center
        c.strokeStyle = "DarkGray";
        c.lineWidth=2;
        c.beginPath();
        c.arc(canvas.width/2, canvas.height/2, (thirdWidth*.6)/2, 0, 2*Math.PI);
        c.stroke();


        if (touchable) {

            for (var i = 0; i < touches.length; i++) {

                var touch = touches[i];

                if (touch.identifier == leftTouchID) {
                    c.beginPath();
                    c.strokeStyle = "cyan";
                    c.lineWidth = 6;
                    c.arc(leftTouchStartPos.x, leftTouchStartPos.y, 40, 0, Math.PI * 2, true);
                    c.stroke();
                    c.beginPath();
                    c.strokeStyle = "cyan";
                    c.lineWidth = 2;
                    c.arc(leftTouchStartPos.x, leftTouchStartPos.y, 60, 0, Math.PI * 2, true);
                    c.stroke();
                    c.beginPath();
                    c.strokeStyle = "cyan";
                    c.arc(leftTouchPos.x, leftTouchPos.y, 40, 0, Math.PI * 2, true);
                    c.stroke();
                }
                else if (touch.identifier == rightTouchID) {
                    c.beginPath();
                    c.strokeStyle = "cyan";
                    c.lineWidth = 6;
                    c.arc(rightTouchStartPos.x, rightTouchStartPos.y, 40, 0, Math.PI * 2, true);
                    c.stroke();
                    c.beginPath();
                    c.strokeStyle = "cyan";
                    c.lineWidth = 2;
                    c.arc(rightTouchStartPos.x, rightTouchStartPos.y, 60, 0, Math.PI * 2, true);
                    c.stroke();
                    c.beginPath();
                    c.strokeStyle = "cyan";
                    c.arc(rightTouchPos.x, rightTouchPos.y, 40, 0, Math.PI * 2, true);
                    c.stroke();
                }

                else {

                    c.font = '10px Arial'; //chad

                    c.beginPath();
                    c.fillStyle = "white";
                    c.fillText("touch id : " + touch.identifier + " x:" + touch.clientX + " y:" + touch.clientY, touch.clientX + 30, touch.clientY - 30);

                    c.beginPath();
                    c.strokeStyle = "red";
                    c.lineWidth = "6";
                    c.arc(touch.clientX, touch.clientY, 40, 0, Math.PI * 2, true);
                    c.stroke();
                }
            }
        } else {

            c.font = '10px Arial'; //chad
            c.fillStyle = "white";
            c.fillText("mouse : " + mouseX + ", " + mouseY, mouseX, mouseY);

        }
    }

    /*
     *	Touch event (e) properties :
     *	e.touches: 			Array of touch objects for every finger currently touching the screen
     *	e.targetTouches: 	Array of touch objects for every finger touching the screen that
     *						originally touched down on the DOM object the transmitted the event.
     *	e.changedTouches	Array of touch objects for touches that are changed for this event.
     *						I'm not sure if this would ever be a list of more than one, but would
     *						be bad to assume.
     *
     *	Touch objects :
     *
     *	identifier: An identifying number, unique to each touch event
     *	target: DOM object that broadcast the event
     *	clientX: X coordinate of touch relative to the viewport (excludes scroll offset)
     *	clientY: Y coordinate of touch relative to the viewport (excludes scroll offset)
     *	screenX: Relative to the screen
     *	screenY: Relative to the screen
     *	pageX: Relative to the full page (includes scrolling)
     *	pageY: Relative to the full page (includes scrolling)
     */

    function onTouchStart(e) {

        for (var i = 0; i < e.changedTouches.length; i++) {
            var touch = e.changedTouches[i];
            //console.log(leftTouchID + " "

            if ((leftTouchID < 0) && (touch.clientX < thirdWidth)) {
                leftTouchID = touch.identifier;
                leftTouchStartPos.reset(touch.clientX, touch.clientY);
                leftTouchPos.copyFrom(leftTouchStartPos);
                leftVector.reset(0, 0);
                //continue;


            }
            else if ((rightTouchID < 0) && (touch.clientX > thirdWidth*2)) {
                rightTouchID = touch.identifier;
                rightTouchStartPos.reset(touch.clientX, touch.clientY);
                rightTouchPos.copyFrom(leftTouchStartPos);
                rightVector.reset(0, 0);
                //continue;
            }
            else if ((leftTouchID < 0) && touch.clientX > thirdWidth && touch.clientX < thirdWidth*2) {
                shootTouchID = touch.identifier;
                message.shoot = "shooting!";
                socket.emit('touchui', {'control': 'shootOn'});
                //ToDo: add a shootTouchID and detect if it has been listed

            }
        }
        touches = e.touches;
        //message = "Left: " + leftTouchID + ", right:  " + rightTouchID; //chad
    }

    function onTouchMove(e) {
        // Prevent the browser from doing its default thing (scroll, zoom)
        e.preventDefault();

        for (var i = 0; i < e.changedTouches.length; i++) {

            var touch = e.changedTouches[i];

            if (leftTouchID == touch.identifier) {

                if (leftTouchStartPos.y - touch.clientY > 0) {
                    message.left = "forward";
                    console.log("left forward");
                    socket.emit('touchui', {'control': 'lfOn'});
                }
                else if (leftTouchStartPos.y - touch.clientY < 0) {
                    message.left = "backward";
                    console.log("left backward");
                    socket.emit('touchui', {'control': 'lbOn'});
                }
                //}

                leftTouchPos.reset(touch.clientX, touch.clientY);
                leftVector.copyFrom(leftTouchPos);
                leftVector.minusEq(leftTouchStartPos);
            }

            if (rightTouchID == touch.identifier) {

                if (rightTouchStartPos.y - touch.clientY > 0) {
                    message.right = "forward";
                    console.log("right forward");
                    socket.emit('touchui', {'control': 'rfOn'});
                }
                else if (rightTouchStartPos.y - touch.clientY < 0) {
                    message.right = "backward";
                    console.log("right backward");
                    socket.emit('touchui', {'control': 'rbOn'});
                }
                //}


                rightTouchPos.reset(touch.clientX, touch.clientY);
                rightVector.copyFrom(rightTouchPos);
                rightVector.minusEq(rightTouchStartPos);
            }
        }


        touches = e.touches;

    }

    function onTouchEnd(e) {

        touches = e.touches;

        for (var i = 0; i < e.changedTouches.length; i++) {
            var touch = e.changedTouches[i];
            if (leftTouchID == touch.identifier) {
                leftTouchID = -1;
                leftVector.reset(0, 0);
                message.left = "off";
                console.log("left off");
                socket.emit('touchui', {'control': 'lfOff'});
                socket.emit('touchui', {'control': 'lbOff'});
                //break;
            }

            if (rightTouchID == touch.identifier) {
                rightTouchID = -1;
                rightVector.reset(0, 0);
                message.right = "off";
                console.log("right off");
                socket.emit('touchui', {'control': 'rfOff'});
                socket.emit('touchui', {'control': 'rbOff'});
                //break;
            }

            if (shootTouchID == touch.identifier) {
                shootTouchID = -1;
                message.shoot = "off";
                console.log("shooting off");
                socket.emit('touchui', {'control': 'shootOff'});
                //break;
            }

        }

    }

    function onMouseMove(event) {

        mouseX = event.offsetX;
        mouseY = event.offsetY;
    }


    function setupCanvas() {

        canvas = document.createElement('canvas');
        c = canvas.getContext('2d');
        container = document.createElement('div');
        container.className = "container";

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        document.body.appendChild(container);
        container.appendChild(canvas);

        //canvas.requestFullscreen();

        resetCanvas();

        c.strokeStyle = "#ffffff";
        c.lineWidth = 2;
    }

}