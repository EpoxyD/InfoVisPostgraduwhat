//ff wat random csv data
var csv = "ID,Gas,Water,Electric\n1,10,5,2\n2,20,10,4\n3,30,15,6\n4,40,20,8\n5,50,25,10\n6,60,30,12" +
    "\n7,10,35,14\n8,20,40,16\n9,30,45,18\n10,40,50,20\n11,50,55,22\n12,60,60,24\n13,10,5,26\n" +
    "14,20,10,28\n15,30,15,30\n16,40,20,32\n17,50,25,34\n18,60,30,36\n19,10,35,38\n20,20,40,40\n" +
    "21,30,45,42\n22,40,50,44\n23,50,55,46\n24,60,60,48\n25,20,50,50";

/*
 *  Zo zet ge het om in een array met daarin json
 *
 *  [{ID: "1", Gas: "10", Water: "5", Electric: "2"},
 *   {ID: "2", Gas: "20", Water: "10", Electric: "4"},
 *   ...
 *   {ID: "25", Gas: "20", Water: "50", Electric: "50"}]
 */
var array_data = d3.csv.parse(csv);

//Uitprinten naar de console
console.debug(array_data);

//Zo selecteerd ge 1 json-string (1 rij in de DB)
var firstRow = array_data[0];
//En zo accessed ge die row.ID of row.Gas of ...
console.debug("ID: " + firstRow.ID + " Gas: " + firstRow.Gas + " Water: " + firstRow.Water);

//En hier doe ik da ff in een for each loopke
array_data.forEach(function(d) {
        console.debug("ID: " + d.ID + " Gas: " + d.Gas + " Water: " + d.Water);
    }
);

/*
 *  Het volgende deel is voor het weergeven van de huisjes
 *  Alle kleuren(HSL) hebben S=38% en L=63%
 */

//data
var nodes = [
    {NodeType: "house_1", x:30,  y:400, height: 200, width: 110},
    {NodeType: "house_2", x:165, y:200, height: 400, width: 120},
    {NodeType: "house_1", x:315, y:0,   height: 600, width: 120},
    {NodeType: "house_1", x:465, y:300, height: 300, width: 120},
    {NodeType: "house_2", x:615, y:450, height: 150, width: 120},
    {NodeType: "house_2", x:765, y:250, height: 350, width: 120},
    {NodeType: "house_1", x:915, y:100, height: 500, width: 120},
    {NodeType: "house_1", x:1065,y:150, height: 450, width: 110},
    {NodeType: "goal",    x:5,   y:375, height: 225, width: 0}
];

//Maak een nieuw svg veld aan
var svg_width = 1200;
var svg_height = 600;
svg = d3.select("body").append("svg:svg").attr("width", svg_width).attr("height", svg_height);

