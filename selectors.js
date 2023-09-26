const createSelectors = () => {
    const selector_div = document.getElementById("selector-div");

    class_order.forEach((cls, id) => {
        const selector = document.createElement("span");
        selector.setAttribute("class", "selector");
        selector_div.appendChild(selector);

        const span = document.createElement("span");
        span.setAttribute("class", "selector-name");
        span.innerText = cls;

        const left_btn = document.createElement("button");
        left_btn.innerText = "<";
        left_btn.addEventListener("click", () => rearrangeSelectors(id, 0));

        const right_btn = document.createElement("button");
        right_btn.innerText = ">";
        right_btn.addEventListener("click", () => rearrangeSelectors(id, 1));

        selector.appendChild(left_btn);
        selector.appendChild(span);
        selector.appendChild(right_btn);
    });
};

const rearrangeSelectors = (id, lr) => {
    // id: index to be moved
    // ud: 0 for moving left, 1 for moving right

    if (lr == 0) {
        if (id == 0) return;

        [class_order[id], class_order[id - 1]] = [class_order[id - 1], class_order[id]];
    } else {
        if (id == class_order.length - 1) return;

        [class_order[id], class_order[id + 1]] = [class_order[id + 1], class_order[id]];
    }

    document.getElementById("selector-div").innerHTML = "";
    createSelectors();
    createPlot();
};
