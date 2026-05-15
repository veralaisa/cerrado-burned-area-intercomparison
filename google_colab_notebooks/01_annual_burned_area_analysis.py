# =============================================================================
# INITIAL SETUP
# =============================================================================

# Uncomment if dependencies are not installed
# !pip install --quiet gspread gspread-dataframe

# =============================================================================
# IMPORT LIBRARIES
# =============================================================================

import pandas as pd
import numpy as np

import matplotlib.pyplot as plt
import matplotlib as mpl
import seaborn as sns

import gspread

from pathlib import Path

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

drive.mount('/content/drive')

# =============================================================================
# PROJECT DIRECTORIES
# =============================================================================

PROJECT_DIR = (
    '/content/drive/MyDrive/'
    'cerrado-burned-area-intercomparison'
)

GEE_EXPORTS_DIR = f'{PROJECT_DIR}/gee_exports'
GEE_TABLES_DIR = f'{GEE_EXPORTS_DIR}/tables'
GEE_RASTERS_DIR = f'{GEE_EXPORTS_DIR}/rasters'

COLAB_OUTPUTS_DIR = f'{PROJECT_DIR}/colab_outputs'
FIGURES_DIR = f'{COLAB_OUTPUTS_DIR}/figures'
TABLES_DIR = f'{COLAB_OUTPUTS_DIR}/tables'

NOTEBOOKS_DIR = f'{PROJECT_DIR}/notebooks'

directories = [
    PROJECT_DIR,
    GEE_EXPORTS_DIR,
    GEE_TABLES_DIR,
    GEE_RASTERS_DIR,
    COLAB_OUTPUTS_DIR,
    FIGURES_DIR,
    TABLES_DIR,
    NOTEBOOKS_DIR
]

for directory in directories:
    Path(directory).mkdir(
        parents=True,
        exist_ok=True
    )

print('Project directories created successfully.')

# =============================================================================
# LOAD GOOGLE SHEETS DATA
# =============================================================================

sheet_id = (
    '165LaEdfVqPOhAHbeBYEWAM5KDnji6DWm5zUoba-Of4Y'
)

spreadsheet = gc.open_by_key(sheet_id)

worksheet = spreadsheet.worksheet('Annual')

df = get_as_dataframe(
    worksheet,
    evaluate_formulas=True
)

df = df.dropna(how='all')
df = df.dropna(axis=1, how='all')

print(df.head())
