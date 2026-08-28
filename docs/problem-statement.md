# Problem Statement

## The SIH Problem
**“Multi-modal, Sun angle and scale invariant image correspondence using Chandrayaan-2 optical images (OHRC, TMC and IIRS)”**

The Smart India Hackathon (SIH) 2026 tasks us with registering images from three distinct optical sensors aboard the Chandrayaan-2 orbiter. 

The primary difficulties arise from the extreme differences between these sensors and the lunar environment:
- **Different Sensors & Spectral Characteristics:** IIRS is a hyperspectral imager (800–5000 nm, ~256 bands), TMC-2 is a panchromatic stereo camera, and OHRC is a very-high-resolution panchromatic camera.
- **Different Spatial Resolutions (Scale):** IIRS operates at ~80 m/pixel, TMC-2 at ~5 m/pixel, and OHRC at an ultra-high ~0.25 m/pixel. This requires extreme scale invariance.
- **Different Viewpoints & Terrain/Relief:** The lunar surface features severe topological relief (craters, mountains). Images taken from different orbits present massive parallax and perspective distortions.
- **Different Sun Angles:** Images captured at different times have drastically different illumination, shadows, and contrast (e.g., dawn vs. noon).

## Why Existing Simple Registration Is Insufficient
Traditional image registration techniques fail on this dataset due to the following reasons:
- **Simple Image Resizing:** Cannot account for the extreme scaling (320x difference between OHRC and IIRS) without severe aliasing and information loss.
- **Direct Pixel Correlation:** Fails entirely due to differing spectral responses, modalities, and non-linear illumination differences.
- **A Single Homography:** Assumes a planar scene. The lunar surface has deep craters and high relief; a single homography cannot map perspective changes over non-planar terrain.
- **Ordinary Feature Matching (e.g., SIFT/SURF):** SIFT relies on linear gradients, which fail across multimodal imagery (IR vs. visible) and are extremely sensitive to non-linear illumination changes caused by varying Sun angles.
- **Histogram Matching Alone:** May align global intensity distributions, but does not correct physics-based directional lighting effects (shadows on craters based on sun incidence angle).

## Expected Output
The system should produce **Registered Products (e.g., GeoTIFFs)** where the source image is accurately warped and aligned to the reference image in a common coordinate system. The alignment must be robust across modalities, spatially uniform, and refined to sub-pixel accuracy.
