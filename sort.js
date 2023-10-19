const createSorter = () => {
    const div = document.getElementById("sortby-container");

    const label = document.createElement("label");
    label.setAttribute("id", "sort-by-label");
    label.innerText = "Sort By";

    const select = document.createElement("select");

    div.appendChild(label);
    div.appendChild(select);

    const addOption = (attr) => {
        const op = document.createElement("option");
        op.value = attr;
        op.innerText = formatAttr(attr);

        select.appendChild(op);
    };

    addOption("scores_overall");
    attr_order.forEach((attr) => addOption(attr));

    select.addEventListener("change", handleOrderChange);
};

const handleOrderChange = () => {
    const sort_by = document.querySelector("select").value;
    if (sort_by != "scores_overall") {
        attr_order = attr_order.filter((a) => a != sort_by);
        attr_order.unshift(sort_by);
    }

    createPlots();
};
