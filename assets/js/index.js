var webRTC;

var users = 1;
var roomID = "";
var username = "";

// Save peer to username
var peerUsernames = {};

var currentColumnID = "";

var url = "";
var maxColumnCount = 4;


$(document).ready(function() {
    console.log("Document ready!");
    $("#videos").css("padding-top", "0px");
    $(".menu").hide();

    startSession();
    setupListeners();

    checkLink();

    setInterval(sync, 750);
});

function submitForm() {
    var username = $('#username').val();
    var joinRoom = $('#join_room').is(':checked');
    var fieldRoomID = $('#room_id').val();

    if(username && username != " ") {
        if (joinRoom) {
            if(fieldRoomID && fieldRoomID != " ") {
                this.username = username;
                connect(fieldRoomID);
                transition();
            } else {
                highlightField($("#room_id"));
            }
        } else {
            this.username = username;
            transition();
            createRoom();
        }
    } else {
        highlightField($('#username'));
    }
}

// Creates/Joins a Session
function startSession() {
    console.log("Starting session...");

    webRTC = new SimpleWebRTC({
        localVideoEl: 'my_video',
        remoteVideosEl: currentColumnID,
        autoRequestMedia: true
    });

    // Connected to servers
    webRTC.on('connectionReady', function(sessionID) {
        console.log("Ready to connect!");
        console.log("Session ID: " + sessionID);
    });

    // On new peer connection to the room
    webRTC.on('createdPeer', function(peer) {
        console.log("Create peer!");
        console.log("Peer: " + peer);
        updateVideos(true);
    });

    // Physical video element created
    webRTC.on('videoAdded', function(videoEl, peer) {
        $("#" + currentColumnID).append("<div class=\"ui dimmer\" style=\"margin: 0px; padding: 15px; \">" +
            "<div class=\"content\">" +
            "<div class=\"center\">" +
            "<h1 class='username'>USERNAME</h1>" +
            "</div>" +
            "</div>" +
            "</div>");
        $("#" + currentColumnID).append(videoEl);

        $(".dimmer").dimmer({on: "hover"});
    });

    // Listen to peer messages
    webRTC.on('channelMessage', function(oPeer, sLabel, oData) {

        // update the user's local username
      if(sLabel == "info") {

          // Peer info channel
          if(oData.type == "username_update") {

            // Updates peer usernames
            var username = oData.payload['username'];
            if(username) {
              peerUsernames[oPeer] = username;
              var parent = $("#" + oPeer.id + "_video_incoming").parent();
              console.log("Parent " + parent);
              var child = parent.children(".ui .dimmer").children(".content").children(".center").children(".username").first();
              child.text(username.toUpperCase());
            }
          }
      }
    });

    webRTC.on('connectivityError', function (peer) {
       peer.reconnect();
       console.log("ERROR!");
    });

    // Called when a video feed is stopped
    webRTC.on('videoRemoved', function(videoEl, peer) {
        console.log("#" + peer.id + "_video_incoming");
        $("#" + peer.id + "_video_incoming").parent().remove();
        updateVideos(false);
    });

    // Called when connected to STURN servers
    webRTC.on('stunservers', function(args) {
        console.log("Connected to STURN servers!");
        console.log("Args: " + args);
    });

    // Called when connected to TURN servers
    webRTC.on('turnservers', function(args) {
        console.log("Connected to TURN servers!");
        console.log("Args: " + args);
    });
}

function connect(roomID) {
    if(webRTC) {
        webRTC.joinRoom(roomID, function() {
            this.roomID = roomID;
            console.log("joined room: " + roomID);
            transition();
        });
    }
}

function createRoom() {
    if(webRTC) {
        roomID = randomID();
        webRTC.createRoom(roomID, function() {
            console.log("created room: " + roomID);
            transition();
        });
    }
}

// Transitions the UI to conversation mode

function transition() {
    $('#form').hide();
    $('#my_video').removeClass('blur');
    $('#room_id_show').text(url + roomID);
    $(".menu").show();

    // $(".column").on("hover", function() {
    //     $(this).children(".image .dimmer .content .header .username").text("It worked!");
    // });

    $("#videos").css("padding-bottom", "10px");
}

// Adds a users video stream to the view
function updateVideos(joined) {
    // Called when a new user is about to leave
    if(joined) {
        if (users % maxColumnCount == 0) {
            // Row Full
            $("#videos").append('<div class="row"></div>');
        }

        addColumn();

        $("#videos").addClass("column");
        $("#videos").css("padding-top", "50px");

        users++;
    } else {
        // Called when a user has left
        users--;
        if(users == 1) {
            $("#videos").css("padding-top", "0px");
        }
    }

}

function addColumn() {
    currentColumnID = randomID();
    $("#videos .row").last().append('<div id="' + currentColumnID  + '" class="column"></div>');
    webRTC.remoteVideosEl = currentColumnID;
}

// Utils

// Check whether the link corresponds to an existing room
function checkLink() {
    var loc = window.location.href.split('/');
    var room = loc[loc.length-1];

    if(room && room != " ") {
        $('#join_room').prop('checked', true);
        $('#room_id_div').removeClass('hidden');
        $('#room_id').val(room);
    }
}

function highlightField(field) {
    field.addClass('highlighted');
}

function randomID() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 5; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

function shareUsername() {
    webRTC.sendDirectlyToAll("info", "username_update", {"username": username});
}
// Semantic Listeners

function setupListeners() {
    $('.ui.checkbox').checkbox().first().checkbox({
        onChecked: function() {
            $('#room_id_div').removeClass('hidden');
        },
        onUnchecked: function() {
            $('#room_id_div').addClass('hidden');
        }
    });


    // The username is the only required field
    // Activate button after it is filled in
    $('#username').on('keyup', checkButton);
    $('#room_id').on('keyup', checkButton);
    $('#join_room').on('change', checkButton);


    $('video').resizable({
        handleSelector: '.splitter',
        resizeHeight: true,
        resizeWidth: true
    })
}

// Check whether to re-enable the submit button
function checkButton(event) {
    console.log(event);
    var text = $(this).val();
    if(!text || text == ' ') {
        $('.button.primary').addClass('disabled');
    } else {
        var checked = $('#join_room').is(':checked');
        var room_id = $('#room_id').val();
        if(!checked || (checked && room_id && room_id != " ")) {
            $('.button.primary').removeClass('disabled');
        } else {
            $('.button.primary').addClass('disabled');
        }
    }
}


function sync() {
    if(roomID && users > 1) {
        shareUsername();
    }
}

window.onbeforeunload = function() {
    // close any connections before the window closes
    if(webRTC) {
        webRTC.leaveRoom();
    }
};


