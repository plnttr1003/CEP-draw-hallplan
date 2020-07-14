function duplicateCircles() {
	var sectorName = 'Сектор' + model.sectors.length;
	var sectorId = '_id' + model.sectors.length;
	var rows = selectedSector.rows;
	var seats = selectedSector.seats;
	var seats2 = selectedSector.seats2;
	var angle = parseFloat(selectedSector.angle) + 30;
	var distortion = selectedSector.distortion;
	var left = selectedSector.left;
	var top = selectedSector.top;
	var Xa = selectedSector.Xa;
	var Ya = selectedSector.Ya;
	var deltaX = selectedSector.deltaX;
	var deltaY = selectedSector.deltaY;
	var rowsOffset = selectedSector.rowsOffset;
	var seatsOffset = selectedSector.seatsOffset;

	model.sectors.push(
		{
			name: sectorName,
			id: sectorId,
			rows: rows,
			seats: seats,
			seats2: seats2,
			angle: angle,
			distortion: distortion,
			x0: Xa,
			y0: Ya,
			left: left,
			top: top,
			deltaX: deltaX,
			deltaY: deltaY,
			rowsOffset: rowsOffset,
			seatsOffset: seatsOffset,
		}
	);

	var params = [sectorName, sectorId, rows, seats, seats2, rowsOffset, seatsOffset, distortion, angle,  Xa, Ya, ''].join();

	selectedSector = {};

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
}
