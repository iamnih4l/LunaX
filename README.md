<div align="center">
  
  # 🌕 LunaX
  
  **Multi-modal, Sun Angle & Scale Invariant Image Correspondence using Chandrayaan-2 Optical Images**
  
  <br>

  [![SIH 2026](https://img.shields.io/badge/Smart_India_Hackathon-2026-ff6600?style=for-the-badge&logo=codeforces&logoColor=white)](#)
  [![Status](https://img.shields.io/badge/Status-Active_Development-44cc11?style=for-the-badge)](#)
  [![Docs](https://img.shields.io/badge/Documentation-Complete-0077ff?style=for-the-badge)](#)

  <br>
  
  ### 🎬 Watch the Interactive Demo
  
  *Experience the LunaX platform in action.*
  
  <video src="./frontend/public/LunaX.mp4" width="100%" controls></video>

  <br>
  <br>

</div>

---

## 🌌 The Mission

LunaX provides an automated, end-to-end registration pipeline for **Chandrayaan-2 imagery**. By leveraging deep space PDS4 metadata and lunar Digital Elevation Models (DEM), LunaX performs coarse geometric orthorectification, applies physics-based photometric normalization for illumination invariance, and utilizes a robust feature matching ensemble (LightGlue + RIFT2) combined with MAGSAC++ and Thin Plate Splines (TPS) to achieve sub-pixel, scale-invariant, and multi-modal image registration.

---

## 🚀 Key Innovations

<table align="center" width="100%">
  <tr>
    <td width="50%" align="center">
      <h3>🔍 Scale Invariant</h3>
      <p>Normalizes extreme <strong>320x scale differences</strong> (0.25m OHRC to 80m IIRS) via precise 3D DEM ray-tracing.</p>
    </td>
    <td width="50%" align="center">
      <h3>☀️ Sun Angle Invariant</h3>
      <p>Reverses physical shadow & illumination variance dynamically using deep PDS4 solar incidence angles.</p>
    </td>
  </tr>
  <tr>
    <td width="50%" align="center">
      <h3>🧠 Multi-modal Invariant</h3>
      <p>Bridges the visible/hyperspectral gap using cutting-edge deep learning (<strong>LightGlue</strong>) and phase congruency (<strong>RIFT2</strong>).</p>
    </td>
    <td width="50%" align="center">
      <h3>🎯 Sub-pixel Accuracy</h3>
      <p>Achieves extreme precision registration via FFT-based phase correlation and <strong>Thin Plate Spline (TPS)</strong> warping.</p>
    </td>
  </tr>
</table>

---

## ⚙️ Architecture Pipeline

```mermaid
flowchart LR
    A[PDS4 Ingestion] --> B[DEM Projection]
    B --> C[Photometric Normalization]
    C --> D[LightGlue / RIFT2]
    D --> E[Spatial Bucketing]
    E --> F[MAGSAC++]
    F --> G[TPS Warp]
    G --> H[Phase Correlation]
    H --> I[GeoTIFF Output]
    
    style A fill:#050505,stroke:#ff6600,color:#fff
    style I fill:#050505,stroke:#44cc11,color:#fff
    style D fill:#112244,stroke:#0077ff,color:#fff
```

---

## 📂 Repository Structure

```text
LunaX/
├── backend/       # Python/FastAPI - Photometry & Image Registration Engine
├── frontend/      # React/Three.js - 3D Interactive Lunar Interface
├── data/          # Raw PDS4 and DEM files
├── docs/          # Technical specifications & planning
├── scripts/       # CLI entry points and utilities
├── tests/         # Unit and integration tests
├── notebooks/     # Prototyping and ML experiments
└── outputs/       # Registered GeoTIFF products
```

---

## 📚 Technical Documentation

Explore the complete technical specification and research behind LunaX in our `/docs` directory:

| Architecture | Algorithms | Planning & QA |
|---|---|---|
| 📄 [Problem Statement](docs/problem-statement.md) | 🔢 [Algorithms](docs/algorithms.md) | 🛠️ [Implementation Plan](docs/implementation-plan.md) |
| 🏗️ [System Architecture](docs/system-architecture.md) | 🧠 [Multimodal Matching](docs/multimodal-matching.md) | 🧪 [Evaluation Plan](docs/evaluation.md) |
| 📊 [Data Flow](docs/data-flow.md) | ☀️ [Geometry & Photometry](docs/geometry-and-photometry.md) | ⚠️ [Risks & Limitations](docs/risks-and-limitations.md) |
| 🛠️ [Software Stack](docs/software-stack.md) | 🎯 [Matching & Registration](docs/matching-and-registration.md) | 🔬 [Experiments](docs/experiments.md) |
| 💡 [Solution Overview](docs/solution-overview.md) | 📈 [Consistency Report](docs/consistency-report.md) | 🗣️ [SIH Presentation](docs/sih-presentation.md) |

---

## 🚀 Setup & Launch

*(Full setup instructions for the Python backend and React frontend are currently being finalized.)*

```bash
# Clone the repository
git clone https://github.com/your-org/LunaX.git
cd LunaX

# Start the interactive UI
cd frontend
npm install
npm run dev
```

<br>

<div align="center">
  <p><i>Engineered for the <strong>Smart India Hackathon 2026</strong>.</i></p>
</div>
