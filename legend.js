const addLegends = () => {
    const legend_margin =
        (svg_size - svg_padding.left) / Object.keys(color_map).length;

    const g = svg
        .append("g")
        .attr(
            "transform",
            `translate(${svg_padding.left + g_size / 2 - 50},70)`
        );

    Object.keys(color_map).forEach((name, i) => {
        const legend_g = g
            .append("g")
            .attr("class", "legend-container")
            .attr("transform", `translate(${legend_margin * i},-50)`);

        addSingleLegend(legend_g, name, color_map[name]);
    });
};

const addSingleLegend = (g, name, color) => {
    const m = 20; // spacing between circle & text

    g.append("circle").attr("class", "legend").attr("fill", color);

    g.append("text")
        .text(name)
        .attr("class", "legend")
        .attr("x", m)
        .attr("y", 10);
};

addLegends();
