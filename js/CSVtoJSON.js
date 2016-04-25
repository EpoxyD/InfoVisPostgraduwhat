/**
 * Created by Max on 29/03/16.
 */
var restaurants = [
    {
        id: 0,
        naam: 'WabiSabi',
        type: 'restaurant',
        Gas: [],
        Water: [],
        Electricity: []
    },
    {
        id: 1,
        naam: 'MusiCafe',
        type: 'café',
        Gas: [],
        Water: [],
        Electricity: []
    },
    {
        id: 2,
        naam: 'Libertad',
        type: 'café',
        Gas: [],
        Water: [],
        Electricity: []
    },
    {
        id: 3,
        naam: 'Tr3s',
        type: 'restaurant',
        Gas: [],
        Water: [],
        Electricity: []
    },
    {
        id: 4,
        naam: 'Aquasanta',
        type: 'restaurant',
        Gas: [],
        Water: [],
        Electricity: []
    },
    {
        id: 5,
        naam: 'Troubadour',
        type: 'restaurant',
        Gas: [],
        Water: [],
        Electricity: []
    }
];

//De doelwaarden: 5% minder dan de gemiddeldes van alle restaurants hun eerste week
var targets = {
    Electricity: 7889.743945,
    Water: 115.0519223,
    Gas: 2802.846822
};

var bla = 0;
var bla2 = 0;
var bla3 = 0;

var CSVtoJSON = {

    settings: {

    },
    init: function() {

        for (var i = 0; i < restaurants.length; i++) {

            //Gas measurements
            new Request({
                url: "DataSet/" + restaurants[i].naam + "_Gas.csv",
                onSuccess: function (response) {
                    var json = CSVtoJSON.convert(response);

                    restaurants[bla].Gas = json;
                    bla ++;
                },
                method: "get"
            }).send();

            //Water measurements
            new Request({
                url: "DataSet/" + restaurants[i].naam + "_Water.csv",
                onSuccess: function (response) {
                    var json = CSVtoJSON.convert(response);

                    restaurants[bla2].Water = json;
                    bla2 ++;
                },
                method: "get"
            }).send();

            //Electricity measurements
            new Request({
                url: "DataSet/" + restaurants[i].naam + "_Electricity.csv",
                onSuccess: function (response) {
                    var json = CSVtoJSON.convert(response);

                    restaurants[bla3].Electricity = json;
                    bla3 ++;
                },
                method: "get"
            }).send();
        }

        console.log(restaurants);
    },
    convert: function(csv) {

        var lines=csv.split("\n");

        var result = {};

        for(var i=1;i<lines.length;i++){

            var currentline=lines[i].split(",");

            result[currentline[0]] = currentline[1];

        }

        return result; //JavaScript object
        //return JSON.stringify(result); //JSON
    }
};