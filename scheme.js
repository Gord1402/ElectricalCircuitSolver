function intersects(line1_start, line1_end, line2_start, line2_end) {
    var det, gamma, lambda;
    det =
        (line1_end.x - line1_start.x) * (line2_end.y - line2_start.y) -
        (line2_end.x - line2_start.x) * (line1_end.y - line1_start.y);
    if (det === 0) {
        return false;
    } else {
        lambda =
            ((line2_end.y - line2_start.y) * (line2_end.x - line1_start.x) +
                (line2_start.x - line2_end.x) * (line2_end.y - line1_start.y)) /
            det;
        gamma =
            ((line1_start.y - line1_end.y) * (line2_end.x - line1_start.x) +
                (line1_end.x - line1_start.x) * (line2_end.y - line1_start.y)) /
            det;
        return 0 < lambda && lambda < 1 && 0 < gamma && gamma < 1;
    }
}

function real_potential(p1, p2, R){
    return (p1 + (R - 1) * p2) / R;
}

class Connection {
    constructor(point0, point1, graph, resistance = 1) {
        this.point0 = point0;
        this.point1 = point1;
        this.graph = graph;
        this.direction = 0;
        this.resistance = resistance;
        this.amperage = undefined;
    }

    check_intersection(point_start, point_end) {
        return intersects(
            point_start,
            point_end,
            this.point0.position,
            this.point1.position
        );
    }
    

    draw(context) {
        if (theme == "dark") {
            context.fillStyle = "rgb(175, 145, 132)";
            context.strokeStyle = "rgb(175, 145, 132)";
        } else {
            context.fillStyle = "rgb(0, 0, 0)";
            context.strokeStyle = "rgb(0, 0, 0)";
        }

        var vec = this.vector;
        var norm = this.normal;

        context.beginPath();
        context.moveTo(this.point0.position.x + this.graph.x, this.point0.position.y + this.graph.y);
        var p1 = Vector.add(Vector.mul(vec, 0.3333333333), this.point0.position);
        context.lineTo(p1.x + this.graph.x, p1.y + this.graph.y);
        var p2 = Vector.add(Vector.mul(vec, 0.6666666666), this.point0.position);
        context.moveTo(p2.x + this.graph.x, p2.y + this.graph.y);
        context.lineTo(this.point1.position.x + this.graph.x, this.point1.position.y + this.graph.y);
        context.stroke();

        context.moveTo(p1.x + this.graph.x, p1.y + this.graph.y);
        context.lineTo(p1.x + norm.x * 10 + this.graph.x, p1.y + norm.y * 10 + this.graph.y);
        context.lineTo(p2.x + norm.x * 10 + this.graph.x, p2.y + norm.y * 10 + this.graph.y);
        context.lineTo(p2.x + this.graph.x, p2.y + this.graph.y);
        context.lineTo(p2.x - norm.x * 10 + this.graph.x, p2.y - norm.y * 10 + this.graph.y);
        context.lineTo(p1.x - norm.x * 10 + this.graph.x, p1.y - norm.y * 10 + this.graph.y);
        context.lineTo(p1.x + this.graph.x, p1.y + this.graph.y);
        context.stroke();

        if (true){
            var pos = Vector.add(Vector.mul(vec, 0.5), this.point0.position); 
            context.font = "20px script";
            context.textAlign = "center";
            context.save();
            if (vec.x < 0){
                context.translate(
                    pos.x - norm.x * 5 + this.graph.x,
                    pos.y - norm.y * 5  + this.graph.y
                );
                context.rotate(Math.atan2(vec.y, vec.x) - Math.PI);
            }
            else 
            {
                context.translate(
                    pos.x + norm.x * 5 + this.graph.x,
                    pos.y + norm.y * 5 + this.graph.y
                );
                context.rotate(Math.atan2(vec.y, vec.x));
            }
            context.fillText(
                "(" + fraction2str(approx_fraction(this.resistance)) + ") R",
                0,
                0
            );
            context.restore();
            context.font = "10px sans-serif";
            context.textAlign = "start";
        }


        if (this.direction != 0) {
            var arrow_start = Vector.add(
                Vector.add(Vector.mul(vec, 0.25), this.point0.position),
                Vector.mul(norm, 15)
            );
            var arrow_end = Vector.add(
                Vector.add(Vector.mul(vec, 0.75), this.point0.position),
                Vector.mul(norm, 15)
            );
            context.beginPath();
            context.moveTo(arrow_start.x + this.graph.x, arrow_start.y + this.graph.y);
            context.lineTo(arrow_end.x + this.graph.x, arrow_end.y + this.graph.y);

            var branch_parent = this.direction > 0 ? arrow_end : arrow_start;
            var text_parent = Vector.add(
                Vector.add(Vector.mul(vec, 0.5), this.point0.position),
                Vector.mul(norm, 15)
            );
            var branch_dir = this.direction > 0 ? -1 : 1;

            context.moveTo(branch_parent.x + this.graph.x, branch_parent.y + this.graph.y);
            var branch0 = Vector.add(
                Vector.add(branch_parent, Vector.mul(norm, 5)),
                Vector.mul(this.normalized_vector, 10 * branch_dir)
            );
            var branch1 = Vector.add(
                Vector.add(branch_parent, Vector.mul(norm, -5)),
                Vector.mul(this.normalized_vector, 10 * branch_dir)
            );
            context.lineTo(branch0.x + this.graph.x, branch0.y + this.graph.y);
            context.moveTo(branch_parent.x + this.graph.x, branch_parent.y + this.graph.y);
            context.lineTo(branch1.x + this.graph.x, branch1.y + this.graph.y);

            context.stroke();

            if (this.amperage) {
                context.font = "20px script";
                context.textAlign = "center";
                context.save();
                context.translate(
                    text_parent.x + norm.x * 10 + this.graph.x,
                    text_parent.y + norm.y * 10 + this.graph.y
                );
                if (vec.x < 0)
                    context.rotate(Math.atan2(vec.y, vec.x) - Math.PI);
                else context.rotate(Math.atan2(vec.y, vec.x));
                context.fillText(
                    "(" + fraction2str(approx_fraction(this.amperage)) + ")I",
                    0,
                    0
                );
                context.restore();
                context.font = "10px sans-serif";
                context.textAlign = "start";
            }
        }
    }