//Bepaal hoe de verschillende soorten huisjes er zullen uit zien
var houses = {
    house_1: function(h, w, x, y) {
        //Elke huisje kan een ID krijgen en zo aangesproken worden
        var id = 0;

        //Definieer de punten die dan een shape zullen vormen
        var points_outline = [[x, h + y], [w + x, h + y], [w + x, y],
            [x, y], [x, h + y]];
        var points_door = [[(w * 0.10) + x , h + y], [(w * 0.10) + x, (h - (w * 0.5)) + y],
            [(w * 0.30) + x, (h - (w * 0.5)) + y], [(w * 0.30) + x , h + y], [(w * 0.10) + x , h + y]];
        var points_window =  [[(w * 0.50) + x, (h - (w * 0.5)) + y], [(w * 0.90) + x, (h - (w * 0.5)) + y],
            [(w * 0.90) + x, (h - (w * 0.2)) + y], [(w * 0.50) + x, (h - (w * 0.2)) + y], [(w * 0.50) + x, (h - (w * 0.5)) + y]];
        var points_top = [[x, y], [x + w, y], [x + w, (w * 0.06) + y], [x, (w * 0.06) + y],
            [x, y]];

        var arc = d3.svg.arc()
            .innerRadius(0)
            .outerRadius(w * 0.10)
            .startAngle(0 + Math.PI/2)
            .endAngle(Math.PI + Math.PI/2);


        //Verbind de punten
        var outline =  d3.svg.line()(points_outline);
        var door = d3.svg.line()(points_door);
        var window = d3.svg.line()(points_window);
        var top = d3.svg.line()(points_top);

        //Maak een groep die al deze vormen bundeld
        var e =  document.createElementNS(d3.ns.prefix.svg,'g'),
            g = d3.select(e).attr('id', id).
            attr('class','node');
        var path_outline = g.append('svg:path')
            .attr('d', outline)
            .attr("fill", "#C59B7D");
        var path_door = g.append('svg:path')
            .attr('d', door)
            .attr('fill', "#7DADC5");
        var path_window = g.append('svg:path')
            .attr('d', window)
            .attr('fill', "#FFFFFF");

        //voeg die boogstkes vanboven toe
        var path_top = g.append('svg:path')
            .attr('d', top)
            .attr('fill', "#A9C57D");
        var xpos = x + w * 0.10;
        var ypos = (w * 0.05) + y;
        for (i = 0; i < 5; i++) {
            var top = g.append("path")
                .attr("d", arc)
                .attr('fill', "#A9C57D")
                .attr("transform", "translate(" + xpos + "," + ypos +")");
            xpos = xpos +  w * 0.20;
        }

        return g;

    },
    house_2: function(h, w, x, y) {
        //Elke huisje kan een ID krijgen en zo aangesproken worden
        var id = 0;

        //Definieer de punten die dan een shape zullen vormen
        var points_outline = [[x, h + y], [w + x, h + y], [w + x, (50) + y],
            [(w/2) + x, y], [x, (50) + y], [x, h + y]];
        var points_door = [[(w * 0.10) + x , h + y], [(w * 0.10) + x, (h - (w * 0.5)) + y],
            [(w * 0.30) + x, (h - (w * 0.5)) + y], [(w * 0.30) + x , h + y], [(w * 0.10) + x , h + y]];
        var points_window =  [[(w * 0.50) + x, (h - (w * 0.5)) + y], [(w * 0.90) + x, (h - (w * 0.5)) + y],
            [(w * 0.90) + x, (h - (w * 0.2)) + y], [(w * 0.50) + x, (h - (w * 0.2)) + y], [(w * 0.50) + x, (h - (w * 0.5)) + y]];

        //Verbind de punten
        var outline =  d3.svg.line()(points_outline);
        var door = d3.svg.line()(points_door);
        var window = d3.svg.line()(points_window);

        //Maak een groep die al deze vormen bundeld
        var e =  document.createElementNS(d3.ns.prefix.svg,'g'),
            g = d3.select(e).attr('id', id).
            attr('class','node');
        var path_outline = g.append('svg:path')
            .attr('d', outline)
            .attr("fill", "#A9C57D");
        var path_door = g.append('svg:path')
            .attr('d', door)
            .attr('fill', "#7DADC5");
        var path_window = g.append('svg:path')
            .attr('d', window)
            .attr('fill', "#FFFFFF");

        return g;
    },
    goal: function(h, w, x, y) {
        var id = 0;

        //Definieer de punten die dan een shape zullen vormen
        var points_pole_1 = [[x, h + y], [x + 10, h + y], [x + 10, y], [x, y], [x, h + y]];
        var points_pole_2 = [[svg_width - x - 10, h + y], [svg_width - x, h + y], [svg_width - x, y], [svg_width - x -10, y], [svg_width - x -10, h + y]];
        var points_rope = [[x, y - 1], [svg_width - x, y - 1], [svg_width - x, y + 1], [x, y + 1], [x, y - 1]];

        //Verbind de punten
        var pole_1 =  d3.svg.line()(points_pole_1);
        var pole_2 =  d3.svg.line()(points_pole_2);
        var rope   =  d3.svg.line()(points_rope);

        //Ballen op de palen
        var arc = d3.svg.arc()
            .innerRadius(0)
            .outerRadius(10)
            .startAngle(0)
            .endAngle(Math.PI * 2);

        //Maak een groep die al deze vormen bundeld
        var e =  document.createElementNS(d3.ns.prefix.svg,'g'),
            g = d3.select(e).attr('id', id).
            attr('class','node');
        var path_pole_1 = g.append('svg:path')
            .attr('d', pole_1)
            .attr("fill", "#B6B6B6");
        var path_pole_2 = g.append('svg:path')
            .attr('d', pole_2)
            .attr("fill", "#B6B6B6");
        var path_pole_2 = g.append('svg:path')
            .attr('d', rope)
            .attr("fill", "#555555");

        var xpos = (x + 5);
        for (i = 0; i < 2; i++) {
            var ball = g.append("path")
                .attr("d", arc)
                .attr('fill', "#B6B6B6")
                .attr("transform", "translate(" + xpos + "," + (y - 10) + ")");
            xpos = (svg_width - x - 5);
        }

        //space between flags is 40 and flags are 20 wide
        var ofset = - 10;
        var color = 0;

        for (i = 0; i < 20; i++) {
            var points_triangle = [[x + 50 + ofset, y + 1], [x + 70 + ofset, y + 1], [x + 35 + ofset, y + 20], [x + 50 + ofset, y + 1]];
            var triangle   =  d3.svg.line()(points_triangle);
            switch(color) {
                case 0:
                    var c = "#C57DC5";
                    color = 1;
                    break;
                case 1:
                    var c = "#957DC5";
                    color = 2;
                    break;
                case 2:
                    var c = "#7DC5C5";
                    color = 0;
                    break;
                default:
                    var c = "#C57DC5";
            }
            var flag = g.append("path")
                .attr("d", triangle)
                .attr('fill', c);
            ofset = ofset + 59;
        }

        return g;
    }
};

//Add the houses to the svg
svg.selectAll("g")
    .data(nodes)
    .enter()
    .append(function(d) {
        var v = houses[d.NodeType](d.height, d.width, d.x, d.y);
        return v.node();
    });