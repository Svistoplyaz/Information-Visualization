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

var margin = {top: 20, right: 10, bottom: 45, left: 45};
var width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var s = d3.formatSpecifier("f");
s.precision = d3.precisionFixed(0.01);
var f = d3.format(s);
//Europe without SI/Slovakia because it doesn't have good precision
EU_reg = {name:"EU", full_name:"Europe", countries:["CZ", "DE", "FR", "IN", "PL", "RU"/*, "SI"*/]};
//Asia without KR/Korea because it doesn't have good precision
AS_reg = {name:"AS", full_name:"Asia", countries:["AE", "BH", "CN", "IQ", "IR", "JO", /*"KR",*/
  "KW", "LB", "OM", "PS", "QA", "SA", "SY", "TH", "TR", "YE", "MY"]};
//Africa
AF_reg = {name:"AF", full_name:"Africa", countries:["CI", "EG"]};
//North America
NA_reg = {name:"NA", full_name:"North America", countries:["US"]};
//South America
SA_reg = {name:"SA", full_name:"South America", countries:["BR"]};
//Oceania
OC_reg = {name:"OC", full_name:"Oceania", countries:[]};
//
TE_reg = {name:"TE", full_name:"Europe", countries:["CZ"]};

//All regions
ALL_reg = [EU_reg, AS_reg, AF_reg, NA_reg, SA_reg, OC_reg];
// ALL_reg = [TE_reg];

//Global variables
var consolidated_data = []
var x_scale = null
var y_scale = null
var svg = null

function initDotSpace(year){
  //Let's go over all countries and save all the possible years in the global
  for(const reg of ALL_reg){
    // console.log(reg);
    for(const country of reg.countries){
      // console.log(country);
      d3.tsv("../data/income/"+country+".tsv", function(error, data) {
        // console.log(consolidated_data.length);
        all_years = data.map(function(d) { return +d.year; });
        //Remove duplicate years for faster sort and lowerbound search
        all_years = [...new Set(all_years)];
        all_years.sort();

        for(year of all_years){
          var filtered_data = data.filter(function(d){return +d.year==year});
          if(filtered_data.length != 0){
            try{
              consolidated_data.push({country:filtered_data[0].country, region:reg.name,
                year:year,
                top_1:1 - parseFloat(filtered_data.filter(function(d){
                  return +d.high==0.99
                })[0].cumul),
                bot_50:parseFloat(filtered_data.filter(function(d){
                  return +d.high==0.5
                })[0].cumul)
              });
            }catch(error){
              // console.log(country + " " + year + " data has bad precision");
            }
          }
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
    x_scale = d3.scaleLinear()
        .range([0, width]);

    //Wealth of bottom 50%
    y_scale = d3.scaleLinear()
      .range([height, 0]);

    var xAxis = d3.axisBottom().scale(x_scale)

    var yAxis = d3.axisLeft().scale(y_scale)

    svg = d3.select("body").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr("id", "dot_space")
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    //Finding min and max value for axes.
    var x_domain = d3.extent(consolidated_data, function(d) { return d.top_1; });
    var y_domain = d3.extent(consolidated_data, function(d) { return d.bot_50; });

    x_scale.domain(x_domain).nice();
    y_scale.domain(y_domain).nice();

    // Add the x-axis
    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

    // text label for the x axis
    svg.append("text")
      .attr("transform", "translate(" + (width/2) + " ," +
             (height + margin.top + 21) + ")")
      // .style("fill", "red")
      .style("text-anchor", "middle")
      .text("Wealth of top 1%");

  	// svg.append('text')
  	// 	.text("share of population")
  	// 	.attr('text-anchor', 'end')
  	// 	.attr('x', 600)
  	// 	.attr('y', 480);

    // Add the y-axis
    svg.append("g")
      .call(yAxis);

    // text label for the y axis
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x",0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Wealth of bottom 50%");

    var legend = svg.selectAll(".legend")
      .data(ALL_reg)
    .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    legend.append("rect")
      .attr("x", width - 18)
      .attr("width", 18)
      .attr("height", 18)
      .attr("class", function(d) { return d.name })
      // .style("fill", function(d) { return colors[d]; } );

    legend.append("text")
      .attr("x", width - 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(function(d) { return d.full_name } );
  });

}

function drawDots(year){
  points_to_delete = document.getElementsByClassName("point");
  console.log(points_to_delete.length);
  while(points_to_delete[0]){
    points_to_delete[0].parentNode.removeChild(points_to_delete[0]);
  }
  points = svg.selectAll(".point");

  var data_to_draw = [];
  for(const reg of ALL_reg){
    for(const country of reg.countries){
      //Chosing current country
      var filtered_data = consolidated_data.filter(function(d){return d.country==country});

      //Getting years of the country
      all_years = filtered_data.map(function(d) { return +d.year; });
      all_years.sort();
      // Finding a year that is the biggest out of all years that are smaller
      // than the chosen year or equal to it
      suitable_year_index = lowerBound(all_years, +year);
      suitable_year = all_years[suitable_year_index];
      filtered_data = filtered_data.filter(function(d){return +d.year==suitable_year});
      // max_year = Math.max.apply(Math, data.map(function(d) { return +d.year; }));
      if(filtered_data.length != 0){
        data_to_draw.push(filtered_data[0]);
      }
      // break;
    }
    // break;
  }

  svg.selectAll(".point")
    .data(data_to_draw)
    .enter()
    .append("circle")
    // .attr("class", "point")
    .attr("class", function(d) {return d.region+" point"})
    .attr("r", 20)
    .attr("title", "Lel")
    .attr("cx", function(d) { return x_scale(f(d.top_1)); })
    .attr("cy", function(d) { return y_scale(f(d.bot_50)); })
    .on("mouseover", mouseover )
    .on("mousemove", mousemove )
    .on("mouseleave", mouseleave );
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
