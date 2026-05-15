# =============================================================================
# AGREEMENT CLASSES TREND SUMMARY
# =============================================================================

# -----------------------------------------------------------------------------
# SORT AND RENAME COLUMNS
# -----------------------------------------------------------------------------

trends_df = trends_df.sort_values(
    'Situação'
)

trends_df = trends_df.rename(
    columns={
        'Situação': 'Agreement Class',
        'Mean_Area': 'Mean Annual Burned Area (km²)',
        'Total_Area': 'Total Burned Area (km²)',
        'Std_Area': 'Standard Deviation (km²)',
        'P_Value': 'P-value'
    }
)

# -----------------------------------------------------------------------------
# REORDER COLUMNS
# -----------------------------------------------------------------------------

final_column_order = [
    'Agreement Class',
    'Total Burned Area (km²)',
    'Mean Annual Burned Area (km²)',
    'Standard Deviation (km²)',
    'Slope',
    'P-value'
]

trends_df = trends_df[
    final_column_order
]

# -----------------------------------------------------------------------------
# EXPORT TABLE
# -----------------------------------------------------------------------------

output_path = (
    f'{TABLES_DIR}/'
    'agreement_classes_trend_summary.csv'
)

trends_df.to_csv(
    output_path,
    index=False
)

# Preview table
print(trends_df)

print(f'Table exported to:\n{output_path}')
