# Geometry and Photometry

The LunaX pipeline addresses physical imaging differences in two major categories: Geometry and Photometry. These normalization steps are crucial precursors to feature matching.

## Geometric Normalization

**The Problem:**
Images from OHRC, TMC, and IIRS are captured from different altitudes, orbits, and viewpoints, creating massive differences in scale and perspective. Furthermore, the lunar terrain is not flat; deep craters and mountains create significant parallax effects depending on the viewing angle.

**The Solution: DEM Projection (Orthorectification)**
To achieve true geometric and scale invariance, the pipeline does not rely on image-space resizing. Instead, it projects the images into 3D space:
1. **Sensor Geometry:** PDS4 labels provide ephemeris (orbit position) and attitude (pointing angle) data.
2. **DEM Intersection:** Using a global DEM (LRO-LOLA/Kaguya) or a local TMC-2 stereo DEM, each pixel from the sensor is ray-traced down to its intersection with the 3D lunar surface.
3. **Common Ground Grid:** The 3D intersection points are then resampled back onto a standard 2D map projection at a uniform ground sampling distance.

*Result:* This completely removes perspective parallax and scale differences. An 80m IIRS pixel and a 0.25m OHRC pixel are now fundamentally aligned on the same 2D coordinate grid.

## Photometric Normalization

**The Problem:**
An image taken at dawn looks vastly different from an image taken at noon. Long shadows stretch across craters at high incidence angles, while noon images may look flat and uniformly bright. Furthermore, the different sensors capture varying radiometric intensities.

**The Solution: Illumination Invariance**
1. **Histogram Matching and CLAHE:** General techniques are used first to equalize local contrast (CLAHE) and align global tonal distributions (Histogram Matching).
2. **Physics-based Correction:** PDS4 metadata provides the exact Sun elevation and azimuth at the time of capture. Using the DEM, the pipeline calculates the local surface normal for every pixel.
3. **Incidence Angle Normalization:** By determining the solar incidence angle ($i$) relative to the surface normal, the pipeline scales the observed radiance to simulate a standard viewing/illumination geometry (e.g., standardizing everything to a 30° incidence angle). This physically removes shadows and lighting variance.

*Result:* This separates the physical reflectance of the lunar surface from the temporary lighting conditions, achieving true Sun-angle invariance.

## Distinction
- **Geometric Invariance** ensures pixels represent the exact same coordinate on the moon, regardless of where the camera was.
- **Illumination Invariance** ensures those pixels look the same, regardless of where the Sun was.
