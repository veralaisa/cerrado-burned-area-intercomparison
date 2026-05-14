```javascript
/**
 * @file
 * Computes annual burned area agreement among MODIS MCD64A1,
 * GABAM, and MapBiomas Fire Collection 4 within 20 km²
 * hexagonal grid cells across the Brazilian Cerrado.
 *
 * Outputs:
 * - Annual burned area agreement statistics (km²)
 * - CSV table exported to Google Drive
 */

// -----------------------------------------------------------------------------
// INPUT DATA
// -----------------------------------------------------------------------------

// Hexagonal grid (20 km²)
var grid = ee.FeatureCollection(
  'projects/ee-veraarruda/assets/doutorado/hexagonos_cerrado_20km'
);

// Burned area products
var modis = ee.ImageCollection('MODIS/061/MCD64A1');

var gabam_original = ee.ImageCollection(
  'projects/sat-io/open-datasets/GABAM'
);

var gabam_extension = ee.ImageCollection(
  'projects/ee-ipam/assets/MAPBIOMAS/FIRE/GABAM/gabam_2022_2024'
);

var gabam = gabam_original.merge(gabam_extension);

var mapbiomas_fire = ee.Image(
  'projects/mapbiomas-public/assets/brazil/fire/collection4_1/' +
  'mapbiomas_fire_collection41_annual_burned_v1'
);

// -----------------------------------------------------------------------------
// PARAMETERS
// -----------------------------------------------------------------------------

var years = [
  1985, 1987, 1989, 1992, 1995, 1996, 1998, 2000,
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
  'annual_burned_area_agreement_hex_grid';

// Agreement classes
var agreement_classes = ee.Dictionary({
  0: 'Unburned',
  1: 'MCD64A1',
  10: 'GABAM',
  11: 'MCD64A1 + GABAM',
  100: 'MapBiomas Fire Collection 4',
  101: 'MCD64A1 + MapBiomas Fire Collection 4',
  110: 'GABAM + MapBiomas Fire Collection 4',
  111: 'MCD64A1 + GABAM + MapBiomas Fire Collection 4'
});

// -----------------------------------------------------------------------------
// AUXILIARY FUNCTIONS
// -----------------------------------------------------------------------------

/**
 * Returns MODIS burned area mask for a given year.
 */
function get_modis_fire(year) {

  var start = year + '-01-01';
  var end = (year + 1) + '-01-01';

  var collection = modis.filterDate(start, end);

  return ee.Algorithms.If(
    collection.size().gt(0),

    collection
      .select('BurnDate')
      .map(function(image) {
        return image.gt(0).selfMask();
      })
      .max()
      .multiply(1)
      .int(),

    ee.Image(0).int()
  );
}

/**
 * Returns GABAM burned area mask for a given year.
 */
function get_gabam_fire(year) {

  var start = year + '-01-01';
  var end = (year + 1) + '-01-01';

  var collection = gabam.filterDate(start, end);

  return ee.Algorithms.If(
    collection.size().gt(0),

    collection
      .mosaic()
      .select(['b1'], ['classification'])
      .gte(1)
      .multiply(10)
      .int(),

    ee.Image(0).int()
  );
}

/**
 * Returns MapBiomas Fire burned area mask for a given year.
 */
function get_mapbiomas_fire(year) {

  var band_name = 'burned_area_' + year;

  return ee.Algorithms.If(
    mapbiomas_fire.bandNames().contains(band_name),

    mapbiomas_fire
      .select(band_name)
      .gte(1)
      .multiply(100)
      .byte(),

    ee.Image(0).byte()
  );
}

/**
 * Combines all burned area products into a single agreement layer.
 */
function get_combined_fire(year) {

  return ee.Image(get_modis_fire(year))
    .unmask(0)
    .add(ee.Image(get_gabam_fire(year)).unmask(0))
    .add(ee.Image(get_mapbiomas_fire(year)).unmask(0))
    .byte();
}

/**
 * Converts grouped statistics into tabular features.
 */
function convert_to_table(feature) {

  feature = ee.Dictionary(feature);

  var grid_id = feature.get('id_int');

  var groups = ee.List(feature.get('groups'));

  var rows = groups.map(function(item) {

    item = ee.Dictionary(item);

    var class_id = item.get('class');

    return ee.Feature(null, {
      'grid_id': grid_id,
      'class_id': class_id,
      'area_km2': item.get('sum'),
      'agreement': agreement_classes.get(
        class_id,
        'Unknown'
      )
    });

  });

  return ee.FeatureCollection(rows);
}

/**
 * Computes annual burned area agreement statistics by grid cell.
 */
function calculate_annual_area(year) {

  var agreement = get_combined_fire(year);

  var image = pixel_area.addBands(agreement);

  var statistics = image.reduceRegions({
    collection: grid,
    reducer: ee.Reducer.sum().group({
      groupField: 1,
      groupName: 'class'
    }),
    scale: scale,
    tileScale: 2
  });

  var table = statistics.map(function(feature) {

    var dictionary = feature
      .toDictionary()
      .set('id_int', feature.get('id_int'));

    return convert_to_table(dictionary);

  }).flatten();

  return table.map(function(feature) {

    return feature.set('year', year);

  });
}

// -----------------------------------------------------------------------------
// PROCESSING
// -----------------------------------------------------------------------------

var annual_statistics = years.map(function(year) {

  return calculate_annual_area(year);

});

var output = ee.FeatureCollection(
  annual_statistics
).flatten();

print(output.limit(10));

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
