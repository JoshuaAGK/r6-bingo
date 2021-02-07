const objectives = {
    "inner": [
        "Ash is picked",
        "Clash is picked"
    ],
    "outer": [
        "Mozzie drone gets shot by a defender",
        "Amaru dies immediately",
        "Spawnkilled",
        "Nobody has reinforced anything",
        "Someone screaming over voice chat",
        "The world's least-descriptive callout",
        '"How was that a headshot?"',
        '"How was that not a headshot?"',
        "No defenders are on objective",
        "Teamkilled",
        "Connection error",
        "Someone reinforces the walls between bombs",
        "Doc uses all of his stims on himself",
        "Get a wallbang or get wallbanged",
        "Someone gets a kill while they're flashed",
        "Castle barricades the objective doors",
        "Iana runs right into a laser gate",
        "Interrogation",
        "Maverick gets shot through his own hole",
        "Multiple hardbreachers and no Thatcher",
        "The whole team are Recruits",
        "Text remiains on the screen for the entire match",
        "No Kaid or Bandit on garage doors",
        "Rage quitter",
        "Frost traps placed in stupid locations",
        'Someone makes a "Potato PC" joke while loading',
        "Someone on the opposite/<wbr>wrong side of the map",
        "Top fragger has an anime profile picture",
        "Someone empties an entire magazine to hit a drone",
        "Finka forgets to heal the team",
        "Attacker with the defuser dies alone & far away",
        "Someone reinforces the rotation hole",
        "Someone reinforces right next to Mira's window",
        "Banwave",
        "Didn't see an opponent for the entire round",
        "Last friendly operator alive is roaming"
    ]
};

var usedObjectives = [];

const innerRingIDs = ["p0b7", "p0b8", "p0b9", "p0b12", "p0b14", "p0b17", "p0b18", "p0b19"];
const outerRingIDs = ["p0b1", "p0b2", "p0b3", "p0b4", "p0b5", "p0b6", "p0b10", "p0b11", "p0b15", "p0b16", "p0b20", "p0b21", "p0b22", "p0b23", "p0b24", "p0b25"];


window.addEventListener('load', (event) => {
    var checkboxes = document.querySelectorAll('#table-me input.bingo-checkbox');
    for (var i = 0; i < checkboxes.length; i++) {
        var p0bParent = document.getElementById(checkboxes[i].id).parentElement;
        var p0bText = p0bParent.getElementsByTagName("p")[0];
        var displayText = "";
                
        if (innerRingIDs.includes(checkboxes[i].id) || outerRingIDs.includes(checkboxes[i].id)) {    
            do {
                var rand = parseInt(Math.random() * objectives.outer.length);
            } while (usedObjectives.includes(rand));
            usedObjectives.push(rand);
            displayText = objectives.outer[rand];
        } else {
            var rand = parseInt(Math.random() * objectives.inner.length);
            displayText = objectives.inner[rand];
        }
        
        p0bText.innerHTML = displayText;
    }
    
    var os = null;
    const platform = String(window.navigator.platform).toLowerCase();
    
    if (platform.includes("win")) {
        document.getElementById("meta-windows-browser").checked = true;
    } else {
        document.getElementById("meta-unix-browser").checked = true;
    }
    
});

function checkSquare(e) {
   
    if (innerRingIDs.includes(e.id)) {
        console.log("inner ring");
    } else if (outerRingIDs.includes(e.id)) {
        console.log("outer ring");
    } else {
        console.log("centre");
    }
    
    
    sendMessage(null, e.id + "/" + e.checked)
}

function hostGame() {
    document.getElementById("menu-controls").className = "hostmenu";
}


var clientPeer = null;
var clientConn = null;
var clientUserArray = [];
function joinGame() {
    document.getElementById("menu-controls").className = "joinmenu";
    
    // Create own peer object with connection to shared PeerJS server
    clientPeer = new Peer(null, {
        debug: 2
    });

    clientPeer.on('open', function (id) {
        clientUserArray = [clientPeer.id, "host"];

        console.log('ID: ' + clientPeer.id);
    });
    clientPeer.on('connection', function (c) {
        // Disallow incoming connections
        c.on('open', function() {
            c.send("Sender does not accept incoming connections");
            setTimeout(function() { c.close(); }, 500);
        });
    });
    clientPeer.on('disconnected', function () {
        console.log('Connection lost. Please reconnect');

        // Workaround for peer.reconnect deleting previous id
        clientPeer.id = lastPeerId;
        clientPeer._lastServerId = lastPeerId;
        clientPeer.reconnect();
    });
    clientPeer.on('close', function() {
        clientConn = null;
        console.log('Connection destroyed');
    });
    clientPeer.on('error', function (err) {
        console.log(err);
        alert('' + err);
    });
    
}

function goBack() {
    document.getElementById("menu-controls").className = "mainmenu";
}

var peer1 = null;
var conn1 = null;
var peer2 = null;
var conn2 = null;

var hostUserArray = ["host"];

