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
        "Someone reinforces right next to Mira's window"
    ]
};

var usedObjectives = [];

const innerRingIDs = ["cb7", "cb8", "cb9", "cb12", "cb14", "cb17", "cb18", "cb19"];
const outerRingIDs = ["cb1", "cb2", "cb3", "cb4", "cb5", "cb6", "cb10", "cb11", "cb15", "cb16", "cb20", "cb21", "cb22", "cb23", "cb24", "cb25"];


window.addEventListener('load', (event) => {
    var checkboxes = document.querySelectorAll('input.bingo-checkbox');
    for (var i = 0; i < checkboxes.length; i++) {
        var cbParent = document.getElementById(checkboxes[i].id).parentElement;
        var cbText = cbParent.getElementsByTagName("p")[0];
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
        
        cbText.innerHTML = displayText;
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
}
