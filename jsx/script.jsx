var doc;

var artboardRect = [];
var center;
var offset = 35;
var model = {
		lines: {
			horizontal: [],
			vertical: [],
			center: true,
		},
		offset: '',
		amount: 0,
		ellipse: {
			top: 0,
			left: 0,
			diameter: 0,
		}
	};
	// inside,
	// outer,
	// center,
var grid = [];
var value = {};
var panelValues = {};
var circles = [];

function startScript(param) {
	var paramArray = param.split(',');
	var type = paramArray[0];
	var property = paramArray[1];

	model.amount = parseInt(paramArray[2], 10);
	doc = app.activeDocument;
	doc.defaultStroked = true;
	doc.defaultFilled = true;
	doc.defaultStrokeWidth = 0.25;

	artboardRect = doc.artboards[0].artboardRect;
	center = {
		x: (artboardRect[2] + artboardRect[0]) / 2,
		y: (artboardRect[3] + artboardRect[1]) / 2,
	};

	preparePrimitives(type, property);
}

function preparePrimitives(type, property) {
	property = 'fromCenter';

	switch (property) {
		case 'fromCenter':
			model.lines = {
					horizontal: [[artboardRect[0], center.y], [artboardRect[2], center.y]],
					vertical: [[center.x, artboardRect[1]], [center.x, artboardRect[3]]],
					center: true,
				};
			break;
		case 'alignObject':
			break;
		case 'fill':
			break;
		default:
			alert( "Нет таких значений" );
	}

	switch (type) {
		case 'rectGrid':
			drawRectGrid();
			break;
		case 'ellipseGrid':
			drawCircleGrid();
			break;
		default:
			alert( "Нет таких значений" );
	}
}

function drawRectGrid() {
	var horCoords = model.lines.horizontal;
	var vertCoords = model.lines.vertical;
	var horLine = doc.pathItems.add();
	var vertLine = doc.pathItems.add();
	var x = 0;
	var y = 0;

	horLine.setEntirePath(Array(Array(horCoords[0][0], horCoords[0][1]), Array(horCoords[1][0], horCoords[1][1])));
	vertLine.setEntirePath(Array(Array(vertCoords[0][0], vertCoords[0][1]), Array(vertCoords[1][0], vertCoords[1][1])));

	horLine.strokeColor = returnColor(9, 77, 123);
	vertLine.strokeColor = returnColor(9, 77, 123);
	horLine.filled = false;
	vertLine.filled = false;

	grid.push(horLine);
	grid.push(vertLine);

	for (var i = 0; i < model.amount / 2; i++) {
		x = offset + offset * i;
		y = offset + offset * i;

		duplicateEl(horLine, 0, y);
		duplicateEl(horLine, 0, -y);
		duplicateEl(vertLine, x, 0);
		duplicateEl(vertLine, -x, 0);
	}

	createGroup();
}

function drawCircleGrid() {
	var circleOffset = offset * 2;

	for (var i = 0; i < model.amount; i++) {
		var circle = doc.pathItems.ellipse(
			center.y + offset + offset * i,
			center.x - offset - offset * i,
			circleOffset + circleOffset * i,
			circleOffset + circleOffset * i
		);

		circle.strokeColor = returnColor(9, 77, 123);
		circle.filled = false;

		grid.push(circle);
	}
}

function returnColor(r, g, b){
	var color = new RGBColor();
	color.red   = r;
	color.green = g;
	color.blue  = b;
	return color;
}

function duplicateEl(el, x, y) {
	var elCopy = el.duplicate(el, ElementPlacement.PLACEAFTER);

	elCopy.translate(x, y);
	grid.push(elCopy);
}

function createGroup() {
	var gridGroup = activeDocument.groupItems.add();

	for (i = 0; i < grid.length; i++) {
		grid[i].moveToEnd(gridGroup);
	}
}

// ------- //


function dialog() {
	var box = new Window('dialog', "Сетка");

	box.panel = box.add('panel', undefined, "Места");
	box.panel.add('statictext{text: "Количество мест: "}');
	panelValues.seats = box.panel.add('edittext {characters: 12, active: true}');
	box.panel.add('statictext{text: "Количество рядов: "}');
	panelValues.rows = box.panel.add('edittext {characters: 12, active: true}');
	box.panel.add('statictext{text: "Расстояние между рядами: "}');
	panelValues.size = box.panel.add('edittext {characters: 12, active: true}');
	box.closeBtn = box.add('button', undefined, "Ок", { name:'close' });

	box.closeBtn.onClick = function(){
		box.close();
		return this.value = true;
	}

	box.show();
}

function duplicateCircles() {
	var doc = app.activeDocument;
	dialog();

	value.seats = parseInt(panelValues.seats.text, 10);
	value.rows = parseInt(panelValues.rows.text, 10);
	value.size = parseInt(panelValues.size.text, 10);

	for (var i = 0; i < value.rows; i++) {
		var y = value.size * i;

		for (var k = 0; k < value.seats; k++) {
			var x = value.size * k;

			if (i === 0 && k === 0) {
				circles.push(doc.selection[0]);
			} else {
				duplicateEl(doc.selection[0], x, y);
			}
		}
	}
	createGroup();
}

