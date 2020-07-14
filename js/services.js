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
	var sectorId = '';
	var sectorName = '';

	csInterface.evalScript('getSelectedGroupData()', function(result) {
		var resultArray = result.split(',');
		var sectorLeft = resultArray[1];
		var sectorTop = resultArray[2];

		selectedSector.deltaX = sectorLeft - selectedSector.left;
		selectedSector.deltaY = sectorTop - selectedSector.top;

		sectorId = resultArray[0].split('|')[1];
		sectorName = resultArray[0].split('|')[0];
		model.sectors.forEach(function(sector) {
			if (sector.id === sectorId) {
				selectedSector = sector;
			}
		});
		if (Object.keys(selectedSector).length > 0) {
			if (paramName) {
				selectedSector[paramName] = event.target.value;
			}
			el.sectorName.value = selectedSector.name;
			el.sectorSeats.value = selectedSector.seats;
			el.sectorSeats2.value = selectedSector.seats2;
			el.sectorRows.value = selectedSector.rows;

			el.curveCircleAngleRange.value = selectedSector.angle;
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

				console.log('UPDATE SEL SECTOR', selectedSector);

				params = [sectorName, sectorId, selectedSector.rows, selectedSector.seats, selectedSector.seats2, selectedSector.rowsOffset, selectedSector.seatsOffset, selectedSector.distortion, selectedSector.angle, '', '', 'UPDATE'].join(',');

				csInterface.evalScript('generateCircles("' + params + '")', function(result) {
					var results = result.split(',');

					console.log('RESULTS::', results);

					selectedSector.x0 = parseFloat(results[0]);
					selectedSector.y0 = parseFloat(results[1]);
					selectedSector.left = parseFloat(results[2]);
					selectedSector.top = parseFloat(results[3]);
					selectedSector.Xa = parseFloat(results[4]);
					selectedSector.Ya = parseFloat(results[5]);
				});
			}
			console.log('selected sector on get data:;', selectedSector)
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
	el.sectorSeats2.value = '';
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
		el.duplicateCircles.style.display = 'block';
	} else if (visibility === false) {
		el.generateCircles.style.display = 'block';
		el.updateCircles.style.display = 'none';
		el.duplicateCircles.style.display = 'none';
	}
}
