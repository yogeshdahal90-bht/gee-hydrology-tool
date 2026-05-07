# GEE Hydrology Tool

Simple Google Earth Engine hydrology script:
- Uses SRTM DEM
- Fills sinks
- Computes flow direction and flow accumulation
- Extracts streams
- Lets you click a pour point
- Snaps the pour point to the nearest stream
- Shows the upstream network connected to that pour point

## How to use (Code Editor)

1. Go to https://code.earthengine.google.com
2. Create a new script.
3. Copy everything from `src/gee/stream_extraction.js` in this repo.
4. Paste it into the Code Editor.
5. Run the script.
6. Click on a river in the map.
7. You should see:
   - DEM background
   - Blue streams
   - Yellow raw click
   - Red snapped pour point
   - Cyan upstream network
