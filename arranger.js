const container = svg
    .append("g")
    .attr("id", "arranger-container")
    .attr("transform", `translate(0,${padding.top})`);

const g_height = (inner_height / cls_order.length) * 0.7;
const g_width = padding.left * 0.6;

const rect_height = g_height;
const rect_width = g_width / 5;

const refreshArrangers = () => {
    container.html("");

    const getOffset = d3.scaleLinear().domain([0, cls_order.length]).range([0, inner_height]);

    container
        .selectAll("g")
        .data(cls_order.toReversed())
        .enter()
        .append("g")
        .attr("transform", (_, i) => `translate(0,${getOffset(i) - g_height})`)
        .attr("class", "drag")
        .attr("data-cls", (cls) => cls)
        .style("fill", "grey")
        .each(insertCard);

    dragHandler(d3.selectAll("g.drag"));
};

function insertCard(cls, _) {
    const target = d3.select(this);

    const rect_objs = [
        {
            w: rect_width,
            h: rect_height,
            class_name: "card-left",
            x: 0,
            y: rect_height,
            fill: color_map[cls],
        },
        {
            w: rect_width,
            h: rect_height,
            class_name: "card-right",
            x: g_width - rect_width,
            y: rect_height,
            fill: color_map[cls],
        },
        {
            w: g_width - 2 * rect_width,
            h: rect_height,
            class_name: "card-mid",
            x: rect_width,
            y: rect_height,
            fill: undefined,
        },
    ];

    rect_objs.forEach((rect) => {
        target
            .append("rect")
            .attr("width", rect.w)
            .attr("height", rect.h)
            .attr("class", rect.class_name)
            .attr("transform", `translate(${rect.x}, ${rect.y})`)
            .style("fill", rect.fill)
            .style("stroke", rect.fill);
    });

    const [type, rms] = cls.split("_");
    const text = target
        .append("text")
        .attr("class", "card-text")
        .attr("transform", `translate(${g_width / 2},${rect_height + 18})`)
        .style("fill", color_map[cls])

    text.append("tspan").attr("x", 0).text(type);
    text.append("tspan").attr("x", 0).attr("dy", "1em").text(`(${rms} rooms)`);
}

const dragHandler = d3.drag().on("drag", handleDragging).on("end", handleDragEnd);

function handleDragging() {
    d3.select(this).attr("transform", `translate(0,${d3.event.y})`);
}

function handleDragEnd() {
    const extractY = (s) => {
        s = s.replace("translate(", "").replace(")", "");
        s = s.split(",")[1];
        return +s;
    };

    const rect_arr = Array.from(document.querySelectorAll("g.drag")).map((rect) => {
        return {
            cls: rect.getAttribute("data-cls"),
            y: extractY(rect.getAttribute("transform")),
        };
    });

    rect_arr.sort((a, b) => b.y - a.y);
    cls_order = rect_arr.map((r) => r.cls);

    refreshArrangers();
    refreshPlot();
}

const insertGuide = () => {
    const text = svg
        .append("g")
        .append("text")
        .attr("id", "guide")
        .attr("transform", `translate(0, ${padding.top / 2 - 10})`);

    text.append("tspan").text("Drag the cards to").attr("x", 0);
    text.append("tspan").text("reorder streams").attr("x", 0).attr("dy", "1em");
};
