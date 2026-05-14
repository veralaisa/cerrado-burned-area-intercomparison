/**

* @description
* Computes annual burned area (km²) by land-use and land-cover classes
* within the Brazilian Cerrado biome using MapBiomas Fire Collection 4.
* Results are exported as CSV tables to Google Drive.
  */

// Years to process
var years = [
1985, 1986, 1987, 1988, 1989, 1990, 1991, 1992,
1993, 1994, 1995, 1996, 1997, 1998, 1999, 2000,
2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008,
2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016,
2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024
];

// Cerrado biome boundary
var cerrado = ee.FeatureCollection(
'projects/mapbiomas-workspace/AUXILIAR/biomas-2019'
).filter(ee.Filter.eq('Bioma', 'Cerrado'));

var geometry = cerrado.geometry();

// MapBiomas Fire Collection 4
var mapbiomas = ee.Image(
'projects/mapbiomas-public/assets/brazil/fire/collection4_1/mapbiomas_fire_collection41_annual_burned_coverage_v1'
);

// Export parameters
var driverFolder = 'cerrado-burned-area-intercomparison';
var description = 'mapbiomas_fire_annual_burned_area_by_lulc';
var scale = 30;

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
* @param {ee.Image} image - Burned area image.
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

```
item = ee.Dictionary(item);

var classId = item.getNumber('class').int();

return ee.Feature(null, {
  'area_km2': item.get('sum'),
  'class_id': classId,
  'level_0': level0.get(classId),
  'level_1': level1.get(classId),
  'level_1_1': level11.get(classId)
});
```

});

return ee.FeatureCollection(features);
};

// Annual processing
var areas = ee.FeatureCollection(

years.map(function(year) {

```
var image = mapbiomas.select(
  'burned_coverage_' + year
);

var stats = calculateArea(image, geometry);

stats = stats.map(function(feature) {

  return feature.set({
    'year': year,
    'biome': 'Cerrado',
    'source': 'MapBiomas Fire Collection 4'
  });

});

return stats;
```

})

).flatten();

// Export results to Google Drive
Export.table.toDrive({
collection: areas,
description: description,
folder: driverFolder,
fileNamePrefix: description,
fileFormat: 'CSV'
});
