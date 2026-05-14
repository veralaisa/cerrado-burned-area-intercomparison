/**
 * @description
 * Computes annual burned area (km²) by land-use and land-cover classes
 * within the Brazilian Cerrado biome using annual MODIS MCD64A1 products.
 * Results are exported as CSV tables to Google Drive.
 */

// Years available in MODIS MCD64A1
var years = [
  2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009,
  2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018,
  2019, 2020, 2021, 2022, 2023, 2024
];

// Cerrado biome boundary
var cerrado = ee.FeatureCollection(
  'projects/mapbiomas-workspace/AUXILIAR/biomas-2019'
).filter(ee.Filter.eq('Bioma', 'Cerrado'));

var geometry = cerrado.geometry();

// Export parameters
var driverFolder = 'cerrado-burned-area-intercomparison';
var description = 'modis_mcd64a1_annual_burned_area_by_lulc';

// Native MODIS spatial resolution
var scale = 500;

// Pixel area converted to km²
var pixelArea = ee.Image.pixelArea().divide(1e6);

// Land-use and land-cover legends
var legends = require(
  'users/geomapeamentoipam/MapBiomas__Fogo:00_Tools/Legends.js'
);

var level0 = ee.Dictionary(legends.get('lulc_mbc10_nivel_0_eng'));
var level1 = ee.Dictionary(legends.get('lulc_mbc10_nivel_1_eng'));
var level11 = ee.Dictionary(legends.get('lulc_mbc10_nivel_1_1_eng'));

/**
 * Computes burned area statistics by land-cover class.
 *
 * @param {ee.Image} image - Burned area image classified by LULC class.
 * @param {ee.Geometry} geometry - Study area geometry.
 * @return {ee.FeatureCollection} Area statistics by class.
 */
var calculateArea = function(image, geometry) {

  var reducer = ee.Reducer.sum().group({
    groupField: 1,
    groupName: 'class'
  });

  var data = pixelArea
    .addBands(image)
    .reduceRegion({
      reducer: reducer,
      geometry: geometry,
      scale: scale,
      maxPixels: 1e12
    });

  var classData = ee.List(data.get('groups'));

  var features = classData.map(function(item) {

    item = ee.Dictionary(item);

    var classId = item.getNumber('class').int();

    return ee.Feature(null, {
      'area_km2': item.get('sum'),
      'class_id': classId,
      'level_0': level0.get(classId),
      'level_1': level1.get(classId),
      'level_1_1': level11.get(classId)
    });

  });

  return ee.FeatureCollection(features);
};

// List to store annual statistics
var featureList = [];

// Annual processing
years.forEach(function(year) {

  var assetPath =
    'projects/YOUR_PROJECT/assets/modis_burned_lulc/modis_burned_lulc_' +
    year;

  var image = ee.Image(assetPath);

  var stats = calculateArea(image, geometry);

  stats = stats.map(function(feature) {

    return feature.set({
      'year': year,
      'biome': 'Cerrado',
      'source': 'MODIS MCD64A1'
    });

  });

  featureList.push(stats);

});

// Merge all annual FeatureCollections
var areas = ee.FeatureCollection(featureList).flatten();

// Export results to Google Drive
Export.table.toDrive({
  collection: areas,
  description: description,
  folder: driverFolder,
  fileNamePrefix: description,
  fileFormat: 'CSV'
});
