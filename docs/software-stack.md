# Software Stack

The following software and technology stack is proposed for the implementation of the LunaX pipeline. 

*(Note: Certain components are subject to adjustment pending initial prototyping. Items marked `[TO DECIDE]` will be finalized during Phase 1.)*

## Core Language
- **Python 3.10+**: The primary development language due to its extensive scientific computing and deep learning ecosystem.

## Computer Vision
- **OpenCV (cv2)**: Core image processing, standard filtering, and I/O.
- **scikit-image**: Phase correlation and advanced image manipulations.

## Deep Learning
- **PyTorch**: Framework for running the feature matching models (SuperPoint, LightGlue).
- **Kornia**: Differentiable computer vision library (optional, for GPU-accelerated classical CV tasks).

## Geospatial Processing
- **GDAL / rasterio**: Reading and writing GeoTIFFs, managing map projections.
- **pyproj**: Coordinate reference system (CRS) transformations.

## Scientific Computing
- **NumPy**: Core N-dimensional array manipulation.
- **SciPy**: Thin Plate Spline (TPS) interpolation and spatial algorithms (KD-Trees for bucketing).

## Data Formats & Ingestion
- **pds4_tools**: Official Python package for reading NASA PDS4 XML labels and associated array data.

## Visualization
- **Matplotlib / Seaborn**: Generating evaluation plots, match visualization, and debugging.
- **Folium / Leaflet**: `[TO DECIDE]` For interactive web-based map visualizations of the registered products.

## UI / CLI
- **Typer or Click**: For building a robust Command Line Interface (CLI) to trigger the pipeline.
- **Gradio or Streamlit**: `[TO DECIDE]` For the SIH final presentation and live hackathon demo UI.