    connected(point, type = "any") {
        if (point.graph !== this.graph) return false;
        if (type == "any")
            return point.id === this.point0.id || point.id === this.point1.id;
        if (type == "input") return point.id === this.input.id;
        if (type == "output") return point.id === this.output.id;
        return false;
    }

    connected_id(id) {
        return id === this.point0.id || id == this.point1.id;
    }

    get input() {
        return this.direction > 0 ? this.point0 : this.point1;
    }

    get output() {
        return this.direction > 0 ? this.point1 : this.point0;
    }

    get vector() {
        return Vector.sub(this.point1.position, this.point0.position);
    }

    get normalized_vector() {
        return Vector.normalize(this.vector);
    }

    get normal() {
        var normalized = this.normalized_vector;
        return new Vector(-normalized.y, normalized.x);
    }
}

class Point {
    constructor(position, id, graph) {
        this.position = position;
        this.id = id;
        this.graph = graph;
        this.potential = undefined;
        this.selected = 0;
    }

    distance(point) {
        if (point instanceof Point) {
            Vector.len(Vector.sub(this.position, point.position));
        }
        return Vector.len(Vector.sub(this.position, point));
    }

    set_theme(theme){
        if (theme == "dark") {
            if (this.selected == 0) context.fillStyle = "rgb(175, 145, 132)";
            if (this.selected == 1) context.fillStyle = "rgb(215, 135, 122)";
            if (this.selected == 2) context.fillStyle = "rgb(155, 205, 122)";
            context.strokeStyle = "rgb(175, 145, 132)";
        } else {
            if (this.selected == 0) context.fillStyle = "rgb(0, 0, 0)";
            if (this.selected == 1) context.fillStyle = "rgb(150, 87, 56)";
            if (this.selected == 2) context.fillStyle = "rgb(46, 175, 34)";
            context.strokeStyle = "rgb(0, 0, 0)";
        }
    }

