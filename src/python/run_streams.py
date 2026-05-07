import ee
ee.Initialize()

# Load DEM
dem = ee.Image('USGS/SRTMGL1_003').select('elevation')

# Fill sinks
filled = ee.Algorithms.Terrain.fill(dem)

# Flow direction + accumulation
flow_dir = ee.Algorithms.Hydrology.flowDirection(filled)
flow_acc = ee.Algorithms.Hydrology.flowAccumulation(flow_dir)

# Extract streams
streams = flow_acc.gt(200).selfMask()

# Export to Google Drive
task = ee.batch.Export.image.toDrive(
    image=streams,
    description='streams_srtm',
    scale=30,
    region=streams.geometry(),
    fileFormat='GeoTIFF'
)

task.start()
print("Export started. Check your Google Drive.")
