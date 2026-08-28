# Consistency Report

This document verifies the internal consistency of the LunaX documentation suite against the original research architecture.

## Confirmed Consistent
- **Problem Statement:** Accurately reflects the SIH 2026 prompt (Multi-modal, Sun angle and scale invariant image correspondence using Chandrayaan-2).
- **Sensors:** OHRC (0.25m), TMC/TMC-2 (5m), and IIRS (80m, hyperspectral) are consistently identified and their scales correctly referenced across all documents.
- **Pipeline Order:** The sequence (PDS4 Ingestion → DEM Projection → Photometric Normalization → LightGlue/RIFT2 Matching → Spatial Bucketing → MAGSAC++ → TPS Warp → Phase Correlation) is strictly maintained in the Architecture, Data Flow, Solution Overview, and Implementation Plan.
- **Algorithm Descriptions:** Algorithms (CLAHE, LightGlue, RIFT2, MAGSAC++, TPS, Phase Correlation) match the justifications provided in the original research file.
- **Evaluation Metrics:** RMSE, Inlier Ratio, and Uniformity Score are consistently tracked in the Evaluation Plan, Demo Plan, and FAQ.
- **Implementation Status:** The root README and Project Overview accurately state that the project is currently in the `Research` / `Planned` phase, with no fabricated claims of completion.

## Ambiguities
- **TMC vs TMC-2:** The research references both "TMC" and "TMC-2". For consistency, the documentation generally refers to "TMC", but the specific sensor on Chandrayaan-2 is TMC-2. This should be unified in the codebase.
- **Photometric Function:** The research mentions scaling by $\cos(i)$ or using a "Hapke-like model". The documentation currently lists $\cos(i)$ as the primary method, but the exact physical model is not strictly locked.

## Missing Information (Needed before implementation)
- **Specific Tensor Formats:** The exact input tensor shapes `[C, H, W]` and normalizations required by the LightGlue and RIFT2 PyTorch implementations.
- **Hardware Requirements:** The amount of RAM and VRAM required to process a full IIRS/OHRC strip simultaneously.
- **Test Dataset:** Specific PDS4 Product IDs from the ISRO PRADAN archive to be used for the baseline experiments.

## `[TO VERIFY]` Items
The following claims require empirical verification during the implementation phases:
1. `[TO VERIFY]` The exact computational complexity (time and memory) of processing a full-strip IIRS + OHRC pair.
2. `[TO VERIFY]` The exact threshold of inliers required to deem a pair "unregistrable" rather than attempting a bad TPS warp.
3. `[TO VERIFY]` The specific tensor/array representations required by LightGlue/RIFT2 in the implementation.
4. `[TO VERIFY]` Whether Folium/Leaflet or Gradio/Streamlit will be used for the final SIH presentation UI.
