
# Cerrado Burned Area Intercomparison

Code and workflows for the intercomparison of MODIS MCD64A1, GABAM, and MapBiomas Fire burned area products in the Brazilian Cerrado, including spatiotemporal analyses, concordance metrics, and land-use/land-cover fire assessments from 2001–2024.

## Overview

This repository contains the scripts, processing workflows, and analytical procedures used in the study:

> **Assessing Global and Regional Remote Sensing Products for Burned Area Mapping: A Comparative Study in the Brazilian Cerrado**
RSASE-D-26-00498R1
> 
The study evaluates spatial and temporal differences among three major burned area datasets:

* MODIS MCD64A1 Collection 6.1
* GABAM (Global Annual Burned Area Map)
* MapBiomas Fire Collection 4

The analysis focuses on:

* annual burned area dynamics;
* spatial agreement among products;
* concordance indices;
* land-use and land-cover fire distribution;
* differences between native and anthropogenic landscapes.

---

## Study Area

The analysis covers the Brazilian Cerrado biome, using the official biome boundaries provided by IBGE.

---

## Datasets

### Burned Area Products

| Product                     | Resolution | Period     | Source        |
| --------------------------- | ---------- | ---------- | ------------- |
| MODIS MCD64A1 C6.1          | 500 m      | 2000–2024  | NASA          |
| GABAM                       | 30 m       | 1985–2024* | CAS / Landsat |
| MapBiomas Fire Collection 4 | 30 m       | 1985–2024  | MapBiomas     |

* GABAM provides annual coverage from 2000 onward and selected years before 2000.

### Land Use and Land Cover

* MapBiomas Collection 10 (1985–2024)

---

## Repository Structure

```text
.
├── README.md
├── gee/
├── google_colab_notebooks/
│   ├── 01_annual_burned_area_analysis.py
│   ├── 02_concordance_index_distribution.py
│   ├── 03_spatial_agreement_map_panel.py
│   ├── 04_agreement_classes_trend_summary.py
│   ├── 05_lulc_burned_area_analysis.py
│   └── 06_native_vegetation_fire_maps.py
└── docs/
    ├── figures/
```


### Folder Description

* `gee/` — Google Earth Engine scripts used for burned area processing, spatial agreement analysis, concordance index computation, land-use/land-cover assessment, and statistical data extraction.

* `google_colab_notebooks/` — Google Colab notebooks used for exploratory analyses, statistical interpretation, visualization, and figure generation from exported datasets.


## Citation

If you use this repository, please cite:

```bibtex
@article{arruda2026cerrado,
  title={Assessing Global and Regional Remote Sensing Products for Burned Area Mapping: A Comparative Study in the Brazilian Cerrado},
  author={Arruda, Vera Laísa da Silva and others},
  journal={Remote Sensing Applications: Society and Environment},
  year={2026}
}
```



Funding acknowledgements follow the manuscript specifications.
