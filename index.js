const svg = d3.select("svg");
const width = +svg.attr("width");
const height = +svg.attr("height");

const margin = { top: 100, right: 10, bottom: 10, left: 0 };
const inner_width = width - margin.left - margin.right;
const inner_height = height - margin.top - margin.bottom;

const plot_g = svg
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

const createPlot = () => {
    plot_g.html("");

    d3.csv(
        "https://raw.githubusercontent.com/yungyuchen521/data-visualization/data/iris.csv"
    ).then((data) => {
        const x_scale = d3
            .scalePoint()
            .range([0, inner_width])
            .padding(1)
            .domain(class_order);

        var y_scales = {};
        class_order.forEach((l) => {
            y_scales[l] = d3
                .scaleLinear()
                .domain(d3.extent(data, (d) => +d[l]))
                .range([inner_height, 0]);
        });

        plotCoordinates(plot_g, x_scale, y_scales);
        plotData(plot_g, data, x_scale, y_scales);
    });
};

const plotCoordinates = (parent_g, x_scale, y_scales) => {
    parent_g
        .selectAll("g")
        .data(class_order)
        .enter()
        .append("g")
        .attr("transform", (d) => `translate(${x_scale(d)})`)
        .each(function (d) {
            d3.select(this).call(d3.axisLeft().scale(y_scales[d]));
        })
};

const plotData = (parent_g, data, x_scale, y_scales) => {
    const path = (d) => {
        return d3.line()(
            class_order.map((l) => [x_scale(l), y_scales[l](d[l])])
        );
    };

    parent_g
        .selectAll("path")
        .data(data)
        .enter()
        .append("path")
        .attr("d", path)
        .style("fill", "none")
        .style("stroke", (d) => color_map[d.class]);
};
