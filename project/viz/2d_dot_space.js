var tooltip = d3.select("body")
  .append("div")
  .style("opacity", 0)
  .attr("class", "tooltip")
  .style("background-color", "white")
  .style("border", "solid")
  .style("border-width", "1px")
  .style("border-radius", "5px")
  .style("padding", "10px")

var mouseover = function(d) {
  tooltip
    .style("opacity", 1)
}

var mousemove = function(d) {
  tooltip
    .html(""+countries_names[d.country]+"/"+d.year)
    .style("left", (d3.mouse(this)[0]+90) + "px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
    .style("top", (d3.mouse(this)[1]) + "px")
}

// A function that change this tooltip when the leaves a point: just need to set opacity to 0 again
var mouseleave = function(d) {
  tooltip
    .transition()
    .duration(200)
    .style("opacity", 0)
}

var body = d3.select("body");

var margin = {top: 20, right: 10, bottom: 20, left: 45};
var width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var s = d3.formatSpecifier("f");
s.precision = d3.precisionFixed(0.01);
var f = d3.format(s);
//Europe without SI/Slovakia because it doesn't have good precision
EU_reg = {name:"EU", countries:["CZ", "DE", "FR", "IN", "PL", "RU"/*, "SI"*/]};
//Asia without KR/Korea because it doesn't have good precision
AS_reg = {name:"AS", countries:["AE", "BH", "CN", "IQ", "IR", "JO", /*"KR",*/
  "KW", "LB", "OM", "PS", "QA", "SA", "SY", "TH", "TR", "YE", "MY"]};
//Africa
AF_reg = {name:"AF", countries:["CI", "EG"]};
//North America
NA_reg = {name:"NA", countries:["US"]};
//South America
SA_reg = {name:"SA", countries:["BR"]};
//Oceania
OC_reg = {name:"OC", countries:[]};
//
TE_reg = {name:"TE", countries:["CZ"]};

//All regions
ALL_reg = [EU_reg, AS_reg, AF_reg, NA_reg, SA_reg, OC_reg];
// ALL_reg = [TE_reg];

function createDotSpace(year){
  var consolidated_data = []

  for(const reg of ALL_reg){
    // console.log(reg);
    for(const country of reg.countries){
      // console.log(country);
      d3.tsv("../data/income/"+country+".tsv", function(error, data) {
        all_years = data.map(function(d) { return +d.year; });
        //Remove duplicate years for faster sort and lowerbound search
        all_years = [...new Set(all_years)];
        all_years.sort();
        // Finding a year that is the biggest out of all years that are smaller
        // than the chosen year or equal to it
        max_year_index = lowerBound(all_years, +year);
        max_year = all_years[max_year_index];
        // max_year = Math.max.apply(Math, data.map(function(d) { return +d.year; }));
        filtered_data = data.filter(function(d){return +d.year==max_year});
        if(filtered_data.length != 0){
          consolidated_data.push({country:filtered_data[0].country, region:reg.name,
            year:max_year,
            top_1:1 - parseFloat(filtered_data.filter(function(d){
              return +d.high==0.99
            })[0].cumul),
            bot_50:parseFloat(filtered_data.filter(function(d){
              return +d.high==0.5
            })[0].cumul)
          });
        }
      });
    }
  }

  countries_names = {};
  d3.tsv("../data/countries.tsv", function(error, data) {
    for(const row of data){
      countries_names[row.code] = row.name;
    }
  });

  //Stupid fix because I am not sure how to make it work without d3.tsv(...
  d3.tsv("../data/income/FR.tsv", function(error, data) {
    //Wealth of top 1%
    var x = d3.scaleLinear()
        .range([0, width]);

    //Wealth of bottom 50%
    var y = d3.scaleLinear()
      .range([height, 0]);

    var xAxis = d3.axisBottom().scale(x)

    var yAxis = d3.axisLeft().scale(y)

    var svg = d3.select("body").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr("id", "dot_space")
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    //Finding min and max value for axes.
    var x_domain = d3.extent(consolidated_data, function(d) { return d.top_1; });
    var y_domain = d3.extent(consolidated_data, function(d) { return d.bot_50; });
    // var debug_label = document.getElementById("debug_label");
    // debug_label.innerHTML = "X: " + x_domain + "; Y: " + y_domain;

    x.domain(x_domain).nice();
    y.domain(y_domain).nice();

    // Add the x-axis
    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

    // Add the y-axis
    svg.append("g")
      .call(yAxis);

    // Add the points from the dataset
    svg.selectAll(".point")
      .data(consolidated_data)
      .enter()
      .append("circle")
      .attr("class", "point")
      .attr("class", function(d) {return d.region})
      .attr("r", 20)
      .attr("title", "Lel")
      .attr("cx", function(d) { return x(f(d.top_1)); })
      .attr("cy", function(d) { return y(f(d.bot_50)); })
      .on("mouseover", mouseover )
      .on("mousemove", mousemove )
      .on("mouseleave", mouseleave );

    var keys = [];
    for(const reg of ALL_reg) keys.push(reg.name);

    var legend = svg.selectAll(".legend")
      .data(keys)
    .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    legend.append("rect")
      .attr("x", width - 18)
      .attr("width", 18)
      .attr("height", 18)
      .attr("class", function(d) { return d })
      // .style("fill", function(d) { return colors[d]; } );

    legend.append("text")
      .attr("x", width - 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(function(d) { return d } );
  });
}

function lowerBound_cmp(array, value, compare, lo, hi) {
  lo = lo|0
  hi = hi|0
  while(lo < hi) {
    var m = (lo + hi) >>> 1
      , v = compare(value, array[m])
    if(v < 0) {
      hi = m-1
    } else if(v > 0) {
      lo = m+1
    } else {
      hi = m
    }
  }
  if(compare(array[lo], value) <= 0) {
    return lo
  }
  return lo - 1
}

function lowerBound_def(array, value, lo, hi) {
  lo = lo|0
  hi = hi|0
  while(lo < hi) {
    var m = (lo + hi) >>> 1
    if(value < array[m]) {
      hi = m-1
    } else if(value > array[m]) {
      lo = m+1
    } else {
      hi = m
    }
  }
  if(array[lo] <= value) {
    return lo
  }
  return lo - 1
}

function lowerBound(array, value, compare, lo, hi) {
  if(!lo) {
    lo = 0
  }
  if(typeof(hi) !== "number") {
    hi = array.length-1
  }
  if(compare) {
    return lowerBound_cmp(array, value, compare, lo, hi)
  }
  return lowerBound_def(array, value, lo, hi)
}
