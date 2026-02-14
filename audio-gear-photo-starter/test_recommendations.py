"""Unit tests for recommendation helpers."""

import unittest

from recommendations import (
    Detection,
    format_detection_markdown,
    select_relevant_detections,
    starter_recommendations,
)


class RecommendationTests(unittest.TestCase):
    def test_select_relevant_detections_uses_threshold(self):
        detections = [
            Detection(label="audio interface", score=0.82),
            Detection(label="studio monitor speaker", score=0.48),
            Detection(label="drum machine", score=0.07),
        ]

        selected = select_relevant_detections(detections, threshold=0.2, max_items=5)
        self.assertEqual([item.label for item in selected], ["audio interface", "studio monitor speaker"])

    def test_select_relevant_detections_falls_back_to_top_hit(self):
        detections = [
            Detection(label="drum machine", score=0.10),
            Detection(label="sampler", score=0.08),
        ]

        selected = select_relevant_detections(detections, threshold=0.5, max_items=5)
        self.assertEqual(len(selected), 1)
        self.assertEqual(selected[0].label, "drum machine")

    def test_recommendations_include_core_steps(self):
        tips = starter_recommendations(labels=["audio interface"], max_items=10)
        self.assertTrue(any("Pick one DAW" in step for step in tips))
        self.assertTrue(any("direct monitoring" in step for step in tips))

    def test_detection_markdown_has_confidence(self):
        markdown = format_detection_markdown(
            [Detection(label="audio interface", score=0.625)]
        )
        self.assertIn("audio interface", markdown)
        self.assertIn("62%", markdown)


if __name__ == "__main__":
    unittest.main()
