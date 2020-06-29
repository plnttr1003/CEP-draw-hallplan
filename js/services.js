function throttle(func, ms) {
	var isThrottled = false;
	var savedArgs;
	var savedThis;

	function wrapper() {
		if (isThrottled) {
			savedArgs = arguments;
			savedThis = this;
			return;
		}

		func.apply(this, arguments);
		isThrottled = true;
		setTimeout(function() {
			isThrottled = false;
			if (savedArgs) {
				wrapper.apply(savedThis, savedArgs);
				savedArgs = savedThis = null;
			}
		}, ms);
	}
	return wrapper;
}

function getData(params) {
	var event = params && params.event;
	var paramName = params && params.paramName;
	var id = '';

	csInterface.evalScript('getSelectedGroupData()', function(result) {
		var resultArray = result.split(',');
		var sectorLeft = resultArray[1];
		var sectorTop = resultArray[2];

		selectedSector.deltaX = sectorLeft - selectedSector.left;
		selectedSector.deltaY = sectorTop - selectedSector.top;

		id = resultArray[0].split('|')[1];
		model.sectors.forEach(function(sector) {
			if (sector.id === id) {
				selectedSector = sector;
			}
		});
		if (Object.keys(selectedSector).length > 0) {
			if (paramName) {
				selectedSector[paramName] = event.target.value;
			}
			el.sectorName.value = selectedSector.name;
			el.sectorSeats.value = selectedSector.seats;
			el.sectorRows.value = selectedSector.rows;

			el.curveCircleAngleRange = selectedSector.angle;
			el.curveCircleAngle.value = selectedSector.angle;
			el.curveDistortion.value = selectedSector.distortion;
			el.curveDistortionValue.value = selectedSector.distortion;

			el.curveDistortion.value = selectedSector.distortion;
			el.curveDistortionValue.value = selectedSector.distortion;

			el.sectorOffsetRows.value = selectedSector.rowsOffset;
			el.sectorOffsetSeats.value = selectedSector.seatsOffset;

			if (paramName) {
				var sectorX = selectedSector.x0 + selectedSector.deltaX;
				var sectorY = selectedSector.y0 + selectedSector.deltaY;

				selectedSector.x0 = sectorX;
				selectedSector.y0 = sectorY;

				csInterface.evalScript('curveSeats("'
					+ selectedSector.angle + ','
					+ selectedSector.distortion + ','
					+ selectedSector.x0 + ','
					+ selectedSector.y0 + ','
					+ selectedSector.rowsOffset + ', '
					+ selectedSector.seatsOffset
					+ '")', function(result) {
					var resultArray = result.split(',');
					var sectorLeft = resultArray[1];
					var sectorTop = resultArray[2];

					selectedSector.left = sectorLeft;
					selectedSector.top = sectorTop;
				});
			}
			toggleGenerateCirclesButton(true);
		} else {
			toggleGenerateCirclesButton(false);
			selectedSector = {};
		}
	});
}

function clearFields() {
	selectedSector = {};
	el.sectorName.value = '';
	el.sectorSeats.value = '';
	el.sectorRows.value = '';

	el.curveCircleAngleRange.value = 0;
	el.curveCircleAngle.value = '';
	el.curveDistortion.value = 0;
	el.curveDistortionValue.value = '';
}

function toggleGenerateCirclesButton(visibility) {
	if (visibility === true) {
		el.generateCircles.style.display = 'none';
		el.updateCircles.style.display = 'block';
	} else if (visibility === false) {
		el.generateCircles.style.display = 'block';
		el.updateCircles.style.display = 'none';
	}
}
