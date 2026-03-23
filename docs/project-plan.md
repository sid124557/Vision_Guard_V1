# VisionGuard Project Plan

## Vision
Create a browser-based defect detection system that works on mobile devices, stores training data in Firebase, and retrains models in Google Colab.

## Users
- Quality inspectors using a phone on the production floor
- Engineers curating defect datasets
- ML developers retraining the model in Colab

## Functional requirements
- Two pages hosted on GitHub Pages
- Mobile camera support
- Defect capture and visualization
- Firebase-backed dataset management
- Colab-based model training workflow
- Web model deployment back into the static app

## Non-functional requirements
- Mobile-first design
- Static-site deployment compatible with GitHub Pages
- Low-latency inference on modern phones
- Dataset traceability and versioning
- Simple operator workflow

## Initial backlog
1. Create frontend scaffold
2. Add Firebase project wiring
3. Implement upload and labeling flow
4. Implement dataset browser
5. Create Colab notebook
6. Export first TFJS model
7. Add live detection loop
8. Add detection logging
9. Add box rendering
10. Optimize mobile performance

## Success metrics
- Time to first prediction under 2 seconds after camera start
- Inference latency under 300 ms per analyzed frame on target device
- Precision above 90% for missing breather on validation set
- Dataset upload success rate above 99%

## Release plan
- **Release 0.1:** dataset page + Firebase integration
- **Release 0.2:** classifier-based live detection
- **Release 0.3:** object detection with bounding boxes
- **Release 1.0:** stable GitHub Pages deployment with documented retraining loop