function beginHost() {
    const roomID = "r6bingo-" + document.getElementById("lobbydata-roomid").value;
    const slot1 = roomID + "-0";
    const slot2 = roomID + "-1";
    
    peer1 = new Peer(slot1);
    peer1.on('open', function (id) {
        console.log('ID: ' + peer1.id);
        console.log("Awaiting connection...");
    });
    peer1.on('connection', function (c) {
        if (conn1 && conn1.open) {
            c.on('open', function() {
                c.send("Slot busy");
                setTimeout(function() { c.close(); }, 100);
            });
            return;
        } else {
            conn1 = c;
            if (!hostUserArray.includes(c.peer)) {
                hostUserArray.push(c.peer);
            }
            ready1();
            
        }
        
        console.log("Connected to: " + c.peer);
    });
    function ready1() {
        conn1.on('open', function () {
            sendHostArrayToAllClients();
        });
        conn1.on('data', function (data) {
            receiveDataFromClient(conn1.peer, data);
        });
        conn1.on('close', function () {
            console.log(new Date().toISOString(), "Connection lost");
            conn1 = null;
        });
    }
    
    peer2 = new Peer(slot2);
    peer2.on('open', function (id) {
        console.log('ID: ' + peer2.id);
        console.log("Awaiting connection...");
    });
    peer2.on('connection', function (c) {
        if (conn2 && conn2.open) {
            c.on('open', function() {
                c.send("Slot busy");
                setTimeout(function() { c.close(); }, 100);
            });
            return;
        } else {
            c.send(hostUserArray);
            conn2 = c;
            ready2();
            if (!hostUserArray.includes(c.peer)) {
                hostUserArray.push(c.peer);
            }
        }
        
        console.log("Connected to: " + c.peer);
    });
    function ready2() {
        conn2.on('open', function () {
            sendHostArrayToAllClients();
        });
        conn2.on('data', function (data) {
            receiveDataFromClient(conn2.peer, data);
        });
        conn2.on('close', function () {
            console.log(new Date().toISOString(), "Connection lost");
            conn2 = null;
        });
    }
    
    var mainWrapper = document.getElementById("main-wrapper");
    mainWrapper.className = "game-wrapper";
}

function beginJoin(joinslot = 0) {
    var roomID = "r6bingo-" + document.getElementById("lobbydata-roomid").value + "-" + joinslot;
    var slotBusy = false;

    // Close old connection
    if (clientConn) {
        clientConn.close();
    }
    
    console.log(roomID);

    // Create connection to destination peer specified in the input field
    clientConn = clientPeer.connect(roomID, {
        reliable: true
    });
    
    clientConn.on('open', function () {
        console.log("Connected to: " + clientConn.peer);
        
        var mainWrapper = document.getElementById("main-wrapper");
        mainWrapper.className = "game-wrapper";
        
    });
    // Handle incoming data (messages only since this is the signal sender)
    clientConn.on('data', function (data) {
        if (data == "Slot busy") {
            slotBusy = true;
        } else {
            receiveDataFromHost(data);
        }
    });
    clientConn.on('close', function () {
        console.log("Connection closed");
        if (slotBusy && joinslot < 2) {
            joinslot++;
            beginJoin(joinslot);
        }
    });
    
    
}


function receiveDataFromHost(data) {
    if (Array.isArray(data)) {
        
        data = data.filter(function(item) {
            return item !== clientPeer.id;
        })
        data = data.filter(function(item) {
            return item !== "host";
        })
        
        clientUserArray.push(...data);
        console.log(clientUserArray);
    } else {
        console.log(data);
        var sender = data.split(": ")[0];
        data = data.split(": ")[1]
        var userNum = clientUserArray.indexOf(sender);
    
        data = data.split("/");
        var cellNumber = "p" + userNum + "b" + data[0].substr(3);
        console.log(cellNumber);

        var checkBool = (data[1] == "true");
        document.getElementById(cellNumber).checked = checkBool;
    }
    
    
    
}

function receiveDataFromClient(sender, data) {
    sendMessage(sender, data);
    
    var userNum = hostUserArray.indexOf(sender);
    
    data = data.split("/");
    var cellNumber = "p" + userNum + "b" + data[0].substr(3);
    console.log(cellNumber);
    
    var checkBool = (data[1] == "true");
    document.getElementById(cellNumber).checked = checkBool;
    
}

function sendHostArrayToAllClients() {
    if (conn1 && conn1.open) {
        conn1.send(hostUserArray);
    }
    if (conn2 && conn2.open) {
        conn2.send(hostUserArray);
    }
}

function sendMessage(forwarder = null, input = null) {    
    var userNum = 0;
    var cellPrefix = "";
    
    if (input == null) {
        input = document.getElementById("userdata-username").value;
    }
    if (forwarder == null) {
        forwarder = "host";
    }
    
    userNum = hostUserArray.indexOf(forwarder);
    cellPrefix = "p" + userNum + "b";
    
    
    input = input.split("/");
    input = cellPrefix + input[0].substr(3) + "/" + input[1];
    
    
    
    
    
    
    if (conn1 && conn1.open && forwarder != conn1.peer) {
        conn1.send(forwarder + ": " + input);
    }
    if (conn2 && conn2.open && forwarder != conn2.peer) {
        conn2.send(forwarder + ": " + input);
    }
    if (clientConn && clientConn.open) {
        clientConn.send(input);
        console.log("Sent: " + input)
    }
    
    
}