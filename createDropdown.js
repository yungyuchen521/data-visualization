const option_list = [
  "sepal length",
  "sepal width",
  "petal length",
  "petal width",
];

const createDropdown = (text, selector_id, default_option) => {
  const label = document.createElement("label");
  label.setAttribute("class", "selector")
  label.setAttribute("for", selector_id);
	label.innerText = text;

  const select = document.createElement("select");
  select.setAttribute("id", selector_id);

  option_list.forEach(op => {
  	const option = document.createElement("option");
    option.value = op;
    option.innerText = op;

    option.setAttribute("class", "selector")
    if (op == default_option)
      option.setAttribute("selected", "")
  
    select.appendChild(option);
  });
  
  const inner_container = document.createElement("div");
  inner_container.setAttribute("class", "selector-container")
  inner_container.appendChild(label);
  inner_container.appendChild(select);

  document.querySelector("div.selector-outer-container")
  	.appendChild(inner_container);
};

const default_x = "sepal length";
const default_y = "sepal width";

const select_x_id = "select_x";
const select_y_id = "select_y";

createDropdown("x axis: ", select_x_id, default_x);
createDropdown("y axis: ", select_y_id, default_y);
