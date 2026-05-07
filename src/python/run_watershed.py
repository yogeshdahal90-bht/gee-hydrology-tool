import ee
ee.Initialize()

# Load DEM
dem = ee.Image('USGS/SRTMGL1_003').select('elevation')

# Fill sinks
filled = ee.Algorithms.Terrain.fill(dem)

# Flow direction
flow_dir = ee.Algorithms.Hydrology.flowDirection(filled)

# Pour point (example coordinates)
pour_point = ee.Geometry.Point([138.6, -34.9])

# Watershed
watershed = ee.Algorithms.Hydrology.watershed(flow_dir, pour_point)

# Export
task = ee.batch.Export.image.toDrive(
    image=watershed,
    description='watershed_srtm',
    scale=30,
    region=watershed.geometry(),
    fileFormat='GeoTIFF'
)

task.start()
print("Export started. Check Google Drive.")
