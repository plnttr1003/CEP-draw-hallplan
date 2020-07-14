var pi = Math.PI;
var artboardRect = [];
var center;
var seatOffset = {
	x: 10,
	y: 12,
	radius: 3.5,
};
var model = {
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
	var NAME = params[0];
	var ID = params[1];
	var ROWS = parseInt(params[2], 10);  // исходное количество рядов
	var SEATS = parseInt(params[3], 10);  // исходное количество рядов
	var SEATS2 = parseInt(params[4], 10); // исходное количество мест
	var SEAT_OFFSET = parseFloat(params[5]); // расстояние между местами
	var ROW_OFFSET = parseFloat(params[6]); // расстояние между рядами
	var DISTORTION = parseFloat(params[7]); // коэфециент искривления
	var ANGLE = parseFloat(params[8]); // угол
	var initX0 = parseFloat(params[9]);
	var initY0 = parseFloat(params[10]);
	var DELETE = params[11] === 'UPDATE' ;

	var GROUP_NAME_ID = NAME + '|' + ID;

	var doc = app.activeDocument;
	var sectorGroup;

	if (DELETE) {
		doc.groupItems.getByName(GROUP_NAME_ID).remove();
	}

	sectorGroup = doc.groupItems.add();
	sectorGroup.name = GROUP_NAME_ID;

	artboardRect = doc.artboards[0].artboardRect;
	center = {
		x: (artboardRect[2] + artboardRect[0]) / 2,
		y: (artboardRect[3] + artboardRect[1]) / 2,
	};

	var Q = 0; // 1 ... 0 ... -1  выбор варианта разварачивания картинки // ориентация

	var Nx0 = SEATS2; //количество мест в первом ряду
	var NxN = SEATS; //количество мест в последнем ряду
	var Nx = Nx0; //количество мест в текущем ряду

	var My = ROWS; //количество рядов

	var Ro; // радиус кривизны изгиба первого ряда
	var RO = 0; //радиус кривизны изгиба текущего ряда

	var PrNx = false; // признак изменения количества мест в первом ряду

	var hx = SEAT_OFFSET; // расстояние между местами
	var hy = ROW_OFFSET; // расстояние между рядами

	var kR; //коэффициент увеличения радиуса размещения Nx кресел по замкнутому полному кругу
	var dr = DISTORTION; // изменяемый параметр для вычисления коэффициента kR  (dr=0 - нет кривизны; 1 - первый ряд образует полный круг)

	var X0, Y0;

	var R;
	var x, y;

	var alpha = ANGLE * 2 * pi / 360; // alpha - угол поворота картинки
	//-------------------------------------------------------
	// alert('variables');
	X0 = initX0 || center.x;
	Y0 = initY0 || center.y;

	if (!PrNx) {
		Ro = hx / 2 / Math.sin(pi / Nx0); //радиус окружности, описанной вокруг многоугольника
	}

	var Xa = X0;
	var Ya = Y0; //    (Xa,Ya) - центр дуги искривления
	if (dr !== 0) //вычисление значения Ya центра дуги искривления
	{
		kR = 1.0 / (dr); //гиперболическая зависимость для вычисления коэффициента увеличения радиуса размещения Nx кресел по замкнутому полному кругу (при dr==0 kR=бесконечности)
		RO = Ro * kR;
		Ya = Y0 - RO; //определение координаты Ya центра дуги искривления //<>//
		// stroke(0,255,0);
	}

	var Xb = Xa;
	Xa = (Xa - X0) * Math.cos(alpha) - (Ya - Y0) * Math.sin(alpha) + X0; // поворот центра дуги искривления
	Ya = (Xb - X0) * Math.sin(alpha) + (Ya - Y0) * Math.cos(alpha) + Y0;

	// drawCenterCross(Xa, Ya, 40, [0, 0, 255]);

	var deltaX = X0 - Xa;
	var deltaY = Y0 - Ya;

	var di;
	for (var j = 0; j < My; j++) { //----- j -----
		var circleGroup = activeDocument.groupItems.add();

		Nx = parseInt((Nx0 + (NxN - Nx0) * parseFloat(j) / (My - 1) + 0.5), 10);
		for (var i = 0; i < Nx; i++) {
			di = i - (Q + 1) * parseFloat(Nx - 1) / 2 - Q / 2; // Q = [ 1: <-]  ;[0: | ] ; [-1: ->]
			if (dr === 0) {
				x = hx * di + X0;
				y = hy * j + Y0;
			} else {
				R = hy * j + RO;
				var beta = Math.asin(hx / 2 / R) * 2;
				var gamma = beta * di;
				x = R * Math.sin(gamma) + X0;
				y = R * Math.cos(gamma) + Y0 - RO;
			}
			//============== поворот картинки ===============
			var x1 = x;
			x = (x - X0) * Math.cos(alpha) - (y - Y0) * Math.sin(alpha) + X0 + deltaX;
			y = (x1 - X0) * Math.sin(alpha) + (y - Y0) * Math.cos(alpha) + Y0 + deltaY;

			var seatCircle = doc.pathItems.ellipse(
				y,
				x,
				seatOffset.radius * 2,
				seatOffset.radius * 2,
			);

			seatCircle.fillColor = returnColor(82, 82, 82);
			seatCircle.stroked = false;

			seatCircle.moveToEnd(circleGroup);
		}

		circleGroup.moveToEnd(sectorGroup);
		sectorGroup.selected = true;
	}

	return X0 + ',' + Y0 + ',' + circleGroup.left + ',' + circleGroup.top + ', ' + Xa + ', ' + Ya;
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
