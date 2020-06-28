var doc;
var pi = Math.PI;
var artboardRect = [];
var center;
var offset = 35;
var seatOffset = {
	x: 35,
	y: 35,
	radius: 10,
};
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
var grid = [];
var value = {
	size: 35,
};

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

function drawCenterCross(x0, y0, offset, color) {
	doc = app.activeDocument;
	var horLine = doc.pathItems.add();
	var vertLine = doc.pathItems.add();

	horLine.strokeColor = returnColor(color[0], color[1], color[2]);
	vertLine.strokeColor = returnColor(color[0], color[1], color[2]);
	horLine.filled = false;
	vertLine.filled = false;
	horLine.setEntirePath(Array(Array(x0 - offset, y0), Array(x0 + offset, y0)));
	vertLine.setEntirePath(Array(Array(x0, y0 - offset), Array(x0, y0 + offset)));
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

function drawRectGrid(start) {
		if (start) {
			var doc = app.activeDocument;

			artboardRect = doc.artboards[0].artboardRect;
			center = {
				x: (artboardRect[2] + artboardRect[0]) / 2,
				y: (artboardRect[3] + artboardRect[1]) / 2,
			};
			model.lines = {
				horizontal: [[artboardRect[0], center.y], [artboardRect[2], center.y]],
				vertical: [[center.x, artboardRect[1]], [center.x, artboardRect[3]]],
				center: true,
			};
		}

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

	if (!start) {
		for (var i = 0; i < model.amount / 2; i++) {
			x = offset + offset * i;
			y = offset + offset * i;

			duplicateEl(horLine, 0, y);
			duplicateEl(horLine, 0, -y);
			duplicateEl(vertLine, x, 0);
			duplicateEl(vertLine, -x, 0);
		}
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

function generateCircles(values) {
	var params = values.split(',');
	var doc = app.activeDocument;
	var instance;
	var sectorGroup = activeDocument.groupItems.add();
	var rows = parseInt(params[1], 10);
	var seats = parseInt(params[2], 10);
	var x0;
	var y0;

	sectorGroup.name = params[0];

	artboardRect = doc.artboards[0].artboardRect;
	center = {
		x: (artboardRect[2] + artboardRect[0]) / 2,
		y: (artboardRect[3] + artboardRect[1]) / 2,
	};

	instance = doc.pathItems.ellipse(
		center.y + seatOffset.radius - seatOffset.y * (rows - 1) / 2,
		center.x - seatOffset.radius - seatOffset.x * (seats - 1) / 2,
		seatOffset.radius * 2,
		seatOffset.radius * 2,
	);

	y0 = center.y - seatOffset.y * (rows - 1) / 2;
	x0 = center.x;

	instance.fillColor = returnColor(82, 82, 82);
	instance.stroked = false;

	for (var i = 0; i < rows; i++) {
		var y = seatOffset.y * i;
		var circleGroup = activeDocument.groupItems.add();

		for (var k = 0; k < seats; k++) {
			var x = seatOffset.x * k;
			var circleCopy = instance.duplicate(instance, ElementPlacement.PLACEAFTER);

			circleCopy.translate(x, y);
			circleCopy.moveToEnd(circleGroup);
		}

		circleGroup.moveToEnd(sectorGroup);
		sectorGroup.selected = true;
	}
	// drawCenterCross(x0, y0, 40, [0, 0, 255]);
	// drawCenterCross(0, 0, 40, [0, 120, 255]);

	instance.remove();

	return x0 + '|' + y0;
}

function calcBasePolyhedronRadius(seatsCount) {
	var Ro1 = seatOffset.x * seatsCount / pi / 2;  // радиус, соответствующий полной окружности
	var Ro2 = seatOffset.x / Math.sin(pi / seatsCount) / 2;  // радиус, соответствующий Nx угольнику, периметр совпадает с окружностью

	return Ro2 * Math.pow(Ro2, 3) / Math.pow(Ro1, 3); // настоящий радиус, найденный
}

function getSelectedGroupData(result) {
	var doc = app.activeDocument;
	var groups;
	if (doc.selection[0].groupItems.length) {
		groups = doc.selection[0];
		path = doc.selection[1]
	} else if (doc.selection[1].groupItems.length) {
		groups = doc.selection[1];
		path = doc.selection[0]
	}

	return groups.name;
}

function curveSeats(values) {
	var params = values.split(',');
	var doc = app.activeDocument;
	var groups;

	var x0 = parseFloat(params[2]);
	var y0 = parseFloat(params[3]);
	var path;
	var dR; // реальное значение радуса 1/dr
	var dr = parseFloat(params[1]) || 0.001; // [...1, 0)
	var R; // радиус изгиба для текущего ряда
	var Ro;
	var newAlpha = parseFloat(params[0]) * 2 * pi / 360;
	var di;
	var basePolyhedronRadius;
	/*if (dr !== 0) {
		dR = 1 / dr;
	}*/

	if (doc.selection[0].groupItems.length) {
		groups = doc.selection[0];
		path = doc.selection[1]
	} else if (doc.selection[1].groupItems.length) {
		groups = doc.selection[1];
		path = doc.selection[0]
	}

	basePolyhedronRadius = calcBasePolyhedronRadius(groups.groupItems[0].pathItems.length); //(Ro3)

	groupRotationAngle = newAlpha;
	dR = 1 / dr;
	Ro = basePolyhedronRadius * dR;

	// drawCenterCross(x0, y0, 40, [255, 0, 0]);

	var x = 0;
	var y = 0;

	var rowsLength = groups.groupItems.length;
	for (var j = 0; j < rowsLength; j++) {

		var rowGroup = groups.groupItems[j];
		var seatsLength = rowGroup.pathItems.length;
		var x1 = 0;

		for (var i = 0; i < seatsLength; i++) {
			if (dr === 0) {
				di = i - (seatsLength - 1) / 2;
				x = seatOffset.x * di + x0;
				y = seatOffset.y * j + y0;
				x1 = x;
				x = (x - x0) * Math.cos(groupRotationAngle) - (y - y0) * Math.sin(groupRotationAngle) + x0 - seatOffset.radius;
				y = (x1 - x0) * Math.sin(groupRotationAngle) + (y - y0) * Math.cos(groupRotationAngle) + y0 + seatOffset.radius;

			} else {
				var beta = 0;
				var gamma = 0;
				R = seatOffset.y * j + Ro;
				beta = Math.asin(seatOffset.x / R);
				gamma = beta * (i - seatsLength / 2) + beta / 2;
				x = R * Math.sin(gamma) + x0;
				y = R * Math.cos(gamma) + y0 - R + seatOffset.y * j;
				x1 = x;
				x = (x - x0) * Math.cos(groupRotationAngle) - (y - y0) * Math.sin(groupRotationAngle) + x0 - seatOffset.radius;
				y = (x1 - x0) * Math.sin(groupRotationAngle) + (y - y0) * Math.cos(groupRotationAngle) + y0 + seatOffset.radius;

				rowGroup.pathItems[i].left = x;
				rowGroup.pathItems[i].top = y;
			}
		}
	}
}
