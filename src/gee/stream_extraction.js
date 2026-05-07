// ============================================================
// Streams from SRTM + pour point → upstream network
// (for Google Earth Engine Code Editor)
// ============================================================

// 1. Load DEM (SRTM)
var dem = ee.Image('USGS/SRTMGL1_003').select('elevation');
Map.addLayer(dem, {min: 0, max: 3000, palette: ['white', 'brown', 'black']}, 'DEM');

// 2. Fill sinks, flow direction, flow accumulation
var filled = ee.Algorithms.Terrain.fill(dem);
var flowDir = ee.Algorithms.Hydrology.flowDirection(filled);
var flowAcc = ee.Algorithms.Hydrology.flowAccumulation(flowDir);

// 3. Extract streams from flow accumulation
var streamThreshold = 200; // tweak this
var streams = flowAcc.gt(streamThreshold).selfMask();
Map.addLayer(streams, {palette: ['blue']}, 'Streams');

// 4. Snap pour point to nearest stream
function snapToStream(point, streamMask, radius) {
  var area = point.buffer(radius);
  var nearby = streamMask.updateMask(streamMask).clip(area);

  var dist = nearby.fastDistanceTransform(30).sqrt();

  var minDict = dist.reduceRegion({
    reducer: ee.Reducer.min(),
    geometry: area,
    scale: 30,
    maxPixels: 1e9
  });

  var minVal = ee.Number(minDict.get('distance'));
  var snappedPixel = dist.eq(minVal).selfMask();

  var snappedPoint = snappedPixel.reduceToVectors({
    geometry: area,
    scale: 30,
    geometryType: 'centroid',
    maxPixels: 1e9
  }).first().geometry();

  return snappedPoint;
}

// 5. Trace upstream using flow accumulation
function traceUpstream(startPoint, flowAcc) {
  var startAcc = ee.Number(
    flowAcc.sample(startPoint, 30).first().get('accumulation')
  );
  var accImg = ee.Image.constant(startAcc);
  var upstream = flowAcc.lte(accImg).selfMask();
  return upstream;
}

// 6. Click handler: click → snap → upstream streams
Map.onClick(function (coords) {
  Map.layers().reset();

  var pt = ee.Geometry.Point([coords.lon, coords.lat]);
  Map.addLayer(pt, {color: 'yellow'}, 'Raw Pour Point');

  var snapped = snapToStream(pt, streams, 200);
  Map.addLayer(snapped, {color: 'red'}, 'Snapped Pour Point');

  var upstream = traceUpstream(snapped, flowAcc);
  Map.addLayer(upstream, {palette: ['cyan']}, 'Upstream Network');

  Map.addLayer(streams, {palette: ['blue']}, 'Streams');
  Map.addLayer(dem, {min: 0, max: 3000, palette: ['white', 'brown', 'black']}, 'DEM');

  Map.centerObject(snapped, 12);
});

// 7. Initial view (you can change this)
Map.setCenter(138.6, -34.9, 11); // Adelaide region
