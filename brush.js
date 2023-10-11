const onBrushStarts = () => {
    // clear brush
    d3.selectAll("g.scatter-plot").call(d3.brush().move, null);

    // recover faded circles
    Array.from(document.querySelectorAll("circle.dot")).forEach((c) => {
        c.setAttribute("fade", "");
    });
};

function onBrushEnds() {
    const sel = d3.brushSelection(this);

    if (sel) {
        const [[x0, y0], [x1, y1]] = sel;

        const select_ids = Array.from(this.querySelectorAll("circle"))
            .filter((c) => {
                const cx = c.cx.baseVal.value;
                const cy = c.cy.baseVal.value;
                return cx > x0 && cx < x1 && cy > y0 && cy < y1;
            })
            .map((d) => d.getAttribute("data-id"));

        // fade circles which are not selected
        Array.from(document.querySelectorAll("circle.dot")).forEach((c) => {
            if (!select_ids.includes(c.getAttribute("data-id")))
                c.setAttribute("fade", "true");
        });
    }
}
