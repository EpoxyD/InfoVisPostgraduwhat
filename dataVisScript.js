/*
 *  Het volgende deel is voor het weergeven van de huisjes
 *  Alle kleuren(HSL) hebben S=38% en L=63%
 */

//Maak een nieuw svg veld aan
var svg_width = 1200;
var svg_height = 600;

svg = d3.select("body").append("svg:svg").attr("width", svg_width).attr("height", svg_height).attr('id', 'svg');

//data van de restaurants
var restaurants = [
    {
        type: 'house_2',
        data: [
            {
                gas: 400,
                water: 300,
                electric: 200
            },
            {
                gas: 800,
                water: 400,
                electric: 500
            },
            {
                gas: 200,
                water: 500,
                electric: 300
            }
        ]
    },
    {
        type: 'house_2',
        data: [
            {
                gas: 400,
                water: 300,
                electric: 200
            },
            {
                gas: 800,
                water: 400,
                electric: 500
            },
            {
                gas: 200,
                water: 500,
                electric: 300
            }
        ]
    },
    {
        type: 'house_1',
        data: [
            {
                gas: 300,
                water: 500,
                electric: 300
            },
            {
                gas: 300,
                water: 400,
                electric: 500
            },
            {
                gas: 600,
                water: 200,
                electric: 100
            }
        ]
    },
    {
        type: 'house_1',
        data: [
            {
                gas: 500,
                water: 400,
                electric: 500
            },
            {
                gas: 200,
                water: 500,
                electric: 300
            },
            {
                gas: 600,
                water: 200,
                electric: 100
            }
        ]
    },
    {
        type: 'house_2',
        data: [
            {
                gas: 600,
                water: 200,
                electric: 100
            },
            {
                gas: 300,
                water: 400,
                electric: 500
            },
            {
                gas: 200,
                water: 500,
                electric: 300
            }
        ]
    },
    {
        type: 'house_1',
        data: [
            {
                gas: 500,
                water: 400,
                electric: 500
            },
            {
                gas: 200,
                water: 500,
                electric: 300
            },
            {
                gas: 600,
                water: 200,
                electric: 100
            }
        ]
    },
    {
        type: 'house_2',
        data: [
            {
                gas: 700,
                water: 400,
                electric: 500
            },
            {
                gas: 300,
                water: 500,
                electric: 300
            },
            {
                gas: 400,
                water: 200,
                electric: 100
            }
        ]
    }
];

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
            .startAngle(Math.PI/2)
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
        g.append('svg:path')
            .attr('d', outline)
            .attr("fill", "#C59B7D");
        g.append('svg:path')
            .attr('d', door)
            .attr('fill', "#7DADC5");
        g.append('svg:path')
            .attr('d', window)
            .attr('fill', "#FFFFFF");

        //voeg die boogstkes vanboven toe
        g.append('svg:path')
            .attr('d', top)
            .attr('fill', "#A9C57D");
        var xpos = x + w * 0.10;
        var ypos = (w * 0.05) + y;
        for (var i = 0; i < 5; i++) {
            g.append("path")
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
        g.append('svg:path')
            .attr('d', outline)
            .attr("fill", "#A9C57D");
        g.append('svg:path')
            .attr('d', door)
            .attr('fill', "#7DADC5");
        g.append('svg:path')
            .attr('d', window)
            .attr('fill', "#FFFFFF");

        return g;
    }
};


//get maximum gas value
var maxGas = d3.max(restaurants, function(d) {
    return d3.max(d.data, function(g){
        return g.gas;
    });
} );

//get maximum water value
var maxWater = d3.max(restaurants, function(d) {
    return d3.max(d.data, function(g){
        return g.water;
    });
} );

//get maximum Electric value
var maxElectric = d3.max(restaurants, function(d) {
    return d3.max(d.data, function(g){
        return g.electric;
    });
} );

//Add the houses to the svg
var NrRestaurants = restaurants.length;
var widthPerRest = ((svg_width - 60) / NrRestaurants) * (3/4);
var widthPerSpace = ((svg_width - 60) / NrRestaurants) * (1/4);
ofset = 30;

var average = 0;

svg.selectAll('g')
    .data(restaurants)
    .enter()
    .append(function(d) {
        var rest_height = d.data[0].gas / maxGas*svg_height;
        average = average + rest_height;
        var y = svg_height - rest_height;
        var x = ofset;
        ofset = ofset + widthPerRest + widthPerSpace;
        var v = houses[d.type](rest_height, widthPerRest, x, y);
        return v.node();
    });
    //.on('mouseover', );

average = average/NrRestaurants;

//svg.append(houses['goal'](average, 5, svg_height - average));

//svg.append('rect').attr('x', 50).attr('y', 50).attr('height', 50).attr('width', 50);

var x = 5;
var h = average;
var y = svg_height - h;
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

svg.append('svg:path')
    .attr('d', pole_1)
    .attr("fill", "#B6B6B6");
svg.append('svg:path')
    .attr('d', pole_2)
    .attr("fill", "#B6B6B6");
svg.append('svg:path')
    .attr('d', rope)
    .attr("fill", "#555555");

var xpos = (x + 5);
for (var i = 0; i < 2; i++) {
    svg.append("path")
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
    var c = "#C57DC5";
    switch(color) {
        case 0:
            c = "#C57DC5";
            color = 1;
            break;
        case 1:
            c = "#957DC5";
            color = 2;
            break;
        case 2:
            c = "#7DC5C5";
            color = 0;
            break;
        default:
            c = "#C57DC5";
    }
    svg.append("path")
        .attr("d", triangle)
        .attr('fill', c);
    ofset = ofset + 59;
}