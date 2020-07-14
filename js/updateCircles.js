function updateCircles() {
	var sectorName = selectedSector.name;
	var sectorId = selectedSector.id;
	var sectorRows = parseInt(el.sectorRows.value, 10) || selectedSector.rows;
	var seats = parseInt(el.sectorSeats.value, 10) || selectedSector.seats;
	var seats2 = parseInt(el.sectorSeats2.value, 10) || selectedSector.seats2;


	var angle = selectedSector.angle;
	var distortion = selectedSector.distortion;
	var left = selectedSector.left;
	var top = selectedSector.top;
	var Xa = selectedSector.Xa;
	var Ya = selectedSector.Ya;
	var deltaX = selectedSector.deltaX;
	var deltaY = selectedSector.deltaY;
	var rowsOffset = selectedSector.rowsOffset;
	var seatsOffset = selectedSector.seatsOffset;

	selectedSector.rows = sectorRows;
	selectedSector.seats = seats;
	selectedSector.seats2 = seats2;

	var params = [sectorName, sectorId, sectorRows, seats, seats2, rowsOffset, seatsOffset, distortion, angle,  Xa, Ya, 'UPDATE'].join();

	csInterface.evalScript('generateCircles("' + params + '")', function (result) {
		var results = result.split(',');

		model.sectors.forEach(function(sector) {
			if (sector.id === sectorId) {
				selectedSector = sector;
			}
			selectedSector.x0 = parseFloat(results[0]);
			selectedSector.y0 = parseFloat(results[1]);
			selectedSector.left = parseFloat(results[2]);
			selectedSector.top = parseFloat(results[3]);
			selectedSector.Xa = parseFloat(results[4]);
			selectedSector.Ya = parseFloat(results[5]);
		});
	});

	console.log('UPDATE::', selectedSector);
}
