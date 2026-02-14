# Audio Gear Photo Starter (prototype)

Quick standalone app for identifying audio gear in a photo and suggesting practical first steps.

## What it does

1. You upload a photo of your setup (studio desk, podcast rig, live rack, etc.).
2. A vision model estimates which gear appears in the image from a curated label list.
3. The app returns beginner-friendly setup recommendations based on detected gear.

## Run locally

```bash
cd audio-gear-photo-starter
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python3 app.py
```

Then open the Gradio URL shown in your terminal.

## Notes

- First run downloads the model (`openai/clip-vit-base-patch32`), so startup can take longer.
- Recognition is estimate-only and depends on photo angle, lighting, and clutter.
- Suggestions are intentionally simple and aimed at helping someone get started quickly.

## Quick smoke test (no model download)

```bash
cd audio-gear-photo-starter
python -m unittest test_recommendations.py
```
