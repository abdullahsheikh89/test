var RTCPeerConnection = window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
var IceCandidate = window.mozRTCIceCandidate || window.RTCIceCandidate;
var RTCSessionDescription = window.mozRTCSessionDescription || window.RTCSessionDescription;
navigator.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia;
var localStream = null;
var remoteStream = null;
var socket = null;
var pc = null;
function endCall() {
  var videos = document.getElementsByTagName("video");
  for (var i = 0; i < videos.length; i++) {
    videos[i].pause();
  }

  pc.close();
}

function successCallback (succ) {
   console.log("Success",succ);
}
function failureCallback (err) {
    console.log("Error",err);
}

function error(err) {
  endCall();
}

jQuery(document).ready(function($) {

    socket = io.connect();
    pc = new RTCPeerConnection(null);
    pc.onaddstream = function (stream) {
       var vid = $("<video autoplay style='margin-right:10px;'></video>");
      $(".videos").append(vid);
      $(vid).attr("src",URL.createObjectURL(stream.stream));
    }
    console.log("socket",socket);
    navigator.getUserMedia({audio:true,video:true},function (stream) {
      pc.onaddstream({stream: stream});
      pc.addStream(stream);


    },function (err) {
        console.log("Error",err);
    });

     $("#btnCall").click(function(event) {
         pc.createOffer(function (offer) {
             pc.setLocalDescription(new RTCSessionDescription(offer),function () {
                 console.log(offer);
                 socket.emit("offer",offer);

             },error);
         },error);
      });

     socket.on("answer",function (offer) {
        console.log("offer",offer);
        $("#answer").show();
        $("#btnAnswer").click(function(event) {
            pc.setRemoteDescription(new RTCSessionDescription(offer),function () {
                pc.createAnswer(function (answer) {
                   pc.setLocalDescription(new RTCSessionDescription(answer),function () {
                    console.log(answer);
                     socket.emit("answer_replay",answer);
                   },error)
                },error)
            },error)
        });
        
     });

     socket.on("replay",function (answer) {
        console.log("answer",answer);
         pc.setRemoteDescription(new RTCSessionDescription(answer), function() { }, error);
     });

     pc.onicecandidate = function(ev) { 
        if(ev.candidate != null) {
            console.log(ev);
            socket.emit("sendIceCandidate",ev.candidate);
          }
            
    };

    socket.on("recIceCandidate",function (candidate) {
       pc.addIceCandidate(new RTCIceCandidate({
            sdpMLineIndex: candidate.sdpMLineIndex,
            candidate    : candidate.candidate,
            sdpMid : candidate.sdpMid
        }), successCallback, failureCallback);
    });

    // var channel = pc.createDataChannel("Mydata");
    // channel.onopen = function(event) {
    //   channel.send('sending a message');
    // }
    // channel.onmessage = function(event) { 
    //     $("p").text(event.data); 
    // }

});