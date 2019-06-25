var BarChart = (function() {
    //private attributes
    let svgElementId;
    let xAxisSvg;
    let yAxisSvg;

    let margin = {top: 20, right: 20, bottom: 100, left: 30};
    let width;
    let height;
    let x;
    let y;
    let xAxis;
    let yAxis;
    let svg;
    function drawChart() {
        svg = d3.select('#'+svgElementId)
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");


        xAxisSvg = svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            .select("g.text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", "-.55em")
            .attr("transform", "rotate(-45)");

        yAxisSvg = svg
            .append("g")
            .attr("class", "y-axis")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Value ($)");

    }


    //public attributes
    return {
        init: function(id, element_width, element_hight) {
           svgElementId = id;
            width = element_width - margin.left - margin.right;
            height = element_hight - margin.top - margin.bottom;

            x = d3.scaleBand()
                .range([0, width]);

            y = d3.scaleLinear()
                .range([height, 0]);

            xAxis = d3.axisBottom(x);

            yAxis = d3.axisLeft(y)
                .ticks(5);

           drawChart();
        },
        draw: function(data) {
            x.domain(data.map(function (d) {
                return d.categories;
            }));
            y.domain([0, d3.max(data, function (d) {
                return d.value;
            })]);

            //rescale axes
            svg.select("g.x-axis")
                .transition()
                .call(xAxis);

            svg.select("g.y-axis")
                .transition()
                .call(yAxis);

            svg.select("g.x-axis")
                .selectAll("g.tick")
                .selectAll("text")
                .style("text-anchor", "end")
                .attr("transform", "rotate(-45)");

            let bar = svg.selectAll(".bar")
                .data(data);

            // remove
            bar.exit().remove();

            // enter
            let barEnter = bar.enter().append("rect")
                .attr("class","bar")
                .style("fill", "steelblue");

            // enter + update
            barEnter.merge(bar)
                .attr("x", function (d) {
                    return 5 + x(d.categories);
                })
                .attr("width", function (d, i) {
                    return (x.bandwidth() - 10)
                })
                .attr("y", function (d) {
                    return y(d.value);
                })
                .attr("height", function (d) {
                    return height - y(d.value);
                });
        }
    }

})()
