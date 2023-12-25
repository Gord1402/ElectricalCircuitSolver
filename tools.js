class EditTool {
    constructor(graph) {
        this.graph = graph;
        this.selected = -1;
        this.drawing_from = -1;
        this.moved = -1;
        this.drawX = 0;
        this.drawY = 0;
        this.description = `Сопротивление новых соендинений: <input type="number" id="resistance" step="0.0001" min="0.00001" max="100000" value="1"/> R<br/><br/>
Инструмент для создания новых точек/связей.<br/><br/><br/>
ЛКМ по пустому полю - Добавить точку и начать создание связи.<br/><br/>
ЛКМ по точке - Начать создание связи.<br/><br/>
Зажать точку - Передвинуть.<br/><br/>
ЛКМ по пустому полю при создании связи - Добавить точку и соендинить.<br/><br/>
ЛКМ по точке при создании связи - Соендинить.<br/><br/>
ПКМ при создании связи - Отменить.<br/><br/>
`;
    }

    reset() {
        this.selected = -1;
        this.drawing_from = -1;
        this.moved = -1;
        this.drawX = 0;
        this.drawY = 0;
    }

    init(){
        if (this.resistance == undefined) this.resistance = 1;
        this.resistance_input = document.getElementById("resistance");
        this.resistance_input.value = this.resistance;
        var tool = this;
        this.resistance_input.addEventListener('change', (event)=>{
            if (event.target.value <= 0) {
                tool.resistance_input.value = 0.0001;
                return
            }
            tool.resistance = event.target.value;
        });
    }

    mousedown(event) {
        if (event.button == 0) {
            var pos = new Vector(event.offsetX - this.graph.x, event.offsetY - this.graph.y);
            var nearest = this.graph.nearest(pos);
            if (nearest > -1 && this.graph.points[nearest].distance(pos) <= 5) {
                this.selected = nearest;
            } else {
                this.graph.add_point(pos, []);
                this.selected = graph.count_points - 1;
            }

            if (this.drawing_from != -1) {
                this.graph.connect(this.drawing_from, this.selected, this.resistance);
            }
            this.drawing_from = -1;

            this.moved = 0;
        } else if (event.button == 2) {
            if (this.drawing_from != -1) {
                this.drawing_from = -1;
            }
        }
    }

    mouseup(event) {
        if (event.button == 0) {
            if (this.selected != -1) {
                if (this.moved < 15) {
                    this.drawing_from = this.selected;
                    this.drawX = event.offsetX - this.graph.x;
                    this.drawY = event.offsetY - this.graph.y;
                } else {
                    this.drawing_from = -1;
                }
                this.selected = -1;
            }
        }
    }

    mousemove(event) {
        if (this.drawing_from != -1) {
            this.drawX = event.offsetX  - this.graph.x;
            this.drawY = event.offsetY  - this.graph.y;
        }
        if (this.selected != -1) {
            this.graph.points[this.selected].position.add(
                new Vector(event.movementX, event.movementY)
            );
            this.moved += Math.sqrt(
                event.movementX * event.movementX +
                    event.movementY * event.movementY
            );
        }
    }

    keydown(event) {
        if (this.drawing_from != -1) {
            if (event.code == "Escape") {
                this.drawing_from = -1;
            }
        }
    }

    draw(context, theme) {
        if (theme == "dark") {
            context.fillStyle = "rgb(175, 145, 132)";
            context.strokeStyle = "rgb(175, 145, 132)";
        } else {
            context.fillStyle = "rgb(0, 0, 0)";
            context.strokeStyle = "rgb(0, 0, 0)";
        }
        if (this.drawing_from != -1) {
            context.beginPath();
            context.moveTo(
                this.graph.points[this.drawing_from].position.x  + this.graph.x,
                this.graph.points[this.drawing_from].position.y  + this.graph.y
            );
            context.lineTo(this.drawX + this.graph.x, this.drawY + this.graph.y);
            context.stroke();
        }
    }
}

class MoveTool {
    constructor(graph) {
        this.graph = graph;
        this.dragged = false;
        this.description = `Инструмент для перемещения по полю.<br/><br/><br/>
Зажать ЛКМ и двигать для перемещения<br/><br/>
`;
    }

    reset() {
        this.dragged = false;
    }

    init(){
        
    }

    mousedown(event) {
        if (event.button == 0) {
            this.dragged = true;
        }
    }

    mouseup(event) {
        this.dragged = false;
    }

    mousemove(event) {
        if (this.dragged) {
            this.graph.x += event.movementX;
            this.graph.y += event.movementY;
        }
    }

    keydown(event) {}

    draw(context, theme) {
    }
}


class DeleteTool {
    constructor(graph) {
        this.graph = graph;
        this.dragged = false;
        this.path = [];
        this.description = `Инструмент для удаления точек/связей.<br/><br/><br/>
ЛКМ по точке - Удалить точку.<br/><br/>
Перемещение с зажатой ЛКМ - Удаление точек и связей при пересечении.<br/><br/>
`;
    }

    reset() {
        this.dragged = false;
        this.path = [];
    }

    init(){
        
    }

    mousedown(event) {
        if (event.button == 0) {
            var pos = new Vector(event.offsetX - this.graph.x, event.offsetY - this.graph.y);
            var nearest = this.graph.nearest(pos);
            if (nearest > -1 && this.graph.points[nearest].distance(pos) <= 5) {
                this.graph.remove_point(nearest);
            }
            this.dragged = true;
        }
    }

    mouseup(event) {
        this.dragged = false;
    }