    draw(context, theme) {
        this.set_theme(theme);
        context.beginPath();
        context.arc(this.position.x + this.graph.x, this.position.y + this.graph.y, 5, 0, Math.PI * 2, false);
        context.fill();
        context.fillText(this.id, this.position.x - 10 + this.graph.x, this.position.y + 10 + this.graph.y);
        if (this.potential != undefined) {
            context.fillText(
                fraction2str(approx_fraction(this.potential)),
                this.position.x + 10 + this.graph.x,
                this.position.y - 10 + this.graph.y
            );
        }
    }
}

class Graph {
    constructor() {
        this.points = [];
        this.connections = [];
        this.total_amperage = undefined;
        this.x = 0;
        this.y = 0;
        this.scale = 1;
    }

    convert(value) {
        if (value instanceof Point) {
            if (value.graph !== this)
                throw new Error("Cannot get point from other graph!");
            return value;
        } else if (typeof value == "number") {
            if (value < 0 || value >= this.count_points)
                throw new Error("Uncorrect point index!");
            return this.points[value];
        } else {
            throw new Error("Unknow point type!");
        }
    }

    nearest(point) {
        var nearest = -1;
        var nearest_distance = 99999999;
        for (var i = 0; i < this.count_points; i++) {
            var dist = this.points[i].distance(point);
            if (dist < nearest_distance) {
                nearest_distance = dist;
                nearest = i;
            }
        }
        return nearest;
    }

    get_intersected(point0, point1) {
        for (var i = 0; i < this.count_edges; i++) {
            if (this.connections[i].check_intersection(point0, point1)) {
                return i;
            }
        }
        return -1;
    }

    add_point(position, connections) {
        this.points.push(new Point(position, this.points.length, this));
        for (var i = 0; i < connections.length; i++) {
            this.connect(this.points[this.points.length - 1], connections[i]);
        }
    }

    remove_point(id) {
        this.points.splice(id, 1);
        for (var i = 0; i < this.count_edges; i++) {
            if (this.connections[i].connected_id(id)) {
                this.connections.splice(i, 1);
                i--;
            }
        }
        for (var i = 0; i < this.count_points; i++) {
            this.points[i].id = i;
        }
    }

    remove_connection(connection_id) {
        this.connections.splice(connection_id, 1);
    }

    connect(point0, point1, resistance=1) {
        var first = this.convert(point0);
        var second = this.convert(point1);

        if (first === second) {
            throw Error("Cannot connect point with it self!");
        }
        this.connections.push(new Connection(first, second, this, resistance));
    }

    get_connected(point) {
        point = this.convert(point);
        var result = [];
        for (var i = 0; i < this.count_edges; i++) {
            if (this.connections[i].point0 === point)
                result.push(this.connections[i].point1.id);
            else if (this.connections[i].point1 === point)
                result.push(this.connections[i].point0.id);
        }
        return result;
    }

    get_connections(point, type = "any") {
        point = this.convert(point);
        var result = [];
        for (var i = 0; i < this.count_edges; i++) {
            if (this.connections[i].connected(point, type))
                result.push(this.connections[i]);
        }
        return result;
    }

    find_connection(point0, point1) {
        point0 = this.convert(point0);
        point1 = this.convert(point1);
        for (var i = 0; i < this.count_edges; i++) {
            if (
                this.connections[i].connected(point0) &&
                this.connections[i].connected(point1)
            ) {
                return i;
            }
        }
        return -1;
    }

    draw(context, theme) {
        for (var i = 0; i < this.count_points; i++) {
            this.points[i].draw(context, theme);
        }
        for (var i = 0; i < this.count_edges; i++) {
            this.connections[i].draw(context, theme);
        }
    }

