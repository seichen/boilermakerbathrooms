var building;
var floor;
var gender;
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var nodes = [];
var queue = [];
const OK = 0;
const ERR = -1;
var pathFound = false;

// Function to find distance between points
function dist(p1,p2) {
    x1 = parseInt(p1.x);
    y1 = parseInt(p1.y);
    x2 = parseInt(p2.x);
    y2 = parseInt(p2.y);
    return Math.sqrt(Math.pow(x2-x1, 2)+Math.pow(y2-y1, 2))
}

// Function to insert a node into the queue (lowest distance first)
function insertQueue(n) {
    var i = 0;
    // if empty
    if (!queue[i]) {
        queue.push(n);
        return OK
    }
    // find index to insert
    while (n.d > queue[i].d) {
        i++;
        if (i == queue.length) break;
    }
    // insert at end or index i
    if (i == queue.length) {
        queue.push(n)
    } else {
        queue.splice(i, 0, n);
    }
    return OK
}

// Function to remove a node from the queue
function removeQueue(n) {
    var i = 0;
    // find node and remove from queue
    for (i; i < queue.length; i++) {
        if (queue[i].x == n.x && queue[i].y == n.y) {
            queue.splice(i,1);
            return OK;
        }
    }
    return OK;
}

// Function to draw path between nodes
function drawPath(p) {
    var cur = p;
    while (cur.pr != -1) {
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(parseInt(cur.x),parseInt(cur.y));
        ctx.lineTo(parseInt(nodes[cur.pr].x),parseInt(nodes[cur.pr].y));
        ctx.stroke();
        cur = nodes[cur.pr];
    }
}

// Function for djikstras path
function djikstraPath() {
    // Start with first node
    var cur = nodes[0];
    // indexes
    var i = 0;
    var j = 0;
    // if node is a bathroom draw the path
    if (cur.b && (cur.g == gender || cur.g == 'both')) {
        drawPath(nodes[cur.p]);
        pathFound = true;
        return;
    }
    // Loop through connecting nodes and add them to the queue
    for (i; i < cur.c.length; i++) {
        // update the distance for all connecting nodes
        nodes[cur.c[i]].d = parseInt(cur.d) + dist(cur, nodes[cur.c[i]]);
        // set connecting nodes previous to current node
        nodes[cur.c[i]].pr = cur.p;
        // insert node into queue
        insertQueue(nodes[cur.c[i]]);
    }
    while ((cur = queue.shift()) != null) {
        console.log("queue shift: " + cur.p);
        // if node is a bathroom draw the path
        if (cur.b && (cur.g == gender || cur.g == 'both')) {
            drawPath(nodes[cur.p]);
            pathFound = true;
            break;
        }
        i = 0;
        // loop through connecting nodes
        for (i; i < cur.c.length; i++) {
            // check if node has been visited
            if (parseInt(nodes[cur.c[i]].d) == 999999) {
                // update distance if not visited
                nodes[cur.c[i]].d = parseInt(cur.d) + dist(cur, nodes[cur.c[i]]);
                // update previous node to current node
                nodes[cur.c[i]].pr = cur.p;
                // insert into queue
                insertQueue(nodes[cur.c[i]]);
            } else {
                // if it has been visited
                // check if distance is less
                if ((parseInt(cur.d) + dist(cur, nodes[cur.c[i]])) < parseInt(nodes[cur.c[i]].d)) {
                    // remove from queue
                    removeQueue(nodes[cur.c[i]]);
                    // update distance
                    nodes[cur.c[i]].d = parseInt(cur.d) + dist(cur, nodes[cur.c[i]]);
                    // update previous
                    nodes[cur.c[i]].pr = cur.p;
                    // insert into queue
                    insertQueue(nodes[cur.c[i]]);
                }
            }
        }
        // check counter
        j++;
        if (j > nodes.length * 2) {
            break;
        }
    }
    if (cur.b && (cur.g == gender || cur.g == 'both')) {
        console.log("path found");
    } else {
        console.log("No path found");
    }
    
}

