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
    
    const platform = String(window.navigator.platform).toLowerCase();
    
    if (platform.includes("win")) {
        document.getElementById("meta-windows-browser").checked = true;
    } else {
        document.getElementById("meta-unix-browser").checked = true;
    }
});


class User {
    constructor(uid = null, userArray = [], userType = "client") {
        this.username = null;
        this.uid = uid;
        this.userArray = userArray;
        this.userType = userType;
        this.userDictionary = {
            host: this.username
        };
    }
    
    
    set checkSquare(e) {
        var thisparent = this;
        this.sendMessage = {
            sender: thisparent.uid,
            data: [e.id, e.checked],
            meta: "checkSquare"
        }
    }
    
    
    set sendMessage(param) {
        var thisparent = this;
        var data = param.data;
        var sender = param.sender;
        var meta = param.meta;
        var userNum = 0;
        var cellPrefix = "";


        if (this.userType == "client") {
            if (this.clientConn && this.clientConn.open) {
                this.clientConn.send(param);
            }
        } else {
            if (meta == "userArray" || meta == "userDict") {
                for (var i = 0; i < this.conns.length; i++) {
                    if (this.conns[i] && this.conns[i].open && sender != this.conns[i].peer) {
                        this.conns[i].send(param);
                    }
                }
            } else {
                userNum = this.userArray.indexOf(param.sender);
                cellPrefix = "p" + userNum + "b";

                data = [cellPrefix + data[0].substr(3), data[1]];

                for (var i = 0; i < this.conns.length; i++) {
                    if (this.conns[i] && this.conns[i].open && sender != this.conns[i].peer) {
                        this.conns[i].send({
                            sender: sender,
                            data: data,
                            meta: meta
                        });
                    }
                }
            }
        }
    }
}


class Host extends User {
    constructor(uid = "host", userArray = ["host"], userType = "host") {
        super(uid, userArray, userType);
        this.peers = [null, null, null, null];
        this.conns = [null, null, null, null];
    }
    

    get beginHost() {
        typeUsername();
        for (var i = 0; i < this.peers.length; i++) {
            const roomID = "r6bingo-" + document.getElementById("lobbydata-roomid").value + "-" + i;
            this.peers[i] = new Peer(roomID);
            var thisparent = this;

            this.peers[i].on('connection', function(c) {
                var connIndex = parseInt(this.id[String(this.id).length - 1]);
                if (thisparent.conns[connIndex] && thisparent.conns[connIndex].open) {
                    c.on('open', function() {
                        c.send("Slot busy");
                        setTimeout(function() { c.close(); }, 100);
                    });
                    return;
                } else {
                    thisparent.conns[connIndex] = c;
                    if (!thisparent.userArray.includes(c.peer)) {
                        thisparent.userArray.push(c.peer);
                    }
                    
                    ready(connIndex);
                    console.log("Connected to: " + c.peer);
                }
            });

            function ready(j) {
                thisparent.conns[j].on('open', function () {
                    thisparent.sendMessage = {
                        data: thisparent.userArray,
                        sender: thisparent.uid,
                        meta: "userArray"
                    } 
                });
                thisparent.conns[j].on('data', function (data) {
                    thisparent.receiveDataFromClient = data;
                });
                thisparent.conns[j].on('close', function () {
                    console.log(new Date().toISOString(), "Connection lost");
                    thisparent.conns[j] = null;
                });
            }
        }
        
        var mainWrapper = document.getElementById("main-wrapper");
        mainWrapper.className = "game-wrapper";
    }
    
    
    set receiveDataFromClient(param) {
        var sender = param.sender;
        var data = param.data;
        var meta = param.meta;
        
        var tables = document.querySelectorAll(".user-table");
        var usernames = document.querySelectorAll(".user-name");
                
        if (meta == "checkSquare") {
            var userNum = this.userArray.indexOf(sender);

            var cellNumber = "p" + userNum + "b" + data[0].substr(3);

            document.getElementById(cellNumber).checked = data[1];
            
            this.sendMessage = ({
                sender: sender,
                data: data,
                meta: "forward"
            });
        } else if (meta == "username") {
            this.userDictionary[sender] = data;
            this.sendMessage = {
                data: this.userDictionary,
                sender: this.uid,
                meta: "userDict"
            }
            for (var i = 0; i < this.conns.length; i++) {
                if (this.conns[i] != null && this.conns[i].peer == sender) {
                    usernames[i + 1].innerHTML = data;
                }
            }
        } else {
            console.log("how did I get here?", param)
        }
    }
}


