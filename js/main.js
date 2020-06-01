var csInterface;

var model = {
	gridType: '',
	gridProperty: '',
	gridAmount: 0
};

var el = {
	inputGridAmount: null,
	toolButton: null,
};

function onLoaded() {
	csInterface = new CSInterface();
	csInterface.addEventListener( CSInterface.THEME_COLOR_CHANGED_EVENT, setAppTheme );
	document.onkeypress = function(e) {
		if (e.charCode == 114) { window.location.reload(); }
	};

	el.inputGridAmount = document.getElementById('gridAmount');
	el.toolButton = document.getElementById('tool-button');
	el.duplicateCircles = document.getElementById('duplicateCircles');

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

function addRadioListeners(name) {
	var radios = document.getElementsByName(name);
	for (var i = 0; i < radios.length; i++) {
		radios[i].addEventListener('change', function() {
			model[name] = this.value;

			if (model.gridType && model.gridProperty) {
				enableInputFields();
			}
		})
	}
}

function enableInputFields() {
	if (model.gridType && model.gridProperty) {
		el.inputGridAmount.removeAttribute('disabled');
	}
	if (model.gridType && model.gridProperty && model.gridAmount) {
		el.toolButton.removeAttribute('disabled');
	}
}

function addInputListeners() {
	el.inputGridAmount.addEventListener('keyup', function() {
		model.gridAmount = this.value;
		enableInputFields();
	});
}
function addButtonListener() {
	el.toolButton.addEventListener('click', function() {
		if (model.gridAmount && model.gridProperty && model.gridType) {
			// type, property, amount
			var param = [model.gridType, model.gridProperty, model.gridAmount].join(',')
			csInterface.evalScript('startScript("'+ param + '")');
		}
	});
	el.duplicateCircles.addEventListener('click', function() {
		csInterface.evalScript('duplicateCircles()');
	})
}


function addListeners() {
	addRadioListeners('gridType');
	addRadioListeners('gridProperty');
	addInputListeners();
	addButtonListener();
}
