/**

* @file
* Generates annual burned area agreement maps among
* MODIS MCD64A1, GABAM, and MapBiomas Fire Collection 4
* across the Brazilian Cerrado biome.
*
* Agreement classes:
* * 1   = MODIS
* * 10  = GABAM
* * 11  = MODIS + GABAM
* * 100 = MapBiomas Fire
* * 101 = MODIS + MapBiomas Fire
* * 110 = GABAM + MapBiomas Fire
* * 111 = MODIS + GABAM + MapBiomas Fire
*
* Outputs:
* * Annual convergence rasters exported to Earth Engine Assets
    */

// -----------------------------------------------------------------------------
// INPUT DATA
// -----------------------------------------------------------------------------

// Cerrado biome boundary
var cerrado = ee.FeatureCollection(
'users/veraarruda/cerrado_250mil_wgs84'
);

// Export region
var export_region = cerrado.geometry().bounds();

// MODIS MCD64A1
var modis = ee.ImageCollection(
'MODIS/061/MCD64A1'
);

// GABAM
var gabam = ee.ImageCollection(
'projects/sat-io/open-datasets/GABAM'
);

// MapBiomas Fire Collection 4
var mapbiomas_fire = ee.Image(
'projects/mapbiomas-public/assets/brazil/fire/collection4_1/' +
'mapbiomas_fire_collection41_annual_burned_v1'
);

// -----------------------------------------------------------------------------
// PARAMETERS
// -----------------------------------------------------------------------------

var asset_path =
'projects/ee-veraarruda/assets/doutorado/' +
'produtos_fogo/convergencia_col4_mcd64a1_gabam';

// Spatial resolution (meters)
var scale = 30;

// -----------------------------------------------------------------------------
// AUXILIARY FUNCTIONS
// -----------------------------------------------------------------------------

/**

* Exports annual agreement image to Earth Engine Assets.
  */
  function export_to_asset(image, year) {

Export.image.toAsset({
image: image,
description: 'fire_convergence_' + year,
assetId:
asset_path + '/fire_convergence_' + year,
region: export_region,
scale: scale,
maxPixels: 1e13,
pyramidingPolicy: {
'.default': 'mode'
}
});

}

/**

* Returns MODIS burned area mask.
  */
  function get_modis_fire(year) {

if (year < 2000) {

```
return ee.Image(0)
  .rename('BurnDate');
```

}

var start = year + '-01-01';

var end = (year + 1) + '-01-01';

return modis
.filterDate(start, end)
.select('BurnDate')
.map(function(image) {

```
  return image.gt(0).selfMask();

})
.max();
```

}

/**

* Returns GABAM burned area mask.
  */
  function get_gabam_fire(year) {

if (year > 2024) {

```
return ee.Image(0).selfMask();
```

}

var start = year + '-01-01';

var end = (year + 1) + '-01-01';

return gabam
.filterDate(start, end)
.map(function(image) {

```
  return image.gt(0).selfMask();

})
.max();
```

}

/**

* Returns MapBiomas Fire burned area mask.
  */
  function get_mapbiomas_fire(year) {

return mapbiomas_fire
.select('burned_area_' + year)
.gt(0)
.selfMask();
}

/**

* Builds annual agreement map.
  */
  function build_agreement_map(year) {

var modis_fire = get_modis_fire(year)
.clip(cerrado);

var gabam_fire = get_gabam_fire(year)
.clip(cerrado);

var mapbiomas_fire_year =
get_mapbiomas_fire(year)
.clip(cerrado);

var modis_binary =
modis_fire.gt(0).toInt8();

var gabam_binary =
gabam_fire.gt(0).toInt8();

var mapbiomas_binary =
mapbiomas_fire_year.gt(0).toInt8();

var agreement = ee.Image(0)
.toInt8();

// MODIS
agreement = agreement.where(
modis_binary.eq(1),
1
);

// GABAM
agreement = agreement.where(
gabam_binary.eq(1),
agreement.add(10)
);

// MapBiomas Fire
agreement = agreement.where(
mapbiomas_binary.eq(1),
agreement.add(100)
);

return agreement
.updateMask(agreement.neq(0))
.toInt8()
.clip(cerrado)
.rename('fire_convergence');
}

// -----------------------------------------------------------------------------
// PROCESSING
// -----------------------------------------------------------------------------

for (var year = 1985; year <= 2024; year++) {

print('Processing year:', year);

var agreement_map =
build_agreement_map(year);

export_to_asset(
agreement_map,
year
);

// Optional visualization
if (year === 2024) {

```
var color_map = {
  0:   '#FFFFFF',
  1:   '#ff1e00',
  10:  '#ffff00',
  11:  '#FF8C00',
  100: '#42D4F4',
  101: '#200fdb',
  110: '#6b00ad',
  111: '#000000'
};

var palette = [];

for (var i = 0; i <= 111; i++) {

  palette.push(
    color_map[i] || 'ffffff'
  );

}

Map.centerObject(cerrado, 6);

Map.addLayer(
  modis_fire,
  {
    min: 0,
    max: 1,
    palette: ['#ff1e00']
  },
  'MODIS ' + year
);

Map.addLayer(
  gabam_fire,
  {
    min: 0,
    max: 1,
    palette: ['#ffff00']
  },
  'GABAM ' + year
);

Map.addLayer(
  mapbiomas_fire_year,
  {
    min: 0,
    max: 1,
    palette: ['#42D4F4']
  },
  'MapBiomas Fire ' + year
);

Map.addLayer(
  agreement_map,
  {
    min: 0,
    max: 111,
    palette: palette
  },
  'Agreement ' + year,
  true
);
```

}

}
