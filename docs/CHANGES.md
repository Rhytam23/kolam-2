# CHANGES.md

## Summary of major changes made

### Product workflow
- Connected analyzer, generator, and walkthrough through shared workspace state.
- Added save/load/delete/export/import support for workspaces.
- Improved continuity between detection and procedural generation.

### Analyzer improvements
- Added detection presets:
  - balanced
  - clean-scan
  - phone-photo
  - noisy-background
- Added perspective correction toggle.
- Added confidence estimate display.
- Added click-to-add/remove dots.
- Added drag-to-reposition dots.
- Added undo/redo.
- Added zoom.
- Added auto-snap to lattice.
- Added overlay PNG export.

### Backend improvements
- Added denoising pipeline.
- Added CLAHE contrast enhancement.
- Added adaptive thresholding and Otsu thresholding.
- Added morphology cleanup.
- Added contour candidate filtering.
- Added blob detector fallback.
- Added de-duplication and outlier filtering.
- Added preset-based tuning.
- Added optional deskewing.

### Generator improvements
- Added analyzer-reference overlay.
- Added comparison stats.
- Kept SVG export.
- Added JSON workspace export access.

### Documentation/content
- Rewrote README for the actual project.
- Cleaned About/Research/Team/Footer copy.
- Added PROJECT_SUMMARY.md.
