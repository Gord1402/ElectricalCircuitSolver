class EditTool {
    constructor(graph) {
        this.graph = graph;
        this.selected = -1;
        this.drawing_from = -1;
        this.moved = -1;
        this.drawX = 0;
        this.drawY = 0;
        this.description = `Инструмент для создания новых точек/связей.<br/><br/><br/>
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

    mousedown(event) {
        if (event.button == 0) {
            var pos = new Vector(event.offsetX, event.offsetY);
            var nearest = this.graph.nearest(pos);
            if (nearest > -1 && this.graph.points[nearest].distance(pos) <= 5) {
                this.selected = nearest;
            } else {
                this.graph.add_point(pos, []);
                this.selected = graph.count_points - 1;
            }

            if (this.drawing_from != -1) {
                this.graph.connect(this.drawing_from, this.selected);
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
                    this.drawX = event.offsetX;
                    this.drawY = event.offsetY;
                } else {
                    this.drawing_from = -1;
                }
                this.selected = -1;
            }
        }
    }

    mousemove(event) {
        if (this.drawing_from != -1) {
            this.drawX = event.offsetX;
            this.drawY = event.offsetY;
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
                this.graph.points[this.drawing_from].position.x,
                this.graph.points[this.drawing_from].position.y
            );
            context.lineTo(this.drawX, this.drawY);
            context.stroke();
        }
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

    mousedown(event) {
        if (event.button == 0) {
            var pos = new Vector(event.offsetX, event.offsetY);
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
            var pos = new Vector(event.offsetX, event.offsetY);
            if (
                this.path.length == 0 ||
                Vector.len(Vector.sub(this.path[this.path.length - 1], pos)) > 5
            ) {
                this.path.push(pos);
            }

            var intersect = this.graph.get_intersected(
                pos,
                new Vector(
                    event.offsetX - event.movementX,
                    event.offsetY - event.movementY
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
        context.moveTo(this.path[0].x, this.path[0].y);
        for (var i = 1; i < this.path.length; i++) {
            context.lineTo(this.path[i].x, this.path[i].y);
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

    mousedown(event) {
        if (event.button == 0) {
            var pos = new Vector(event.offsetX, event.offsetY);
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
