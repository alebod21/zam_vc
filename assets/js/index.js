var webRTC;

var users = 1;
var roomID = "";

// Save peer's sessionID to videoID
var peerVideos = {};

var currentColumnID = "";

var url = "https://www.zam.io/";

$(document).ready(function() {
    console.log("Document ready...");
    $("#videos").css("padding-top", "0px");

    startSession();
    setupListeners();

    checkLink();
});


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


function submitForm() {
    var username = $('#username').val();
    var joinRoom = $('#join_room').is(':checked');
    roomID = $('#room_id').val();

    if(username && username != " ") {
        if (joinRoom) {
            if(roomID && roomID != " ") {
                connect(roomID);
                transition();
            } else {
                highlightField($("#room_id"));
            }
        } else {
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

    webRTC.on('connectionReady', function(sessionID) {
        console.log("Ready to connect!");
        console.log("Session ID: " + sessionID);
    });

    webRTC.on('createdPeer', function(peer) {
        console.log("Create peer!");
        console.log("Peer: " + peer);
        updateVideos();
    });

    webRTC.on('videoAdded', function(videoEl, peer) {
        $("#" + currentColumnID).append(videoEl);
        $("#" + currentColumnID).append("<div class=\"blurring dimmable image\" style=\"width: 100%; height: 100%; padding: 15px;\">" +
           "<div class=\"ui dimmer\">" +
           "<div class=\"content header\">" +
           "<h1 class='username'>USERNAME</h1>" +
           "</div>" +
           "<div class=\"content message_board\">" +
           "<div class=\"center\">" +
           "<div class=\"ui inverted button\">Message</div>" +
           "</div>" +
           "</div>" +
           "</div>" +
           "</div>");

        peerVideos[peer.sessionId] = currentColumnID;
    });

    webRTC.on('stunservers', function(args) {
        console.log("Connected to STURN servers!");
        console.log("Args: " + args);
    });

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
    $('#room_id_show').text(roomID);
    $(".menu").removeClass("hidden");

    $(".image").dimmer({on: "hover"});
    // $(".column").on("hover", function() {
    //     $(this).children(".image .dimmer .content .header .username").text("It worked!");
    // });

    $("#videos").css("padding-bottom", "10px");
}

// Adds a users video stream to the view
function updateVideos() {
    if(users % 4 == 0) {
        // Row Full
        $("#videos").append('<div class="row"></div>');
    }

    addColumn();

    if(users == 1) {
        // Set Two columns
        $("#videos").addClass("two");
        $("#videos").removeClass("one column");
        $("#videos").css("padding-top", "50px");
    } else if(users == 2) {
        // Set Three Columns
        $("#videos").addClass("three column");
        $("#videos").removeClass("two column");
    } else if(users == 3) {
        // Set Four Columns
        $("#videos").addClass("four column");
        $("#videos").removeClass("three column");
    }

    $("#videos").addClass("column");

    users++;

}

function addColumn() {
    currentColumnID = randomID();
    $("#videos .row").last().append('<div id="' + currentColumnID  + '" class="column"></div>');
    webRTC.remoteVideosEl = currentColumnID;
}

// Utils

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

window.onbeforeunload = function() {
    // close any connections before the window closes
    if(webRTC) {
        webRTC.leaveRoom();
    }
};


