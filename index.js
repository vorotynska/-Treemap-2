var urls = ["https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/video-game-sales-data.json",
    " https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/movie-data.json",
    "https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/kickstarter-funding-data.json"
];

var fader = function (color) {
    return d3.interpolateRgb(color, "#fff")(0.2);
};
var color = d3.scaleOrdinal().range(d3.schemeDark2)
var format = d3.format(",d");
var currentSelectedSet = 0; // 0 - videogames , 1 - movies , 2 - kickstarter

function videoGameClicked() {
    currentSelectedSet = 0;
    reloadDataWithCurrentMode();
    $("#title").html("Video Game Sales");
    $("#description").html("Top 100 Most Sold Video Games Grouped by Platform");
}

function moviesClicked() {
    currentSelectedSet = 1;
    reloadDataWithCurrentMode();
    $("#title").html("Movie Sales");
    $("#description").html("Top 100 Highest Grossing Movies Grouped By Genre");
}

function kickStarterClicked() {
    currentSelectedSet = 2;
    reloadDataWithCurrentMode();
    $("#title").html("Kickstarter Pledges");
    $("#description").html("Top 100 Most Pledged Kickstarter Campaigns Grouped By Category");

}

function getUniqueCategories(allArray) {

    var returnArray = [];
    allArray.forEach(function (value) {

        if (returnArray.indexOf(value.data.category) === -1) {
            returnArray.push(value.data.category);
        }
    });

    return returnArray;
}


var legendsvg;
const w = 1000;
const h = 1000;
const padding = 70;
var svg;

function addLegendInBottom(categories) {

    const numberOfRectPerCoumn = 5;
    const heightPerRow = 55;
    const legendHeight = heightPerRow * numberOfRectPerCoumn;

    legendsvg = d3
        .select("#main")
        .append("svg")
        .attr("class", "svglegend")
        .attr("width", w)
        .attr("height", legendHeight)
        .attr("x", padding)
        .attr("y", h)
        .attr("id", "legend");


    legendsvg.selectAll("rect")
        .data(categories)
        .enter()
        .append("rect")
        .attr("class", "legend-item")
        .attr("x", function (d, i) {
            const xOffset = parseInt(i / numberOfRectPerCoumn);
            return (xOffset * 200);
        })
        .attr("y", function (d, i) {
            return (i % numberOfRectPerCoumn) * 51;
        })
        .attr("width", 50)
        .attr("height", 50)
        .attr("fill", function (d, i) {
            return color(d);
        });

    // Add labels here

    legendsvg.selectAll("text")
        .data(categories)
        .enter()
        .append("text")
        .attr("x", function (d, i) {
            const xOffset = parseInt(i / numberOfRectPerCoumn);
            return (xOffset * 200) + 55;
        })
        .attr("y", function (d, i) {
            return ((i % numberOfRectPerCoumn) * 51) + 28;
        })
        .text((d) => d);
}

function loadDataSetInTreeForm(response) {

    var tooltip = d3
        .select("body")
        .append("div")
        .attr("class", "toolTip")
        .attr("id", "tooltip");

    data = JSON.parse(response);

    // delete old one

    d3.selectAll("svg").remove();

    // Create SVG    

    svg = d3
        .select("#main")
        .append("svg")
        .attr("width", w)
        .attr("height", h);

    // Create Tree map

    var root = d3.hierarchy(data)
        .eachBefore(function (d) {
            d.data.id = (d.parent ? d.parent.data.id + "." : "") + d.data.name;
        })
        .sum(function (d) {
            return d.value;
        })
        .sort(function (a, b) {
            return b.value - a.value;
        });

    var treemap = d3.treemap()
        .size([w, h])
        .paddingInner(1);

    treemap(root);

    // Add Cells

    var cell = svg.selectAll("g")
        .data(root.leaves())
        .enter().append("g")
        .attr("transform", function (d) {
            return "translate(" + d.x0 + "," + d.y0 + ")";
        });

    var rectBox = cell.append("rect")
        .attr("id", function (d) {
            return d.data.id;
        })
        .attr("width", function (d) {
            return d.x1 - d.x0;
        })
        .attr("height", function (d) {
            return d.y1 - d.y0;
        })
        .attr("class", "tile")
        .attr("data-name", function (d) {
            return d.data.name;
        })
        .attr("data-category", function (d) {
            return d.data.category;
        })
        .attr("data-value", function (d) {
            return d.data.value;
        })
        .attr("fill", function (d, i) {
            return color(d.data.category);
        })
    /*    .on("mousemove", function (d, i) {
            const category = d.data.category;
            tooltip
                .attr("id", "tooltip")
                .attr("data-value", d.data.value)
                .style("left", d3.event.pageX + 20 + "px")
                .style("top", d3.event.pageY + "px")
                .style("display", "inline-block")
                .style("opacity", 1)
                .html("Name: " + d.data.name + "<br>" + "Category: " + d.data.category + "<br>" + "Value: " + d.data.value);
        })
        .on("mouseout", function (d) {
            tooltip.style("opacity", 0);
        }); */

    cell.append("text")
        .selectAll("tspan")
        .data(function (d) {
            return d.data.name.split(/(?=[A-Z][^A-Z])/g);
        })
        .enter()
        .append("tspan")
        .attr("class", "cell-title")
        .attr("x", 4)
        .attr("y", function (d, i) {
            return 13 + i * 10;
        })
        .text(function (d) {
            return d;
        });
    ///////    Add legend

    var uniqueCategories = getUniqueCategories(root.leaves());
    addLegendInBottom(uniqueCategories);

}

function reloadDataWithCurrentMode() {

    reqDataSet = new XMLHttpRequest();
    reqDataSet.open(
        "GET",
        urls[currentSelectedSet],
        true
    );

    reqDataSet.send();
    reqDataSet.onload = function () {
        loadDataSetInTreeForm(reqDataSet.responseText);
    };
}

document.addEventListener("DOMContentLoaded", function () {

    videoGameClicked();

})