// Find closest point on a line
function findClosestPoint(p1,p2,p3) {
    if (p2.p == 0) {
        return {
            "x": -1,
            "y": -1,
            "d": 999999,
            "c": [
                
            ],
            "b": false,
            "pr": -1,
            "p": -1,
            "v": false
        };
    }
    // Find all vertices
    x1 = parseInt(p1.x);
    y1 = parseInt(p1.y);
    x2 = parseInt(p2.x);
    y2 = parseInt(p2.y);
    x3 = parseInt(p3.x);
    y3 = parseInt(p3.y);
    // Find the slope
    var m = (y3-y2)/(x3-x2);
    // Find the intersection 
    var b = y2-(m*x2);
    // Find the intersection of second line
    var b2 = y1+((1/m)*x1);
    // Find the x and y of closest point
    var x = (b2-b)/(m+(1/m));
    var y = (-1/m)*x+b2;
    // set up node
    var r = {
        "x": x,
        "y": y,
        "d": 999999,
        "c": [
            p2.p, p3.p
        ],
        "b": false,
        "pr": -1,
        "p": 0,
        "v": false
    }
    console.log("closest point p2: " + p2.p);
    console.log("closest point p3: " + p3.p);
    console.log("closest point: " + x + ", " + y);
    // Find distance
    if (Math.abs(y3-y2) > Math.abs(x3-x2)) {
        if (y3 > y2) {
            if (y <= y3 && y >= y2) {
                r.d = dist(r, p1);
            }
        } else {
            if (y >= y3 && y <= y2) {
                r.d = dist(r, p1);
            }
        }
    } else {
        if (x3 > x2) {
            if (x <= x3 && x >= x2) {
                r.d = dist(r, p1);
            }
        } else {
            if (x >= x3 && x <= x2) {
                r.d = dist(r, p1);
            }
        }
    }
    console.log("closest point distance: " + r.d);
    return r;
}

// Function to add nodes to the node array
function addNodes(text) {
    const ns = JSON.parse(text);
    if (!ns) return ERR;
    var i = 0;
    for (i; i<ns.points.length;i++) {
        nodes.push(ns.points[i]);
    }
}

// Function to find closest node to point
function findClosest(p) {
    var n = nodes[0];
    var d = dist(p,n);
    var d2;
    var i = 1;
    for (i;i<nodes.length;i++) {
        d2 = dist(p,nodes[i]);
        if (d2 < d) {
            d = d2;
            n = nodes[i];
        }
    }
    return n;
}

// Function to find the shortest path to bathroom
function findPath(p) {
    queue = [];
    nodes = [];
    // first find text doc with nodes
    var url = '/FloorPlans/' + building + '/' + building + floor + '.txt';
    $.ajax({
        url: url,
        success: function (data) {
            // add nodes to array
            addNodes(data);
            // find the closest point to origin
            var p2 = findClosest(p);
            // first connecting node
            var p3 = nodes[p2.c[0]-1];
            // find closest point on line
            var r = findClosestPoint(p,p2,p3);
            var r2;
            var i = 1;
            // cycle through connecting nodes
            for (i; i<p2.c.length;i++) {
                p3 = nodes[p2.c[i]-1];
                r2 = findClosestPoint(p,p2,p3);
                if (r2.d < r.d) {
                    r = r2;
                }
            }
            console.log("Closest point connectors: " + r.c)
            // add first node to nodes array
            nodes.splice(0,0,r);
            // find shortest path
            if (!pathFound) {
                djikstraPath();
                ctx.strokeStyle = 'red';
                ctx.lineWidth = 5;
                ctx.beginPath();
                ctx.moveTo(parseInt(p.x),parseInt(p.y));
                ctx.lineTo(parseInt(nodes[0].x),parseInt(nodes[0].y));
                ctx.stroke();
            }
        }
    })
}

// Function to get the coordinates from click
function GetCoordinates(e) {

    var x = e.layerX;
    var y = e.layerY;
    document.getElementById("x").innerHTML = x;
    document.getElementById("y").innerHTML = y;

    // reset drawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!building || !floor) return;
    var img = new Image();
    img.src = "/FloorPlans/" + building + "/" + building + floor + ".PNG";

    img.onload = function() {
        canvas.height = this.height;
        canvas.width = this.width;
        ctx.drawImage(img, 0, 0);
    };
    pathFound = false
    findPath({"x":x,"y":y})
    /*ctx.strokeStyle = 'red';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(x,y);
    ctx.lineTo(x+5,y);
    ctx.stroke();*/

}

// Function to select building
function Building(b) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    building = b.options[b.selectedIndex].text;
    if (!building) return
    var select = document.getElementById('Floor');
    var i = 0;
    var l = select.length
    for (i; i < l; i++) {
        select.remove(0);
    }
    var url = '/FloorPlans/' + building + '/' + building + 'Floors.txt'
    var floors;
    $.ajax({
        url: url,
        success: function (data) {
            floors = data.split(",");
            var option;
            for (i = 0; i < floors.length; i++) {
                option = document.createElement("option");
                option.text = floors[i];
                select.add(option);
            }
        }
    })
}

// Function to select floor
function Floor(f) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    floor = f.options[f.selectedIndex].text;
    if (!building || !floor) return;
    var img = new Image();
    img.src = "/FloorPlans/" + building + "/" + building + floor + ".PNG";

    img.onload = function() {
        canvas.height = this.height;
        canvas.width = this.width;
        ctx.drawImage(img, 0, 0);
    };

    canvas.addEventListener('click', function(event) {
        if (gender) {
            GetCoordinates(event)
        }
    })
}

function Gender(g) {
    gender = g.options[g.selectedIndex].text;
}