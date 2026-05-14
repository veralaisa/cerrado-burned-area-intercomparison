/**

* @file
* Computes annual burned area statistics from MODIS MCD64A1
* within 20 km² hexagonal grid cells across the
* Brazilian Cerrado biome.
*
* Outputs:
* * Annual burned area (km²) by grid cell
* * CSV table exported to Google Drive
    */

// -----------------------------------------------------------------------------
// INPUT DATA
// -----------------------------------------------------------------------------

// Hexagonal grid (20 km²)
var grid = ee.FeatureCollection(
'projects/ee-veraarruda/assets/doutorado/hexagonos_cerrado_20km'
).map(function(feature) {

return feature.set(
'grid_id',
feature.get('id_int')
);

});

// MODIS MCD64A1 burned area product
var modis = ee.ImageCollection(
'MODIS/061/MCD64A1'
);

// -----------------------------------------------------------------------------
// PARAMETERS
// -----------------------------------------------------------------------------

var years = [];

for (var year = 2001; year <= 2024; year++) {

years.push(year);

}

// Spatial resolution (meters)
var scale = 30;

// Pixel area converted to km²
var pixel_area = ee.Image.pixelArea().divide(1e6);

// Export parameters
var output_folder = 'cerrado-estatisticas';

var output_name =
'annual_modis_burned_area_hex_grid';

// -----------------------------------------------------------------------------
// BUILD ANNUAL MODIS STACK
// -----------------------------------------------------------------------------

var modis_stack = ee.Image();

years.forEach(function(year) {

var start = year + '-01-01';

var end = (year + 1) + '-01-01';

var burned_area = modis
.filterDate(start, end)
.mosaic()
.select('BurnDate')
.gte(1);

burned_area = burned_area.rename(
'classification_' + year
);

modis_stack = modis_stack.addBands(
burned_area
);

});

// -----------------------------------------------------------------------------
// AUXILIARY FUNCTIONS
// -----------------------------------------------------------------------------

/**

* Computes annual burned area for a grid cell.
  */
  function compute_annual_area(feature) {

feature = ee.Feature(feature);

years.forEach(function(year) {

```
var band_name =
  'classification_' + year;

var image = modis_stack.select(
  band_name
);

var statistics = pixel_area
  .updateMask(image)
  .reduceRegion({
    reducer: ee.Reducer.sum(),
    geometry: feature.geometry(),
    scale: scale,
    maxPixels: 1e12
  });

var area_km2 = ee.Number(
  statistics.get('area')
);

feature = feature.set(
  'modis_area_km2_' + year,
  area_km2
);
```

});

return feature;
}

// -----------------------------------------------------------------------------
// PROCESSING
// -----------------------------------------------------------------------------

var output = grid.map(
compute_annual_area
);

print(
'Example output:',
output.limit(5)
);

// -----------------------------------------------------------------------------
// EXPORT
// -----------------------------------------------------------------------------

Export.table.toDrive({
collection: output,
description: output_name,
folder: output_folder,
fileNamePrefix: output_name,
fileFormat: 'CSV'
});
