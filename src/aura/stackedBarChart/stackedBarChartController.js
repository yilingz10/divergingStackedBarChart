({
    afterScriptsLoaded : function(component, event, helper) {
        var data = [
            {date: "11/03/2017", 
             restrictiveEnforcing: 5,
             restrictiveNotEnforcing: 5,
             potentiallyRestrictive:5,
             unknown: 2,
             open: 83},
            {date: "01/05/2018", 
             restrictiveEnforcing: 5,
             restrictiveNotEnforcing: 10,
             potentiallyRestrictive:5,
             unknown: 3,
             open: 77},
            {date: "01/26/2018", 
             restrictiveEnforcing: 10,
             restrictiveNotEnforcing: 35,
             potentiallyRestrictive:10,
             unknown: 5,
             open: 40},
            {date: "02/02/2018", 
             restrictiveEnforcing: 5,
             restrictiveNotEnforcing: 5,
             potentiallyRestrictive:25,
             unknown: 2,
             open: 63},
            {date: "As of 8:00am", 
             restrictiveEnforcing: 6,
             restrictiveNotEnforcing: 4,
             potentiallyRestrictive:10,
             unknown: 5,
             open: 75},
        ];
        
        var margin = {top: 50, right: 20, bottom: 10, left: 65},
            width = 800 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;
            
        var bar_width = 30;
        var x_offset = 0;
        
            
        var x = d3.scaleBand()
            .range([0, width])
            .round([.3]);
        
        var y = d3.scaleLinear()
        	.range([height, 0]);
		
        var map ={"restrictiveEnforcing": "#c94940",
                   "restrictiveNotEnforcing": "#f06b68",
                   "potentiallyRestrictive": "#f8b54a",
                   "unknown": "#706e6b",
                  "open": "#29cec0"};
        var map2 = _.values(_.mapValues(map, (value, key) => { 
            return { 
            'label': key
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, function(str){ return str.toUpperCase(); }),
                            'val' : value 
                            } }));
        component.set('v.colorMap', map2);
        
        var color = d3.scaleOrdinal()
        	.range(_.values(map));

        var chartContainer = component.find("chartContainer").getElement();
        
        
        var svg = d3.select(chartContainer).append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .attr("id", "d3-plot")
            .append("g")
            	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        
        color.domain(_.keys(map));

        _.forEach(data, function(d){
            // calculating percentages
            var y0 = -1*(d["unknown"]/2+d["potentiallyRestrictive"]+d["restrictiveNotEnforcing"]+d["restrictiveEnforcing"]);
            var idy = 0;
            d.boxes = color.domain().map(function(name) {
                return {name: name, y0: y0, y1: y0 += +d[name], label: d[name] + '%', N: +d.N, n: +d[idy += 1]}; 
            });
        });

        console.log(data);
        var min_val = d3.min(data, function(d) {
            return d.boxes["0"].y0;
        });
        
        var max_val = d3.max(data, function(d) {
            return d.boxes["4"].y1;
        });
        
        y.domain([min_val, max_val]).nice();
        x.domain(data.map(function(d) { return d.date; }));
        
        // x axis
        svg.append("g")
          .attr("transform", "translate(0," + (height - 30) + ")")
          .call(d3.axisBottom(x));
        
        // ticks on x axis
        var ticks = svg.selectAll(".tick")
        	.attr("transform", function(d) { 
                return "translate(" + (x(d) + x_offset + bar_width/2) +", 0)"; 
            });

        svg.append("text")
          .attr("transform",
                "translate(" + (width/4) + " ," + 
                               (height + margin.top + 20) + ")")
          .style("text-anchor", "middle")
          .text(function(d) { 
                return "x(d.date)"; 
            });

        var vakken = svg.selectAll(".date")
            .data(data)
          .enter().append("g")
            .attr("class", "bar")
        	.attr("transform", function(d) { 
                return "translate(" + (x(d.date) + x_offset) +", " + (min_val - 20) + ")"; 
            });
        
        var bars = vakken.selectAll("rect")
            .data(function(d) { return d.boxes; })
            .enter().append("g").attr("class", "subbar");
        
        bars.append("rect")
            .attr("width", bar_width)
            .attr("y", function(d) {
                return y(d.y1);
            })
            .attr("height", function(d) { 
                return y(d.y0) - y(d.y1); 
            })
            .style("fill", function(d) { 
                return color(d.name); 
            });
        
        bars.append("text")
            .attr("y", function(d) { 
                return (y(d.y1) - y(d.y0))/2 + y(d.y0); 
            })
            .attr("x", x.bandwidth()/4)
            .attr("dy", "0.5em")
            .attr("dx", "0.5em")
            .style("font" ,"10px sans-serif")
            .style("text-anchor", "begin")
            .text(function(d) {
                return d.label
            });
        
        vakken.insert("rect",":first-child")
            .attr("width", bar_width)
            .attr("y", "1")
            .attr("height", height)
            .attr("fill-opacity", "0.5")
            .style("fill", "#F5F5F5")
            .attr("class", function(d,index) { 
                return index%2==0 ? "even" : "uneven"; 
            });
        
        svg.append("g")
            .attr("class", "x axis")
            .append("line")
            .attr("y1", y(0) + (min_val - 20))
            .attr("y2", y(0) + (min_val - 20))
            .attr("x2", width);
        
        var startp = svg.append("g").attr("class", "legendbox").attr("id", "mylegendbox");
		// this is not nice, we should calculate the bounding box and use that
    /************ HORIZONTAL LEGEND
         var xtabs = [0, 100, 200, 300, 400];
        var legend = startp.selectAll(".legend")
            .data(color.domain().slice())
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function(d, i) { 
                return "translate(" + xtabs[i] + ",-45)"; 
            });
        
        legend.append("rect")
            .attr("y", 0)
            .attr("height", 18)
            .attr("width", 18)
            .style("fill", color);
        
        legend.append("text")
            .attr("y", 22)
            .attr("x", 9)
            .attr("dx", ".35em")
            .style("text-anchor", "begin")
            .style("font" ,"10px sans-serif")
            .text(function(d) { 
                return d; 
            }); */
        
        //********** VERTICAL LEGEND
       /* var legend = startp.selectAll('.legend')
            .data(color.domain().slice())
            .enter().append('g')
            .attr("transform", function (d, i) {
                return "translate(0," + i * 20 + ")"
            })
        
        legend.append('rect')
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", 10)
            .attr("height", 10)
            .style("fill", function (d, i) {
            return color(i)
        })
        
        legend.append('text')
            .attr("x", 20)
            .attr("y", 10)
        //.attr("dy", ".35em")
        .text(function (d, i) {
            return d
        })
            .attr("class", "textselected")
            .style("text-anchor", "start")
            .style("font-size", 10)
        */
        
        d3.selectAll(".axis path")
            .style("fill", "none")
            .style("stroke", "#000")
            .style("shape-rendering", "crispEdges")
        
        d3.selectAll(".axis line")
            .style("fill", "none")
            .style("stroke", "#000")
            .style("shape-rendering", "crispEdges")
            
        var movesize = width/2 - startp.node().getBBox().width/2;
        d3.selectAll(".legendbox").attr("transform", "translate(" + movesize  + ",0)");
    }
})