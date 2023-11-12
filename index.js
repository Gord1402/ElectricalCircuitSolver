const canvas = document.getElementById("main");
const context = canvas.getContext("2d");

const app = document.getElementsByClassName("app")[0];

var description = document.getElementById("tool_description");

var graph = new Graph();

var tools = [new EditTool(graph), new DeleteTool(graph), new SolveTool(graph)];

var selected_tool = 0;

function select_tool(id) {
    tools[selected_tool].reset();
    description.innerHTML = tools[id].description;
    selected_tool = id;
}

function draw(timeStamp) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    graph.draw(context, theme);
    tools[selected_tool].draw(context, theme)
    window.requestAnimationFrame(draw);
}



canvas.addEventListener("mousedown", (event) => {
    tools[selected_tool].mousedown(event);
});

canvas.addEventListener("mouseup", (event) => {
    tools[selected_tool].mouseup(event);
});

canvas.addEventListener("mousemove", (event) => {
    tools[selected_tool].mousemove(event);
});

window.addEventListener("keydown", (event) => {
    tools[selected_tool].keydown(event);
});



window.addEventListener("resize", resizeCanvas, false);
function resizeCanvas() {
    canvas.width = document.getElementsByClassName("content")[0].clientWidth;
    canvas.height = document.getElementsByClassName("content")[0].clientHeight;
}
resizeCanvas();

window.requestAnimationFrame(draw);


var theme = window.localStorage.getItem("theme");

if (theme === "dark") 
{
    app.classList.add("dark");
    context.fillStyle = "rgb(175, 145, 132)";
    context.strokeStyle = "rgb(175, 145, 132)";
}
function switchTheme() {
    app.classList.toggle("dark");
    if (theme === "dark") {
        theme = "ligth";
        window.localStorage.setItem("theme", "light");
        context.fillStyle = "rgb(0, 0, 0)";
        context.strokeStyle = "rgb(0, 0, 0)";
    } else 
    {
        theme = "dark";
        window.localStorage.setItem("theme", "dark");
        context.fillStyle = "rgb(175, 145, 132)";
        context.strokeStyle = "rgb(175, 145, 132)";
    }
}

select_tool(0);