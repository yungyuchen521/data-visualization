const addLegend = () => {
    const legend_svg = d3.select("#legend");
    const width = legend_svg.attr("width");
    const height = legend_svg.attr("height");
    const margin = 30;

    const g = legend_svg
        .append("g")
        .attr("class", "axis")
        .attr("transform", `translate(0,${height / 5})`);

    const scale = d3
        .scaleLinear()
        .range([margin, width - margin])
        .domain([-1, 1]);

    const axis = d3
        .axisBottom()
        .scale(scale)
        .tickSize(height / 3);

    g.call(axis);

    const linspace = d3.range(-1, 1, 0.01);
    const w = width / linspace.length;
    linspace.forEach((d) => {
        g.append("rect")
            .style("fill", colorScale(d))
            .style("stroke-width", 0)
            .attr("width", w)
            .attr("height", height / 5)
            .attr("x", scale(d));
    });
};