    mousemove(event) {
        if (this.dragged) {
            var pos = new Vector(event.offsetX - this.graph.x, event.offsetY - this.graph.y);
            if (
                this.path.length == 0 ||
                Vector.len(Vector.sub(this.path[this.path.length - 1], pos)) > 5
            ) {
                this.path.push(pos);
            }

            var intersect = this.graph.get_intersected(
                pos,
                new Vector(
                    event.offsetX - event.movementX - this.graph.x,
                    event.offsetY - event.movementY - this.graph.y
                )
            );
            if (intersect != -1) {
                this.graph.remove_connection(intersect);
            }

            var nearest = this.graph.nearest(pos);
            if (
                nearest > -1 &&
                this.graph.points[nearest].distance(pos) <= 15
            ) {
                this.graph.remove_point(nearest);
            }
        }
    }

    keydown(event) {}

    draw(context, theme) {
        if (this.path.length == 0) return;
        if (theme == "dark") {
            context.fillStyle = "rgb(175, 145, 132)";
            context.strokeStyle = "rgb(230, 115, 102)";
        } else {
            context.fillStyle = "rgb(0, 0, 0)";
            context.strokeStyle = "rgb(176, 45, 54)";
        }
        context.beginPath();
        context.moveTo(this.path[0].x + this.graph.x, this.path[0].y + this.graph.y);
        for (var i = 1; i < this.path.length; i++) {
            context.lineTo(this.path[i].x + this.graph.x, this.path[i].y + this.graph.y);
        }
        context.stroke();
        if (this.dragged) {
            while (this.path.length >= 10) this.path.shift();
        } else {
            this.path.shift();
        }
    }
}

class SolveTool {
    constructor(graph) {
        this.graph = graph;
        this.point_start = undefined;
        this.point_end = undefined;
        this.description = `Инструмент для решения схемы.<br/><br/><br/>
При первом ЛКМ на точку - выбирается точка +.<br/><br/>
При втором ЛКМ на точку - выбирается точка и происходит решение.<br/><br/>
При следуюйшем клике - выбор отменяется и выбирается точка +.<br/><br/>
`;
    }

    reset() {
        if (this.point_start) this.point_start.selected = 0;
        if (this.point_end) this.point_end.selected = 0;
        this.point_start = undefined;
        this.point_end = undefined;
    }

    init(){
        
    }

    mousedown(event) {
        if (event.button == 0) {
            var pos = new Vector(event.offsetX - this.graph.x, event.offsetY - this.graph.y);
            var nearest = this.graph.nearest(pos);
            if (nearest > -1 && this.graph.points[nearest].distance(pos) <= 5) {
                if (this.point_start == undefined) {
                    this.point_start = this.graph.points[nearest];
                    this.point_start.selected = 1;
                } else if (this.point_end == undefined) {
                    this.point_end = this.graph.points[nearest];
                    this.point_end.selected = 2;
                    document.getElementsByClassName("solution")[0].innerHTML =
                        "`" +
                        this.graph.solution(
                            this.point_start.id,
                            this.point_end.id
                        ) +
                        "`";
                    MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
                } else {
                    this.point_start.selected = 0;
                    this.point_start = this.graph.points[nearest];
                    this.point_start.selected = 1;
                    this.point_end.selected = 0;
                    this.point_end = undefined;
                }
            }
        }
    }

    mouseup(event) {}

    mousemove(event) {}

    keydown(event) {}

    draw(context, theme) {}
}

class PotentialTool {
    constructor(graph) {
        this.graph = graph;
        this.points = [];
        this.potential = 1;
        this.description = `Потенциал: <input type="number" id="potential" step="0.0001" min="-100000" max="100000" value="1"/> U<br/>
<button id="solve">Решить</button><br/><br/>
Инструмент для решения схемы.<br/><br/><br/>
При ЛКМ на точку - выбирается точка с заданным потенциалом.<br/><br/>
При ПКМ на точку - точка уберается.<br/><br/>
При нажатии на кнопку происходит решение<br/><br/>
`;
    }

    reset() {
        this.points = [];
    }

    init(){
        this.potential_input = document.getElementById("potential");
        this.potential_input.value = this.potential;
        var tool = this;
        this.potential_input.addEventListener('change', (event)=>{
            tool.potential = event.target.value;
        });

        this.solve_button = document.getElementById("solve");
        this.solve_button.addEventListener("click",(event)=>{
            tool.graph.calculate_amperage(tool.points, false);
        });
    }

    mousedown(event) {
        if (event.button == 0) {
            var pos = new Vector(event.offsetX - this.graph.x, event.offsetY - this.graph.y);
            var nearest = this.graph.nearest(pos);
            if (nearest > -1 && this.graph.points[nearest].distance(pos) <= 5) {
                for (var i = 0; i < this.points.length;i++){
                    if (this.points[i][0] == nearest) 
                    {
                        this.points[i][1] = this.potential;
                        this.graph.points[nearest].potential = this.potential;
                        return;
                    }
                }
                this.points.push([nearest, this.potential]);
                this.graph.points[nearest].potential = this.potential;
            }
        }

        else if(event.button == 2) {
            var pos = new Vector(event.offsetX - this.graph.x, event.offsetY - this.graph.y);
            var nearest = this.graph.nearest(pos);
            if (nearest > -1 && this.graph.points[nearest].distance(pos) <= 5) {
                for (var i = 0; i < this.points.length;i++){
                    if (this.points[i][0] == nearest) 
                    {
                        this.points.slice(i, 1);
                        this.graph.points[nearest].potential = undefined;
                        return;
                    }
                }
            }
        }
    }

    mouseup(event) {}

    mousemove(event) {}

    keydown(event) {}

    draw(context, theme) {}
}