class Client extends User {
    constructor(uid = null, userArray = [], userType = "client") {
        super(uid, userArray, userType);
        this.clientPeer = null;
        this.clientConn = null;
    
        var thisparent = this;
        // Create own peer object with connection to shared PeerJS server
        this.clientPeer = new Peer(null, {
            debug: 2
        });

        this.clientPeer.on('open', function (id) {
            thisparent.userArray = [thisparent.clientPeer.id, "host"];
            thisparent.uid = thisparent.clientPeer.id;
            console.log('My uid: ' + thisparent.clientPeer.id);
        });
        this.clientPeer.on('connection', function (c) {
            // Disallow incoming connections
            c.on('open', function() {
                c.send("Sender does not accept incoming connections");
                setTimeout(function() { c.close(); }, 500);
            });
        });
        this.clientPeer.on('disconnected', function () {
            console.log('Connection lost. Please reconnect');

            // Workaround for peer.reconnect deleting previous id
            thisparent.clientPeer.id = lastPeerId;
            thisparent.clientPeer._lastServerId = lastPeerId;
            thisparent.clientPeer.reconnect();
        });
        this.clientPeer.on('close', function() {
            thisparent.clientConn = null;
            console.log('Connection destroyed');
        });
        this.clientPeer.on('error', function (err) {
            console.log(err);
            alert('' + err);
        });
    }
    
    
    set beginJoin(joinslot = 0) {
        typeUsername();
        var roomID = "r6bingo-" + document.getElementById("lobbydata-roomid").value + "-" + joinslot;
        var slotBusy = false;
        var thisparent = this;

        // Close old connection
        if (this.clientConn) {
            this.clientConn.close();
        }

        console.log("Attempting to connect to: " + roomID);

        // Create connection to destination peer specified in the input field
        this.clientConn = this.clientPeer.connect(roomID, {
            reliable: true
        });

        this.clientConn.on('open', function () {
            console.log("Connected to: " + thisparent.clientConn.peer);

            var mainWrapper = document.getElementById("main-wrapper");
            mainWrapper.className = "game-wrapper";
            thisparent.sendMessage = {
                sender: thisparent.uid,
                data: thisparent.username,
                meta: "username"
            };

        });
        // Handle incoming data (messages only since this is the signal sender)
        this.clientConn.on('data', function (data) {
            if (data == "Slot busy") {
                slotBusy = true;
            } else {
                thisparent.receiveDataFromHost = data;
            }
        });
        this.clientConn.on('close', function () {
            console.log("Connection closed");
            if (slotBusy && joinslot < 2) {
                joinslot++;
                thisparent.beginJoin = joinslot;
            }
        });
    }
    
    
    set receiveDataFromHost(param) {
        var thisparent = this;
        var tables = document.querySelectorAll(".user-table");
        var usernames = document.querySelectorAll(".user-name");
                
        if (param.meta == "userArray") {
            param.data = param.data.filter(function(item) {
                return item !== thisparent.clientPeer.id;
            })
            param.data = param.data.filter(function(item) {
                return item !== "host";
            })

            var tempArray = thisparent.userArray;
            tempArray.push(...param.data);
            thisparent.userArray = [...new Set(tempArray)];
            console.log("All users:", thisparent.userArray);
        } else if (param.meta == "userDict") {
            thisparent.userDictionary = param.data;
            console.log("Dictionary:", thisparent.userDictionary);
            for (var i = 0; i < thisparent.userArray.length; i++) {
                usernames[i].innerHTML = thisparent.userDictionary[thisparent.userArray[i]];
            }
        } else {
            var data = param.data
            var userNum = this.userArray.indexOf(param.sender);

            var cellNumber = "p" + userNum + "b" + param.data[0].substr(3);

            document.getElementById(cellNumber).checked = param.data[1];
        }
    }
}

var user = new User;


function hostGame() {
    document.getElementById("menu-controls").className = "hostmenu";
    user = new Host;
}


function joinGame() {
    document.getElementById("menu-controls").className = "joinmenu";
    user = new Client;
}


function goBack() {
    document.getElementById("menu-controls").className = "mainmenu";
}

function typeUsername() {
    var username = document.getElementById("userdata-username").value;
    user.username = username;
    user.userDictionary.host = username;
    document.querySelectorAll(".user-name")[0].innerHTML = username;
}