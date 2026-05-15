# =============================================================================
# SPATIAL AGREEMENT MAP PANEL
# =============================================================================

# Uncomment if dependencies are not installed
# !pip install --quiet earthengine-api folium geemap
# !pip install --quiet contextily geopandas shapely

# =============================================================================
# IMPORT LIBRARIES
# =============================================================================

import re
import ee
import folium
import geemap

import numpy as np

import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import matplotlib.gridspec as gridspec

import contextily as ctx

from PIL import Image

from io import BytesIO

from IPython.display import display

from mpl_toolkits.axes_grid1.inset_locator import (
    inset_axes
)

import urllib.request

from google.colab import drive

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

try:

    ee.Initialize()

except Exception:

    ee.Authenticate()

    ee.Initialize(
        project='ee-veraarruda'
    )

print('Google Earth Engine initialized.')

# =============================================================================
# MAP VISUALIZATION PARAMETERS
# =============================================================================

agreement_palette = [
    '#ff1e00',  # MODIS
    '#ffff00',  # GABAM
    '#FF8C00',  # MODIS + GABAM
    '#42D4F4',  # MapBiomas Fire
    '#200fdb',  # MODIS + MapBiomas Fire
    '#6b00ad',  # GABAM + MapBiomas Fire
    '#000000'   # Full agreement
]

agreement_labels = [
    'MODIS',
    'GABAM',
    'MODIS + GABAM',
    'MapBiomas Fire',
    'MODIS + MapBiomas Fire',
    'GABAM + MapBiomas Fire',
    'MODIS + GABAM + MapBiomas Fire'
]

print('Spatial agreement panel configuration loaded.')
