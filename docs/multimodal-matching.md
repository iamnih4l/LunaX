# Multimodal Feature Matching

Achieving reliable correspondences across multi-modal imagery is the central challenge in this pipeline.

## Why Matching is Difficult Across Sensors

### OHRC ↔ TMC
- **Difficulty:** Primarily a massive scale difference. OHRC is 0.25 m/pixel, while TMC is 5 m/pixel (a 20x spatial difference). While both are panchromatic, OHRC reveals fine boulder and small crater details that simply do not exist in the TMC images. 

### OHRC ↔ IIRS
- **Difficulty:** Extreme scale difference (320x, 0.25 m/pixel vs 80 m/pixel) combined with extreme spectral difference (visible vs. hyperspectral IR). OHRC sees fine shadows; IIRS sees broad thermal/reflectance properties. Features present in OHRC may be completely invisible to IIRS, and vice-versa.

### TMC ↔ IIRS
- **Difficulty:** Significant scale difference (16x) and severe spectral contrast. IR bands often experience non-linear intensity inversions relative to visible bands (what is dark in TMC might be bright in IIRS).

## The Matching Strategy

Traditional feature descriptors (SIFT, SURF) rely on linear intensity gradients. When comparing a visible band to an IR band, gradients often invert or behave non-linearly, rendering gradient-based descriptors useless.

To solve this, we employ a hybrid approach: **LightGlue + SuperPoint** as the primary matcher, with **RIFT2** as a robust fallback.

### Primary: LightGlue + SuperPoint
LightGlue (acting on SuperPoint keypoints) is a deep-learning matcher that adaptively learns to match local features. It is heavily utilized because it is fast, memory-efficient, and capable of bridging moderate appearance differences through learned representations.

### Fallback: RIFT2
When the spectral or illumination differences are too extreme for LightGlue, we utilize RIFT2. RIFT2 does not rely on intensity gradients. Instead, it relies on **phase congruency**, making it NRD (Non-linear Radiometric Distortion)-insensitive. It specifically targets multimodal challenges.

## Fallback Logic

```text
Candidate Image Pair
        ↓
SuperPoint Feature Extraction
        ↓
LightGlue Matching
        ↓
Confidence / Inlier Yield Evaluation
        ↓
   ┌────────────────────────────────┐
   │ Is inlier count & confidence   │
   │ sufficient? (> threshold)      │
   └───────┬────────────────┬───────┘
          YES               NO
           │                 │
           │                 ↓
           │            RIFT2 Fallback
           │                 │
           └───────┬─────────┘
                   ↓
         Merge / Filter Matches
                   ↓
           Candidate Tiepoints
```

By cascading these two methods, the pipeline remains fast for standard or easily-corrected pairs (LightGlue) while remaining exceptionally robust against difficult multimodal pairs (RIFT2).
