var csInterface;

var model = {
	gridType: '',
	gridProperty: '',
	gridAmount: 0,
	sectors: [],
};

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


function addButtonListener() {
	el.generateCircles.addEventListener('click', function() {
		var sectorName = el.sectorName.value;
		var sectorRows = el.sectorRows.value;
		var sectorSeats = el.sectorSeats.value;
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
						baseSector = sector;
					}
				});
				baseSector.x0 = parseFloat(result.split('|')[0]);
				baseSector.y0 = parseFloat(result.split('|')[1]);
			});
			getData();
		}
	});

	el.curveCircleAngle.addEventListener('keypress', function(event) {
		if (event.key === 'Enter') {
			getData(event, 'angle');
		}
	});

	el.curveCircleAngle.addEventListener('click', function(event) {
		getData(event, 'angle');
	});

	el.curveDistortion.addEventListener('change', function(event) {
		getData(event, 'distortion');
	});
	el.curveDistortionValue.addEventListener('click', function(event) {
		getData(event, 'distortion');
	});
	el.curveDistortionValue.addEventListener('keypress', function(event) {
		if (event.key === 'Enter') {
			getData(event, 'distortion');
		}
	});
}

function addListeners() {
	addButtonListener();
}
