var webRTC;

var users = 1;

var roomID = "";

$(document).ready(function() {

    $('.menu').hide();

    console.log("Document ready...");

    startSession();
    setupListeners();

});


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
        remoteVideosEl: 'videos',
        autoRequestMedia: true
    });

    webRTC.on('connectionReady', function(sessionID) {
        console.log("Ready to connect!");
        console.log("Session ID: " + sessionID);
    });

    webRTC.on('createdPeer', function(peer) {
        console.log("Create peer!");
        console.log("Peer: " + peer);
        setTimeout(updateVideos, 500);
    });

    webRTC.on('stunservers', function(args) {
        console.log("Connected to STURN servers!");
        console.log("Args: " + args);
    });

    webRTC.on('turnservers', function(args) {
        console.log("Connected to TURN servers!");
        console.log("Args: " + args);
    });

    webRTC.handlePeerStreamAdded = function(peer) {

    };
}

function connect(roomID) {
    if(webRTC) {
        webRTC.joinRoom(roomID, function() {
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
    $(".menu").show();
}

// Adds a users video stream to the view
function updateVideos() {
    $('video').addClass('column');
    // if(joined) {
    //     removeClassses($('#videos'));
    //     $('#videos').addClass(convert_number(users + 1), 'column');
    //     $('#videos').removeClass(convert_number(users), 'column');
    //     users++;
    // } else {
    //     removeClassses($('#videos'));
    //     $('#videos').addClass(convert_number(users - 1), 'column');
    //     $('#videos').removeClass(convert_number(users), 'column');
    //     users--;
    // }
}

function removeClassses(element) {
    for(element in element.classesToArray()) {
        console.log(element);
    }
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


