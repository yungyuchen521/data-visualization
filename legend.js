const offset = 100;
const legend_margin = width / Object.keys(color_map).length;

const addSingleLegend = (parent_g, name, color) => {
    const m = 40; // spacing between circle & text

    parent_g
        .append("rect")
        .attr("class", "legend-color")
        .attr("width", 30)
        .attr("height", 7)
        .style("fill", color)

    parent_g
        .append("text")
        .text(name)
        .attr("class", "legend-label")
        .attr("x", m)
        .attr("y", 10);
};

Object.keys(color_map).forEach((name, i) => {
    const l_g = svg
        .append("g")
        .attr("class", "legend-container")
        .attr("transform", `translate(${offset + legend_margin * i},20)`);

    addSingleLegend(l_g, name, color_map[name]);
});