/**

* @file
* Computes annual burned area statistics from
* MapBiomas Fire Collection 4 within 20 km²
* hexagonal grid cells across the Brazilian Cerrado.
*
* Outputs:
* * Annual burned area (km²) by grid cell
* * CSV table exported to Google Drive
    */

// -----------------------------------------------------------------------------
// INPUT DATA
// -----------------------------------------------------------------------------

// MapBiomas Fire Collection 4
var mapbiomas_fire = ee.Image(
'projects/mapbiomas-public/assets/brazil/fire/collection4_1/' +
'mapbiomas_fire_collection41_annual_burned_v1'
);

// Hexagonal grid (20 km²)
var grid = ee.FeatureCollection(
'projects/ee-veraarruda/assets/doutorado/hexagonos_cerrado_20km'
).map(function(feature) {

return feature.set(
'grid_id',
feature.get('id_int')
);

});

// -----------------------------------------------------------------------------
// PARAMETERS
// -----------------------------------------------------------------------------

var years = [];

for (var year = 1985; year <= 2024; year++) {

years.push(year);

}

// Spatial resolution (meters)
var scale = 30;

// Pixel area converted to km²
var pixel_area = ee.Image.pixelArea().divide(1e6);

// Export parameters
var output_folder = 'cerrado-estatisticas';

var output_name =
'annual_mapbiomas_fire_area_hex_grid';

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
  'burned_area_' + year;

var image = mapbiomas_fire
  .select(band_name)
  .eq(1);

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
  'mapbiomas_fire_area_km2_' + year,
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
