var RestaurantHouses = {

    settings: {},

    init : function () {
        RestaurantHouses.showHouses();
    },

    showHouses : function () {

        var margin = {top: 20, right: 20, bottom: 20, left: 40};

        var outerWidth = 1400;
        var outerHeight =400;

        var width = outerWidth - margin.left - margin.right;

        var height = outerHeight - margin.top - margin.bottom;

        var restaurantName;
        var meterType = "Gas";

        var restaurants = [
            {
                id: 0,
                naam: 'WabiSabi',
                type: 'restaurant',
                max: 5479.025764895603
            },
            {
                id: 1,
                naam: 'MusiCafe',
                type: 'café',
                max: 11587.807881773915
            },
            {
                id: 2,
                naam: 'Libertad',
                type: 'café',
                max: 903410
            },
            {
                id: 3,
                naam: 'Tr3s',
                type: 'restaurant',
                max: 8436.770186335314
            },
            {
                id: 4,
                naam: 'Aquasanta',
                type: 'restaurant',
                max: 890.5
            },
            {
                id: 5,
                naam: 'Troubadour',
                type: 'restaurant',
                max: 468000
            }
        ];

        var svg_houses = d3.select('body').append('svg')
            .attr('width', outerWidth)
            .attr('height', outerHeight)
            .attr('id', 'svg_houses')
            .append('g')
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var houses = {
            restaurant: function(h, w, id){

                var e =  document.createElementNS(d3.ns.prefix.svg,'g'),
                    g = d3.select(e)
                        .attr('class','node');

                //Create first floor
                g.append('rect')
                    .attr('y', height - h)
                    .attr('x', 0)
                    .attr('height', h)
                    .attr('width', w)
                    .attr('fill', '#359FD4')
                    .attr('id', 'house' + id);
                //door
                g.append('rect')
                    .attr('y', height - (w * 0.5))
                    .attr('x', w * 0.1)
                    .attr('height', (w * 0.5))
                    .attr('width', (w * 0.2))
                    .attr('fill', '#35D49F')
                    .attr('id', 'door' + id);
                //window
                g.append('rect')
                    .attr('y', height - (w * 0.5))
                    .attr('x', w * 0.5)
                    .attr('height', (w * 0.3))
                    .attr('width', (w * 0.4))
                    .attr('fill', '#FFFFFF')
                    .attr('id', 'window'+ id);

                return g;
            },
            café:function(h, w, id){

                var e =  document.createElementNS(d3.ns.prefix.svg,'g'),
                    g = d3.select(e)
                        .attr('class','node');

                //Create first floor
                g.append('rect')
                    .attr('y', height - h)
                    .attr('x', 0)
                    .attr('height', h)
                    .attr('width', w)
                    .attr('fill', '#D4BA35')
                    .attr('id', 'house' + id);
                //door
                g.append('rect')
                    .attr('y', height - (w * 0.5))
                    .attr('x', w * 0.1)
                    .attr('height', (w * 0.5))
                    .attr('width', (w * 0.2))
                    .attr('fill', '#D46A35')
                    .attr('id', 'door' + id);
                //window
                g.append('rect')
                    .attr('y', height - (w * 0.5))
                    .attr('x', w * 0.5)
                    .attr('height', (w * 0.3))
                    .attr('width', (w * 0.4))
                    .attr('fill', '#FFFFFF')
                    .attr('id', 'window' + id);

                return g;
            }
        };

        var x_pos = d3.scale.linear().domain([0, 9]).range([0, width]);
// De hoogte moet nog gescaled worden naar de hoogste waarde
        var y_scale = d3.scale.linear().domain([0, d3.max(restaurants, function(d) { return d.max; })]).
        rangeRound([0, height]);

        y_scale = d3.scale.log()
            .base(Math.E)
            .domain([Math.exp(0), d3.max(restaurants, function(d) { return d.max; })])
            .range([0, height]);


        svg_houses.selectAll('g')
            .data(restaurants)
            .enter()
            .append(function(d){
                var v;
                if (d.type == 'café'){
                    v = houses.café(y_scale(d.max), 100, d.id);
                }
                else{
                    v = houses.restaurant(y_scale(d.max), 100, d.id);
                }
                return v.node();
            })
            .attr('id', function(d){return d.id;})
            .attr("transform", function(d){return "translate(" + x_pos(d.id) + "," + 0 + ")";})
            .on('click', function(d){

                for(var i = 0; i < restaurants.length; i++) {
                    if ( i != d.id) {
                        d3.select('#door' + i )
                            .transition()
                            .duration(1000)
                            .style('opacity', 0.3);
                        d3.select('#house' + i )
                            .transition()
                            .duration(1000)
                            .style('opacity', 0.3);
                    }
                    else{
                        d3.select('#door' + i)
                            .transition()
                            .duration(1000)
                            .style('opacity', 1);
                        d3.select('#house' + i)
                            .transition()
                            .duration(1000)
                            .style('opacity', 1);
                    }
                }

                var coords = d3.mouse(this);
                console.log(coords);

                for (var i = 0; i < 3 ; i++){
                    var wolk = d3.select('#cloud' + i);

                    var targetx = x_pos(d.id) + coords[0] - 60;
                    var targety = coords[1];

                    if (i == 1) {
                        targetx = x_pos(d.id) + coords[0] + 10;
                        targety = coords[1] + 30;
                    }
                    else if (i == 2) {
                        targetx = x_pos(d.id) + coords[0];
                        targety = coords[1] - 30;
                    }

                    wolk.transition()
                        .duration(600 * (i+1))
                        .attr('transform', function(){
                            return "translate(" + targetx + "," + targety + ")";
                        });
                }

                restaurantName = d.naam;
                CarpetPlotConsumption.showDataFromFile(restaurantName, meterType);
            });

        var cloud = function(w, h, text, id){

            var e =  document.createElementNS(d3.ns.prefix.svg,'g'),
                g = d3.select(e)
                    .attr('id', 'cloud' + id)
                    .attr('class','node');

            g.append('circle')
                .attr('cx', w/2.5)
                .attr('cy', h/3)
                .attr('r', w/3)
                .attr('fill', '#000000');

            g.append('circle')
                .attr('cx', w/3)
                .attr('cy', 2.5 * h/3)
                .attr('r', w/3)
                .attr('fill', '#000000');

            g.append('circle')
                .attr('cx', w/7)
                .attr('cy', h/3)
                .attr('r', w/4)
                .attr('fill', '#000000');

            g.append('circle')
                .attr('cx', 3.5 * w/5)
                .attr('cy', 3.3 * h/4)
                .attr('r', 1.5 * w/5)
                .attr('fill', '#000000');

            g.append('circle')
                .attr('cx', 3.5 * w/5)
                .attr('cy', h/2.5)
                .attr('r', w/4)
                .attr('fill', '#000000');

            g.append('text')
                .attr('x', w/2.1)
                .attr('y', h/1.5)
                .attr('text-anchor', 'middle')
                .text(text)
                .attr('fill', '#FFFFFF');

            return g;
        };

        /**
         *  Append the clouds
         */

        svg_houses.append(function(){
                var v = cloud(80, 40, 'Electricity', 2);
                return v.node();
            })
            .attr("transform", function () {
                return "translate(" + x_pos(2.7) + "," + 0 + ")";
            })
            .attr('opacity', 0.3)
            .on('click', function(){
                for(var i = 0; i < 3 ; i++){
                    if (i != 2) {
                        d3.select('#cloud' + i)
                            .transition()
                            .duration(1000)
                            .style('opacity', 0.3);
                    }
                    else{
                        d3.select('#cloud' + i)
                            .transition()
                            .duration(1000)
                            .style('opacity', 1);
                    }
                }
                meterType = 'Electricity';
                if (restaurantName != null){
                    CarpetPlotConsumption.showDataFromFile(restaurantName, meterType);
                }
            });

        svg_houses.append(function(){
                var v = cloud(60, 30, 'Gas', 0);
                return v.node();
            })
            .attr("transform", function () {
                return "translate(" + x_pos(4.2) + "," + 0 + ")";
            })
            .attr('opacity', 1)
            .on('click', function(){
                for(var i = 0; i < 3 ; i++){
                    if (i != 0) {
                        d3.select('#cloud' + i)
                            .transition()
                            .duration(1000)
                            .style('opacity', 0.3);
                    }
                    else{
                        d3.select('#cloud' + i)
                            .transition()
                            .duration(1000)
                            .style('opacity', 1);
                    }
                }
                meterType = 'Gas';
                if (restaurantName != null){
                    CarpetPlotConsumption.showDataFromFile(restaurantName, meterType);
                }
            });

        svg_houses.append(function(){
                var v = cloud(70, 35, 'Water', 1);
                return v.node();
            })
            .attr("transform", function () {
                return "translate(" + x_pos(0.5) + "," + 0 + ")";
            })
            .attr('opacity', 0.3)
            .on('click', function(){
                for(var i = 0; i < 3 ; i++){
                    if (i != 1) {
                        d3.select('#cloud' + i)
                            .transition()
                            .duration(1000)
                            .style('opacity', 0.3);
                    }
                    else{
                        d3.select('#cloud' + i)
                            .transition()
                            .duration(1000)
                            .style('opacity', 1);
                    }
                }
                meterType = 'Water';
                if (restaurantName != null){
                    CarpetPlotConsumption.showDataFromFile(restaurantName, meterType);
                }
            });


    }

}
