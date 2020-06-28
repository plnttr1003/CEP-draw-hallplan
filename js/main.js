var csInterface;

var model = {
	gridType: '',
	gridProperty: '',
	gridAmount: 0,
	sectors: [],
	//////////////////////////
	selectedSector: {},
};

var changed = false;

var el = {
};

function onLoaded() {
	csInterface = new CSInterface();
	if (csInterface.THEME_COLOR_CHANGED_EVENT) {
		csInterface.addEventListener(CSInterface.THEME_COLOR_CHANGED_EVENT, setAppTheme);
	}

	el.sectorName = document.getElementById('sectorName');
	el.sectorRows = document.getElementById('sectorRows');
	el.sectorSeats = document.getElementById('sectorSeats');
	el.generateCircles = document.getElementById('generateCircles');
	el.updateCircles = document.getElementById('updateCircles');

	el.curveCircleAngleRange = document.getElementById('curveCircleAngleRange');
	el.curveCircleAngle = document.getElementById('curveCircleAngle');
	el.curveDistortion = document.getElementById('curveDistortion');
	el.curveDistortionValue = document.getElementById('curveDistortionValue');

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
					angle: 0,
					distortion: 0,
					x0: 0,
					y0: 0,
				}
			);

			csInterface.evalScript('generateCircles("' + sectorName + '|' + sectorId + ', ' + sectorRows + ', ' + sectorSeats + '")', function(result) {
				model.sectors.forEach(function(sector) {
					if (sector.id === sectorId) {
						selectedSector = sector;
					}
				});
				selectedSector.x0 = parseFloat(result.split('|')[0]);
				selectedSector.y0 = parseFloat(result.split('|')[1]);
			});
			getData();
		}
	});

	el.updateCircles.addEventListener('click', function() {
		document.getElementById('info').innerText = '>>';
		if (Object.keys(selectedSector).length > 0) {
			document.getElementById('info').innerText = '+++';
			var sectorRows = el.sectorRows.value;
			var sectorSeats = el.sectorSeats.value;

			selectedSector.rows = sectorRows;
			selectedSector.seats = sectorSeats;

			csInterface.evalScript('curveSeats("'
				+ selectedSector.angle + ','
				+ selectedSector.distortion + ','
				+ selectedSector.x0 + ','
				+ selectedSector.y0 + ','
				+ selectedSector.rows + ','
				+ selectedSector.seats +
			'")');
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
}

function addListeners() {
	addJSXListener();
	addButtonListener();
}
