/*
 webSocket Secure Library v0.1.0 - Modified
 http://windweller.info

 Copyright 2012, Allen Nie
 Licensed under the MIT license.

 Requires jQuery
 Compatible with IE9+, Chrome, Firefox, Safari.

 Warning: this library has been modified to better
 serve the localhost enviornment

 Usage
 1. Change the URI address on new WS("your address")
 2. Go ahead and use this library
 */

var webSocket = (function() {
    'use strict';

    var WS = window['MozWebSocket'] ? MozWebSocket : WebSocket;
    // "ws://mindandlanguagelab.com:6696/ws/script"
    var scriptSocket = new WS("ws://localhost:6696/ws/script");

    scriptSocket.onopen = function() {
        console.log("WebSocket server is ready.");
    };

    scriptSocket.onmessage = function(event) {
        $(".deck-codemirror-result").text(event.data);
    };

    scriptSocket.onerror = function(event) {
        console.log("There is an error occurring.");
    };

    function close() {
        scriptSocket.close();
    }

    function send(mesg) {
        if (typeof mesg === "string") {
            scriptSocket.send(mesg);
        }
    }

    return {
        socket: scriptSocket, //return to give user customizing option
        send: send
    };

}());