// ============================================================
// Watershed delineation from SRTM DEM
// (Google Earth Engine Code Editor)
// ============================================================

// 1. Load DEM
var dem = ee.Image('USGS/SRTMGL1_003').select('elevation');
Map.addLayer(dem, {min: 0, max: 3000, palette: ['white', 'brown', 'black']}, 'DEM');

// 2. Fill sinks, flow direction, flow accumulation
var filled = ee.Algorithms.Terrain.fill(dem);
var flowDir = ee.Algorithms.Hydrology.flowDirection(filled);
var flowAcc = ee.Algorithms.Hydrology.flowAccumulation(flowDir);

// 3. Delineate watershed from pour point
function delineateWatershed(point, flowDir) {
  var watershed = ee.Algorithms.Hydrology.watershed(flowDir, point);
  return watershed;
}

// 4. Click handler
Map.onClick(function(coords) {
  Map.layers().reset();

  var pt = ee.Geometry.Point([coords.lon, coords.lat]);
  Map.addLayer(pt, {color: 'yellow'}, 'Pour Point');

  var ws = delineateWatershed(pt, flowDir);
  Map.addLayer(ws, {palette: ['cyan']}, 'Watershed');

  Map.addLayer(dem, {min: 0, max: 3000, palette: ['white', 'brown', 'black']}, 'DEM');
});

// 5. Initial view
Map.setCenter(138.6, -34.9, 11);
