const legend_svg = d3.select("svg#legend");

const addLegends = () => {
    const width = legend_svg.attr("width");

    const m = 10; // spacing between rect & text
    const rect_width = width / 4;
    const vertical_spacing = rect_width / 2;

    const g = legend_svg.append("g");
    Object.keys(color_map).forEach((name, i) => {
        const l_g = g
            .append("g")
            .attr("transform", `translate(0,${vertical_spacing * i})`);

        l_g.append("rect")
            .attr("class", "legend")
            .attr("width", rect_width)
            .attr("height", rect_width / 4)
            .style("fill", color_map[name]);

        l_g.append("text")
            .text(formatAttr(name))
            .attr("class", "legend-label")
            .attr("x", rect_width + m)
            .attr("y", 11);
    });
};
