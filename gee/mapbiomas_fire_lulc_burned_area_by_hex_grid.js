/**
 * @file
 * Computes annual burned area statistics by land-use and land-cover (LULC)
 * class within 20 km² hexagonal grid cells across the Brazilian Cerrado
 * using MapBiomas Fire Collection 4.
 *
 * Outputs:
 * - Annual burned area (km²) by LULC class and grid cell
 * - CSV table exported to Google Drive
 */

// -----------------------------------------------------------------------------
// INPUT DATA
// -----------------------------------------------------------------------------

// Hexagonal grid (20 km²)
var grid = ee.FeatureCollection(
  'projects/ee-veraarruda/assets/doutorado/hexagonos_cerrado_20km'
);

// MapBiomas Fire Collection 4 burned area by LULC class
var mapbiomas_fire = ee.Image(
  'projects/mapbiomas-public/assets/brazil/fire/collection4_1/' +
  'mapbiomas_fire_collection41_annual_burned_coverage_v1'
);

// LULC legends
var legends = require(
  'users/geomapeamentoipam/MapBiomas__Fogo:00_Tools/Legends.js'
);

var level_0 = ee.Dictionary(legends.get('lulc_mbc10_nivel_0_eng'));
var level_1 = ee.Dictionary(legends.get('lulc_mbc10_nivel_1_eng'));
var level_1_1 = ee.Dictionary(legends.get('lulc_mbc10_nivel_1_1_eng'));

// -----------------------------------------------------------------------------
// PARAMETERS
// -----------------------------------------------------------------------------

var years = [
  1985, 1986, 1987, 1988, 1989, 1990, 1991, 1992,
  1993, 1994, 1995, 1996, 1997, 1998, 1999, 2000,
  2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008,
  2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016,
  2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024
];

// Spatial resolution (meters)
var scale = 30;

// Pixel area converted to km²
var pixel_area = ee.Image.pixelArea().divide(1e6);

// Export parameters
var output_folder = 'cerrado-estatisticas';

var output_name =
  'annual_mapbiomas_fire_lulc_area_hex_grid';

// -----------------------------------------------------------------------------
// AUXILIARY FUNCTIONS
// -----------------------------------------------------------------------------

/**
 * Computes burned area statistics by LULC class for one grid cell.
 */
function calculate_area(image, feature, year) {

  var reducer = ee.Reducer.sum().group({
    groupField: 1,
    groupName: 'class_id'
  });

  var statistics = pixel_area
    .addBands(image)
    .reduceRegion({
      reducer: reducer,
      geometry: feature.geometry(),
      scale: scale,
      maxPixels: 1e12
    });

  var groups = ee.List(statistics.get('groups'));

  var features = groups.map(function(item) {

    item = ee.Dictionary(item);

    var class_id = ee.Number(
      item.get('class_id')
    ).int();

    return ee.Feature(null, {
      'grid_id': feature.get('id_int'),
      'year': year,
      'class_id': class_id,
      'area_km2': item.get('sum'),
      'level_0': level_0.get(class_id),
      'level_1': level_1.get(class_id),
      'level_1_1': level_1_1.get(class_id),
      'source': 'MapBiomas Fire Collection 4',
      'biome': 'Cerrado'
    });

  });

  return ee.FeatureCollection(features);
}

// -----------------------------------------------------------------------------
// PROCESSING
// -----------------------------------------------------------------------------

var output = ee.FeatureCollection(
  years.map(function(year) {

    var band_name =
      ee.String('burned_coverage_')
        .cat(ee.Number(year).format());

    var image = mapbiomas_fire.select([
      band_name
    ]);

    var annual_statistics = grid.map(function(cell) {

      return calculate_area(
        image,
        cell,
        year
      );

    }).flatten();

    return annual_statistics;

  })
).flatten();

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
