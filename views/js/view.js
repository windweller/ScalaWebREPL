$(document).ready(function() {
  CodeMirror.fromTextArea(document.getElementById("code"), {
    lineNumbers: false,
    matchBrackets: true,
    mode: "text/x-scala"
  });
  //communicate with WebSocket
//    webSocket.receive(function(data) {
//        $(".deck-codemirror-result").text(data);
//    });

    //cleanup button
    $(".CodeMirror .button")[0].onclick(function(e) {
        $(".deck-codemirror-result").text("");
    });

    //run button
    $(".CodeMirror .button")[1].onclick(function(e) {
        webSocket.send($(".code").val());
    });
});