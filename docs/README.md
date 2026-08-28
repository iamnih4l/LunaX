# LunaX Documentation

## Project Overview
**SIH Problem Statement:** Multi-modal, Sun angle and scale invariant image correspondence using Chandrayaan-2 optical images (OHRC, TMC and IIRS).

**Solution Summary:** LunaX provides an automated, end-to-end registration pipeline for Chandrayaan-2 imagery. It leverages PDS4 metadata and lunar Digital Elevation Models (DEM) to perform coarse geometric orthorectification, applies physics-based photometric normalization for illumination invariance, and utilizes a robust feature matching ensemble (LightGlue + RIFT2) combined with MAGSAC++ and Thin Plate Splines (TPS) to achieve sub-pixel, scale-invariant, and multi-modal image registration.

## Architecture Overview
The pipeline consists of the following key stages:
1. PDS4 Data Ingestion & Metadata Extraction
2. DEM-based Geometric Alignment / Orthorectification
3. Illumination / Photometric Normalization
4. Multimodal Feature Matching
5. Spatial Match Regularization
6. Robust Geometric Fitting
7. Local Warping (TPS)
8. Sub-pixel Refinement
9. Registered Product Generation
10. Evaluation

## Documentation Index
- [Problem Statement](problem-statement.md)
- [Solution Overview](solution-overview.md)
- [System Architecture](system-architecture.md)
- [Data Flow](data-flow.md)
- [Algorithms](algorithms.md)
- [Multimodal Matching](multimodal-matching.md)
- [Geometry and Photometry](geometry-and-photometry.md)
- [Matching and Registration](matching-and-registration.md)
- [Evaluation](evaluation.md)
- [Experiments](experiments.md)
- [Implementation Plan](implementation-plan.md)
- [Software Stack](software-stack.md)
- [Project Structure](project-structure.md)
- [Risks and Limitations](risks-and-limitations.md)
- [SIH Presentation](sih-presentation.md)
- [Demo Plan](demo-plan.md)
- [FAQ](faq.md)
- [Consistency Report](consistency-report.md)

## Quick-Start Documentation
*(Placeholder: Setup instructions will be added here once implementation begins.)*

## Development Workflow
Please refer to the [Implementation Plan](implementation-plan.md) and [Project Structure](project-structure.md) to understand the phased development approach and repository layout.

## Current Implementation Status
- **Status:** `Research` / `Planned`
- Implementation of Phase 1 (Data Ingestion) is planned as the immediate next step.
