
/**
 * @file
 * Computes annual burned area statistics from GABAM
 * within 20 km² hexagonal grid cells across the
 * Brazilian Cerrado biome.
 *
 * Outputs:
 * - Annual burned area (km²) by grid cell
 * - CSV table exported to Google Drive
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

// Original GABAM collection
var gabam_original = ee.ImageCollection(
  'projects/sat-io/open-datasets/GABAM'
);

// Extended GABAM collection (2022–2024)
var gabam_extension = ee.ImageCollection(
  'projects/ee-ipam/assets/MAPBIOMAS/FIRE/GABAM/gabam_2022_2024'
);

// -----------------------------------------------------------------------------
// PARAMETERS
// -----------------------------------------------------------------------------

var years = [
  1985, 1987, 1989, 1992, 1995, 1996, 1998,
  2000, 2001, 2002, 2003, 2004, 2005, 2006,
  2007, 2008, 2009, 2010, 2011, 2012, 2013,
  2014, 2015, 2016, 2017, 2018, 2019, 2020,
  2021, 2022, 2023, 2024
];

// Spatial resolution (meters)
var scale = 30;

// Pixel area converted to km²
var pixel_area = ee.Image.pixelArea().divide(1e6);

// Export parameters
var output_folder = 'cerrado-estatisticas';

var output_name =
  'annual_gabam_burned_area_hex_grid';

// -----------------------------------------------------------------------------
// BUILD ANNUAL GABAM STACK
// -----------------------------------------------------------------------------

var gabam = ee.Image();

years.forEach(function(year) {

  var burned_area;

  // Original GABAM collection (1985–2021)
  if (year <= 2021) {

    var start = year + '-01-01';

    var end = (year + 1) + '-01-01';

    burned_area = gabam_original
      .filterDate(start, end)
      .mosaic()
      .gte(1);

  } else {

    // Extended GABAM collection (2022–2024)
    burned_area = gabam_extension
      .filter(ee.Filter.eq('year', year))
      .first()
      .gte(1);

  }

  burned_area = ee.Image(burned_area)
    .rename('classification_' + year);

  gabam = gabam.addBands(burned_area);

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

    var band_name = 'classification_' + year;

    var image = gabam.select(band_name);

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
      'gabam_area_km2_' + year,
      area_km2
    );

  });

  return feature;
}

// -----------------------------------------------------------------------------
// PROCESSING
// -----------------------------------------------------------------------------

var output = grid.map(compute_annual_area);

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
```