    calculate_potentials(points) {
        for (var i = 0; i < this.count_points; i++) {
            this.points[i].potential = 0;
        }
        for (var i = 0;i < points.length;i++){
            this.points[points[i][0]].potential = points[i][1];
        }
        // this.points[point_start].potential = 1;
        // this.points[point_end].potential = -1;
        var changed = 1;
        for (var j = 0; j < 140000; j++) {
            changed = 0;
            this.points.forEach((point) => {
                for (var i = 0;i < points.length;i++){
                    if (points[i][0] == point.id) return;
                }
                var all_connected = this.get_connected(point);
                var sum = 0;
                var count = 0;
                for (var i = 0; i < all_connected.length; i++) {
                    var connection_resistance = this.connections[this.find_connection(point, this.points[all_connected[i]])].resistance;
                    sum += this.points[all_connected[i]].potential / connection_resistance;
                    count +=  1 / connection_resistance;
                }
                point.potential = sum / count;
            });
        }
    }
// 1 1/3  -1/3  -1
    calculate_directions(points) {
        for (var i = 0; i < this.count_edges; i++) {
            this.connections[i].direction = 0;
            this.connections[i].amperage = undefined;
        }
        this.calculate_potentials(points);
        this.connections.forEach((connection) => {
            if (Math.round(connection.point0.potential / 0.00001) * 0.00001 > Math.round(connection.point1.potential / 0.00001) * 0.00001) {
                connection.direction = 1;
            } else if (
                Math.round(connection.point0.potential / 0.00001) * 0.00001 < Math.round(connection.point1.potential / 0.00001) * 0.00001
            ) {
                connection.direction = -1;
            } else {
                connection.direction = 0;
            }
        });
    }

    calculate_amperage(points, simplify=true) {
        this.calculate_directions(points);
        var maximum_denominator = 1;

        this.connections.forEach((connection) => {
            if (connection.direction == 0) return;
            connection.amperage = (connection.input.potential - connection.output.potential) / connection.resistance;
            var denominator = approx_fraction(connection.amperage)[1];
            if (denominator > maximum_denominator)
                maximum_denominator = denominator;
        });
        if (simplify){
        
            this.connections.forEach((connection) => {
                connection.amperage = connection.amperage * maximum_denominator;
            });
        }

        this.total_amperage = 0;

        var input_connections = this.get_connections(points[0][0], "input");

        input_connections.forEach((connection) => {
            this.total_amperage += connection.amperage;
        });
    }

    calculate_resistance(point_start, point_end) {
        this.calculate_amperage([[point_start, 1], [point_end, -1]]);
        var one_way = 0;

        var point = this.points[point_start];

        while (point.id != point_end) {
            var input_connections = this.get_connections(point, "input");
            one_way += input_connections[0].amperage * input_connections[0].resistance;
            point = input_connections[0].output;
        }

        return one_way / this.total_amperage;
    }

    solution(point_start, point_end) {
        this.calculate_amperage([[point_start, 1], [point_end, -1]]);
        var solution = "(";
        var one_way = 0;

        var point = this.points[point_start];

        while (point.id != point_end) {
            var input_connections = this.get_connections(point, "input");
            var connection = undefined;
            for (var i = 0;i < input_connections.length;i++){
                if (input_connections[i].amperage && input_connections[i].amperage > 0) {
                    connection = input_connections[i];
                }
            }
            one_way += connection.amperage * connection.resistance;
            if (point.id != point_start) solution += " + ";
            solution +=
                "(" +
                fraction2str(approx_fraction(connection.amperage * connection.resistance)) +
                ") * IR";
            point = connection.output;
        }
        solution +=
            ") / ((" +
            fraction2str(approx_fraction(this.total_amperage)) +
            ") * I) = " +
            fraction2str(approx_fraction(one_way / this.total_amperage)) + "R";
        return solution;
    }

    get count_points() {
        return this.points.length;
    }
    get count_edges() {
        return this.connections.length;
    }
}
