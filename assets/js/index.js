var webRTC;

var users = 1;

var roomID = "";

var currentRowID = "row_one";

$(document).ready(function() {

    $('.menu').hide();

    console.log("Document ready...");

    startSession();
    setupListeners();

    checkLink();

    setInterval(checkDomChange, 150);

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
        remoteVideosEl: currentRowID,
        autoRequestMedia: true
    });

    webRTC.on('connectionReady', function(sessionID) {
        console.log("Ready to connect!");
        console.log("Session ID: " + sessionID);
    });

    webRTC.on('createdPeer', function(peer) {
        console.log("Create peer!");
        console.log("Peer: " + peer);
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
        console.log("Peer stream added!");
        console.log(peer);
        updateVideos();
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
    var peersPresent = document.getElementsByTagName("video").length;
    var peersJoined = users;

    if(peersPresent != peersJoined) {
        $('video').addClass('column');

        // Peer joined
        if(peersPresent > peersJoined) {
            users = peersPresent;

            if((peersPresent+1) % 4 == 0 && peersJoined-peersPresent == 1) {
                currentRowID = randomID();
                $('#videos').add('<div class="row" id="' + currentRowID + '"></div>');
                webRTC.remoteVideosEl = currentRowID;
            }

        } else if(peersPresent < peersJoined) {
            users = peersPresent;

        }
    }
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

function checkDomChange() {
    updateVideos();
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


