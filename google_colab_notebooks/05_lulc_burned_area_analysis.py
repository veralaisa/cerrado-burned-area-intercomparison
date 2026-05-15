# =============================================================================
# LULC BURNED AREA ANALYSIS
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

from matplotlib.patches import Rectangle

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
# LOAD GOOGLE SHEETS DATA
# =============================================================================

# Google Sheets file ID
sheet_id = (
    '1pjBg9QNyn18pww-KG-sYZmRw1C_zorRPhz4ZWoJFR_k'
)

# Open spreadsheet
spreadsheet = gc.open_by_key(sheet_id)

# Select worksheet
worksheet = spreadsheet.worksheet(
    'Annual'
)

# Load worksheet as DataFrame
df = get_as_dataframe(
    worksheet,
    evaluate_formulas=True
)

# Remove empty rows and columns
df = df.dropna(how='all')

df = df.dropna(
    axis=1,
    how='all'
)

# Preview data
print(df.head())
