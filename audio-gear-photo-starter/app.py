"""Gradio prototype for audio gear recognition from a photo."""

from __future__ import annotations

from functools import lru_cache
from typing import Any

import gradio as gr
from PIL import Image
from transformers import pipeline

from recommendations import (
    AUDIO_GEAR_LABELS,
    Detection,
    format_detection_markdown,
    format_recommendations_markdown,
    select_relevant_detections,
)


MODEL_NAME = "openai/clip-vit-base-patch32"


@lru_cache(maxsize=1)
def get_classifier():
    # Loaded lazily so app startup stays fast.
    return pipeline("zero-shot-image-classification", model=MODEL_NAME)


def _parse_model_output(raw_output: Any) -> list[Detection]:
    if isinstance(raw_output, dict) and "labels" in raw_output and "scores" in raw_output:
        labels = raw_output["labels"]
        scores = raw_output["scores"]
        if isinstance(labels, list) and isinstance(scores, list):
            return [
                Detection(label=str(label), score=float(score))
                for label, score in zip(labels, scores)
            ]

    if isinstance(raw_output, list):
        parsed = []
        for item in raw_output:
            if isinstance(item, dict) and "label" in item and "score" in item:
                parsed.append(
                    Detection(label=str(item["label"]), score=float(item["score"]))
                )
        return parsed

    return []


def analyze_photo(image: Image.Image | None):
    if image is None:
        return (
            "### What I found\nUpload a photo to detect gear.",
            "### How to start\n- Add an image first, then click **Analyze photo**.",
            [],
        )

    try:
        classifier = get_classifier()
        raw_output = classifier(
            image,
            candidate_labels=AUDIO_GEAR_LABELS,
            hypothesis_template="This is a photo of {}.",
        )
        detections = _parse_model_output(raw_output)
        relevant_detections = select_relevant_detections(detections, max_items=6)

        detection_markdown = format_detection_markdown(relevant_detections)
        recommendations_markdown = format_recommendations_markdown(relevant_detections)
        confidence_rows = [
            [item.label, round(item.score, 4)] for item in relevant_detections
        ]
        return detection_markdown, recommendations_markdown, confidence_rows
    except Exception as exc:  # pragma: no cover - runtime environment issue
        return (
            "### What I found\nI hit an error while loading the model.",
            (
                "### How to start\n"
                "- Verify dependencies are installed (`pip install -r requirements.txt`).\n"
                "- Make sure you have internet access for first-time model download.\n"
                f"- Error detail: `{exc}`"
            ),
            [],
        )


def build_app() -> gr.Blocks:
    with gr.Blocks(title="Audio Gear Photo Starter") as app:
        gr.Markdown(
            "# Audio Gear Photo Starter\n"
            "Upload a studio or live-rig photo. "
            "The app estimates what gear appears in the shot and suggests practical next steps."
        )

        with gr.Row():
            with gr.Column(scale=1):
                image_input = gr.Image(type="pil", label="Upload a photo")
                analyze_button = gr.Button("Analyze photo", variant="primary")

            with gr.Column(scale=1):
                detection_output = gr.Markdown()
                recommendations_output = gr.Markdown()
                confidence_output = gr.Dataframe(
                    headers=["Detected gear", "Confidence"],
                    datatype=["str", "number"],
                    interactive=False,
                    row_count=(0, "dynamic"),
                    col_count=(2, "fixed"),
                )

        analyze_button.click(
            fn=analyze_photo,
            inputs=[image_input],
            outputs=[detection_output, recommendations_output, confidence_output],
        )

    return app


if __name__ == "__main__":
    build_app().launch()
