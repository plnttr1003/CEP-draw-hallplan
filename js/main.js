var csInterface;

var model = {
	sectors: [],
	//////////////////////////
	selectedSector: {},
};

var selectedSector = {};

var changed = false;

var el = {
};

function onLoaded() {
	csInterface = new CSInterface();
	if (csInterface.THEME_COLOR_CHANGED_EVENT) {
		csInterface.addEventListener(CSInterface.THEME_COLOR_CHANGED_EVENT, setAppTheme);
	}

	el.reload = document.getElementById('reload');
	el.sectorName = document.getElementById('sectorName');
	el.sectorRows = document.getElementById('sectorRows');
	el.sectorSeats = document.getElementById('sectorSeats');
	el.generateCircles = document.getElementById('generateCircles');
	el.updateCircles = document.getElementById('updateCircles');

	el.curveCircleAngleRange = document.getElementById('curveCircleAngleRange');
	el.curveCircleAngle = document.getElementById('curveCircleAngle');
	el.curveDistortion = document.getElementById('curveDistortion');
	el.curveDistortionValue = document.getElementById('curveDistortionValue');

	el.sectorOffsetSeats = document.getElementById('sectorOffsetSeats');
	el.sectorOffsetRows = document.getElementById('sectorOffsetRows');

	addListeners();
}

function setAppTheme(e) {
	var hostEnv = window.__adobe_cep__.getHostEnvironment();
	var skinInfo = JSON.parse(hostEnv).appSkinInfo;
	var color = skinInfo.panelBackgroundColor.color;
	var avg = (color.red+color.blue+color.green) / 3;
	var type = (avg > 128) ? "light" : "dark";
	document.getElementById("topcoat-style").href = "css/topcoat-desktop-" + type + ".css";
	document.getElementById("main-style").href = "css/main-" + type + ".css";
	var rgb = "rgb(" +
		Math.round(color.red) 	+ "," +
		Math.round(color.green)	+ "," +
		Math.round(color.blue)	+ ")";
	document.body.style.backgroundColor = rgb;
}

function addJSXListener() {
	var jsxInterval = setInterval(function() {
		csInterface.evalScript('listenEmptySelection()', function(result) {
			var selectionLength = parseInt(result, 10);

			if (selectionLength === 0) {
				if (!changed) {
					clearFields();
				}
				toggleGenerateCirclesButton(false);
				changed = true;
			} else if (selectionLength > 0) {
				if (changed) {
					getData();
					changed = false;
				}
			}
		});
	}, 100);
}

function addButtonListener() {
	el.generateCircles.addEventListener('click', function() {
		var sectorName = el.sectorName.value || 'Сектор';
		var sectorRows = el.sectorRows.value || 12;
		var sectorSeats = el.sectorSeats.value || 24;
		var sectorId = '_id' + model.sectors.length;
		var rowsOffset = el.sectorOffsetRows.value || 35;
		var seatsOffset = el.sectorOffsetSeats.value || 25;
		var distortion = el.curveDistortionValue.value || 0.5;
		var angle = el.curveCircleAngle.value || 0;
		var params = [];

		if (sectorName && sectorRows && sectorSeats) {
			el.sectorName.value = '';
			el.sectorRows.value = '';
			el.sectorSeats.value = '';

			model.sectors.push(
				{
					name: sectorName,
					id: sectorId,
					rows: sectorRows,
					seats: sectorSeats,
					angle: angle,
					distortion: distortion,
					x0: 0,
					y0: 0,
					left: 0,
					top: 0,
					deltaX: 0,
					deltaY: 0,
					rowsOffset: rowsOffset,
					seatsOffset: seatsOffset,
				}
			);

			params = [sectorName, sectorId, sectorRows, sectorSeats, rowsOffset, seatsOffset, distortion, angle].join(',');

			csInterface.evalScript('generateCircles("' + params + '")', function (result) {
				var results = result.split(',');

				model.sectors.forEach(function(sector) {
					if (sector.id === sectorId) {
						selectedSector = sector;
						document.getElementById('info2').innerHTML = JSON.stringify(sector);
					}
					selectedSector.x0 = parseFloat(results[0]);
					selectedSector.y0 = parseFloat(results[1]);
					selectedSector.left = parseFloat(results[2]);
					selectedSector.top = parseFloat(results[3]);
				});
			});
		}
	});

	el.curveCircleAngleRange.addEventListener('input', function(event) {
		var throttledGetData = throttle(getData, 300);

		throttledGetData({ event: event, paramName: 'angle' });
	});
	el.curveCircleAngle.addEventListener('keypress', function(event) {
		if (event.key === 'Enter') {
			getData({ event: event, paramName: 'angle' });
		}
	});
	el.curveCircleAngle.addEventListener('click', function(event) {
		getData({ event: event, paramName: 'angle' });
	});
	el.curveDistortion.addEventListener('change', function(event) {
		getData({ event: event, paramName: 'distortion' });
	});
	el.curveDistortion.addEventListener('input', function(event) {
		var throttledGetData = throttle(getData, 300);

		throttledGetData({ event: event, paramName: 'distortion' });
	});
	el.curveDistortionValue.addEventListener('click', function(event) {
		getData({ event: event, paramName: 'distortion' });
	});
	el.curveDistortionValue.addEventListener('keypress', function(event) {
		if (event.key === 'Enter') {
			getData({ event: event, paramName: 'distortion' });
		}
	});

	el.sectorOffsetRows.addEventListener('keypress', function(event) {
		if (event.key === 'Enter') {
			getData({ event: event, paramName: 'rowsOffset' });
		}
	});
	el.sectorOffsetRows.addEventListener('click', function(event) {
		getData({ event: event, paramName: 'rowsOffset' });
	});

	el.sectorOffsetSeats.addEventListener('keypress', function(event) {
		if (event.key === 'Enter') {
			getData({ event: event, paramName: 'seatsOffset' });
		}
	});
	el.sectorOffsetSeats.addEventListener('click', function(event) {
		getData({ event: event, paramName: 'seatsOffset' });
	});
}

function addListeners() {
	addJSXListener();
	addButtonListener();

	el.reload.addEventListener('click', function() {
		location.reload();
	})
}
