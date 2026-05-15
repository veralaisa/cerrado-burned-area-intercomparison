# =============================================================================
# NATIVE VEGETATION FIRE MAPS
# =============================================================================

# Uncomment if dependencies are not installed
# !pip install --quiet gspread gspread-dataframe
# !pip install --quiet geemap

# =============================================================================
# IMPORT LIBRARIES
# =============================================================================

import os
import json
import textwrap

import ee
import geemap
import gspread

import pandas as pd
import numpy as np
import geopandas as gpd

import seaborn as sns
import matplotlib as mpl
import matplotlib.pyplot as plt

from pathlib import Path

from shapely.geometry import shape

from matplotlib.colors import (
    Normalize,
    PowerNorm
)

from matplotlib.lines import Line2D

from gspread_dataframe import (
    set_with_dataframe,
    get_as_dataframe
)

from google.colab import auth
from google.colab import drive

from google.auth import default

# =============================================================================
# GOOGLE AUTHENTICATION
# =============================================================================

auth.authenticate_user()

creds, _ = default()

scoped_creds = creds.with_scopes([
    'https://www.googleapis.com/auth/spreadsheets'
])

gc = gspread.authorize(scoped_creds)

# =============================================================================
# GOOGLE DRIVE
# =============================================================================

drive.mount('/content/drive')

# =============================================================================
# PROJECT DIRECTORIES
# =============================================================================

PROJECT_DIR = (
    '/content/drive/MyDrive/'
    'cerrado-burned-area-intercomparison'
)

COLAB_OUTPUTS_DIR = (
    f'{PROJECT_DIR}/colab_outputs'
)

FIGURES_DIR = (
    f'{COLAB_OUTPUTS_DIR}/figures'
)

TABLES_DIR = (
    f'{COLAB_OUTPUTS_DIR}/tables'
)

# =============================================================================
# INITIALIZE GOOGLE EARTH ENGINE
# =============================================================================

ee.Initialize(
    project='ee-veraarruda'
)

print('Google Earth Engine initialized.')

# =============================================================================
# LOAD SPATIAL DATA
# =============================================================================

# Cerrado hexagonal grid
hex_grid = ee.FeatureCollection(
    'projects/ee-veraarruda/assets/doutorado/'
    'hexagonos_cerrado_20km'
)

# Brazilian biomes
biomes = ee.FeatureCollection(
    'projects/mapbiomas-workspace/AUXILIAR/biomas-2019'
)

# Cerrado biome
cerrado = biomes.filter(
    ee.Filter.eq('Bioma', 'Cerrado')
)

print('Spatial datasets loaded successfully.')
