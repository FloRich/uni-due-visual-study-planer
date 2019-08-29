/**
 * BarChart renders a vertically bar chart, based on provided data.
 * You can add custom behavior for hover and mouseot events of a bar by providing custom functions for it.
 *
 * This Barchart uses [{categories: string, value: string}] as datatype.
 * So in order to draw bars you have to provide data in this format.
 */
class BarChart {

    constructor(d3Instance) {
        this.margin = {top: 20, right: 20, bottom: 100, left: 30};
        this.barChartHasDrawn = false;
        this.d3 = d3Instance;
    }

    /**
     * Initialize the size of the barchart, creates coordination system, axis description and registers
     * custom function for hover and mouseout events.
     * @param id of the svg element that should be used for the barchart.
     * @param element_width barchart's maximal width
     * @param element_hight barchart's maximal height
     * @param hoverFn custom function that is triggerd when you hover over a bar
     * @param mouseoutFN custom function that is triggered when you leave a bar
     */
    init(id, element_width, element_hight, hoverFn, mouseoutFN) {
            this.svgElementId = id;
            this.width = element_width - this.margin.left - this.margin.right;
            this.height = element_hight - this.margin.top - this.margin.bottom;

            this.x = this.d3.scaleBand()
                .range([0, this.width]);

            this.y = this.d3.scaleLinear()
                .range([this.height, 0]);

            this.xAxis = this.d3.axisBottom(this.x);

            this.yAxis = this.d3.axisLeft(this.y)
                .ticks(5);

            this.hoverFn = hoverFn;
            this.mouseOutFn = mouseoutFN;

            this.drawChart();
    }

    /**
     * Draws the xAxis and yAxis where the bars will be displayed in.
     */
    drawChart() {
        this.svg = this.d3.select('#'+this.svgElementId)
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + this.margin.left + "," + this.margin.top + ")");


        this.xAxisSvg = this.svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", "translate(0," + this.height + ")")
            .call(this.xAxis)
            .select("g.text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", "-.55em")
            .attr("transform", "rotate(-45)");

        this.yAxisSvg = this.svg
            .append("g")
            .attr("class", "y-axis")
            .call(this.yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Value ($)");

        this.barChartHasDrawn = true;
    }

    /**
     * Update, Add and Remove bars based on the provided data.
     * The data should be in the same format as described in the class description.
     * @param data
     */
    update(data) {
        if (data.length === 0) {
            this.svg.style('display','none')
        } else if (this.barChartHasDrawn) {
            this.svg.style('display', 'block');
            this.x.domain(data.map(function (d) {
                return d.categories;
            }));
            this.y.domain([0, this.d3.max(data, function (d) {
                return d.value;
            })]);

            //rescale axes
            this.svg.select("g.x-axis")
                .transition()
                .call(this.xAxis);

            this.svg.select("g.y-axis")
                .transition()
                .call(this.yAxis);

            this.svg.select("g.x-axis")
                .selectAll("g.tick")
                .selectAll("text")
                .style("text-anchor", "end")
                .attr("transform", "rotate(-45)");

            let bar = this.svg.selectAll(".bar")
                .data(data);

            // remove
            bar.exit().remove();

            // enter
            let barEnter = bar.enter().append("rect")
                .attr("class", "bar")
                .style("fill", "steelblue")
                .on("mouseover", d => this.hoverFn(d))
                .on("mouseout", d => this.mouseOutFn(d));

            // enter + update
            barEnter.merge(bar)
                .attr("x", (d) => {
                    return 5 + this.x(d.categories);
                })
                .attr("width", () => {
                    return (this.x.bandwidth() - 10)
                })
                .attr("y", (d) => {
                    return this.y(d.value);
                })
                .attr("height", (d) => {
                    return this.height - this.y(d.value);
                });
        }
    }
}
