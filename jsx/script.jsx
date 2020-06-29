var pi = Math.PI;
var artboardRect = [];
var center;
var seatOffset = {
	x: 25,
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

function returnColor(r, g, b){
	var color = new RGBColor();
	color.red   = r;
	color.green = g;
	color.blue  = b;
	return color;
}

function listenEmptySelection() {
	var doc = app.activeDocument;

	return doc.selection.length;
}

function generateCircles(values) {
	var params = values.split(',');
	var doc = app.activeDocument;
	var instance;
	var sectorGroup = activeDocument.groupItems.add();
	var rows = parseInt(params[1], 10);
	var seats = parseInt(params[2], 10);
	var x0;
	var y0;
	var seatOffsetX = parseFloat(params[3]);
	var seatOffsetY = parseFloat(params[4]);

	sectorGroup.name = params[0];

	artboardRect = doc.artboards[0].artboardRect;
	center = {
		x: (artboardRect[2] + artboardRect[0]) / 2,
		y: (artboardRect[3] + artboardRect[1]) / 2,
	};

	instance = doc.pathItems.ellipse(
		center.y + seatOffset.radius - seatOffsetY * (rows - 1) / 2,
		center.x - seatOffset.radius - seatOffsetX * (seats - 1) / 2,
		seatOffset.radius * 2,
		seatOffset.radius * 2,
	);

	y0 = center.y - seatOffsetY * (rows - 1) / 2;
	x0 = center.x;

	instance.fillColor = returnColor(82, 82, 82);
	instance.stroked = false;

	for (var i = 0; i < rows; i++) {
		var y = seatOffsetY * i;
		var circleGroup = activeDocument.groupItems.add();

		for (var k = 0; k < seats; k++) {
			var x = seatOffsetX * k;
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

	return x0 + ',' + y0 + ',' + circleGroup.left + ',' + circleGroup.top;
}

function calcBasePolyhedronRadius(seatsCount, seatOffsetX) {
	var Ro1 = seatOffsetX * seatsCount / pi / 2;  // радиус, соответствующий полной окружности
	var Ro2 = seatOffsetX / Math.sin(pi / seatsCount) / 2;  // радиус, соответствующий Nx угольнику, периметр совпадает с окружностью

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

	return groups.name + ',' + groups.left + ',' + groups.top;
}

function curveSeats(values) {
	var params = values.split(',');
	var doc = app.activeDocument;
	var groups;

	var x0 = parseFloat(params[2]);
	var y0 = parseFloat(params[3]);
	var seatOffsetX = parseFloat(params[4]);
	var seatOffsetY = parseFloat(params[5]);

	var path;
	var dR; // реальное значение радуса 1/dr
	var dr = parseFloat(params[1]) || 0.001; // [...1, 0)
	var R; // радиус изгиба для текущего ряда
	var Ro;
	var newAlpha = parseFloat(params[0]) * 2 * pi / 360;
	var di;
	var basePolyhedronRadius;

	/* Для апдейпта. Проверить количество элементов
	if (params.length === 6) {
		rows = parseInt(params[4], 10);
		seats = parseInt(params[5], 10);
	}*/

	if (doc.selection[0].groupItems.length) {
		groups = doc.selection[0];
		path = doc.selection[1]
	} else if (doc.selection[1].groupItems.length) {
		groups = doc.selection[1];
		path = doc.selection[0]
	}

	basePolyhedronRadius = calcBasePolyhedronRadius(groups.groupItems[0].pathItems.length, seatOffsetX); //(Ro3)

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
				x = seatOffsetX * di + x0;
				y = seatOffsetY * j + y0;
				x1 = x;
				x = (x - x0) * Math.cos(groupRotationAngle) - (y - y0) * Math.sin(groupRotationAngle) + x0 - seatOffset.radius;
				y = (x1 - x0) * Math.sin(groupRotationAngle) + (y - y0) * Math.cos(groupRotationAngle) + y0 + seatOffset.radius;

			} else {
				var beta = 0;
				var gamma = 0;
				R = seatOffsetY * j + Ro;
				beta = Math.asin(seatOffsetX / R);
				gamma = beta * (i - seatsLength / 2) + beta / 2;
				x = R * Math.sin(gamma) + x0;
				y = R * Math.cos(gamma) + y0 - R + seatOffsetY * j;
				x1 = x;
				x = (x - x0) * Math.cos(groupRotationAngle) - (y - y0) * Math.sin(groupRotationAngle) + x0 - seatOffset.radius;
				y = (x1 - x0) * Math.sin(groupRotationAngle) + (y - y0) * Math.cos(groupRotationAngle) + y0 + seatOffset.radius;

				rowGroup.pathItems[i].left = x;
				rowGroup.pathItems[i].top = y;
			}
		}
	}

	return groups.name + ',' + groups.left + ',' + groups.top;
}
