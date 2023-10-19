const createHeaders = () => {
    const svg = d3.select("svg#plot");
    const cols = Object.keys(cols_offset);

    svg.selectAll("g")
        .data(cols)
        .enter()
        .append("g")
        .attr("transform", (col) => `translate(${cols_offset[col]}, 20)`)
        .append("text")
        .each(insertText);
};

function insertText(text, _) {
    const ele = d3.select(this);
    text = text.toUpperCase();

    if (!text.includes(" ")) ele.text(text);
    else {
        text.split(" ").forEach((t, i) => {
            ele.append("tspan")
                .text(t)
                .attr("x", 0)
                .attr("dy", i ? "1em" : 0);
        });
    }
}
