"""Helpers for mapping image detections to starter audio guidance."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable, Sequence


AUDIO_GEAR_LABELS = [
    "studio microphone",
    "usb microphone",
    "audio interface",
    "mixing console",
    "studio monitor speaker",
    "studio headphones",
    "midi keyboard",
    "synthesizer",
    "drum machine",
    "sampler",
    "guitar effects pedal",
    "dj controller",
    "turntable",
    "field recorder",
    "shotgun microphone",
    "rackmount preamp",
    "rackmount compressor",
    "podcast setup",
    "pa speaker",
    "microphone stand",
]


STARTER_ACTIONS = {
    "studio microphone": [
        "Start by setting input gain so peaks sit around -12 dB in your DAW.",
        "Use a pop filter and keep your mouth 4-8 inches from the mic.",
    ],
    "usb microphone": [
        "Use 24-bit recording in your recording app and disable auto gain.",
        "Record in a closet or soft room first; room treatment matters more than plug-ins.",
    ],
    "audio interface": [
        "Create one template session with armed tracks so setup is repeatable.",
        "Turn direct monitoring on when tracking to reduce latency.",
    ],
    "mixing console": [
        "Label channels and set gain staging before touching EQ or compression.",
        "Build a simple signal flow map: source -> preamp -> fader -> main out.",
    ],
    "studio monitor speaker": [
        "Place monitors at ear height in an equilateral triangle with your listening spot.",
        "Begin mixing quietly; low volume helps you hear balance decisions.",
    ],
    "studio headphones": [
        "Use headphones for detail checks and confirm final balance on speakers.",
        "Avoid long loud sessions; ear fatigue causes bad mix decisions.",
    ],
    "midi keyboard": [
        "Map transport controls and modulation wheel in your DAW once, then save the profile.",
        "Start with one piano patch and one synth patch to focus on arrangement basics.",
    ],
    "synthesizer": [
        "Learn one subtractive patch workflow: oscillator -> filter -> envelope.",
        "Record dry first, then add reverb and delay in your DAW to keep flexibility.",
    ],
    "drum machine": [
        "Program a simple 8-bar loop and vary only one element each pass.",
        "Keep kick and bass from masking each other by selecting complementary sounds.",
    ],
    "sampler": [
        "Trim sample starts/ends tightly and normalize gain before sequencing.",
        "Pitch and filter a single sample multiple ways to build cohesive kits quickly.",
    ],
    "guitar effects pedal": [
        "Set one pedal at unity gain first so A/B comparisons stay honest.",
        "Use less drive than you think; stacking mild stages often sounds clearer.",
    ],
    "dj controller": [
        "Set cue gain and channel trims first, then practice clean transitions at matched BPM.",
        "Record every practice session and review phrase timing.",
    ],
    "turntable": [
        "Check stylus condition and tracking force before recording vinyl.",
        "If digitizing records, capture flat first and apply cleanup in software later.",
    ],
    "field recorder": [
        "Enable limiter or dual recording if available for safer outdoor capture.",
        "Monitor with closed-back headphones to catch wind and cable noise early.",
    ],
    "shotgun microphone": [
        "Aim the mic carefully; off-axis changes can make dialog dull quickly.",
        "Use a windscreen outdoors even with light wind.",
    ],
    "rackmount preamp": [
        "Use preamp gain for tone and interface input for level balancing.",
        "Document favorite settings per source so future sessions start faster.",
    ],
    "rackmount compressor": [
        "Start around 2:1 ratio, medium attack/release, and adjust by ear.",
        "Compress while tracking only when you are sure of the sound.",
    ],
    "podcast setup": [
        "Record each speaker to a separate track for easier cleanup.",
        "Create a fixed intro chain: high-pass -> gentle compression -> limiter.",
    ],
    "pa speaker": [
        "Before events, ring out feedback with narrow EQ cuts at problem frequencies.",
        "Keep vocal mics behind mains whenever possible to reduce feedback risk.",
    ],
    "microphone stand": [
        "Position the stand before setting gain so talent can stay consistent.",
        "Use cable slack and clips to avoid handling noise from floor vibration.",
    ],
}


CORE_STARTER_STEPS = [
    "Pick one DAW (Reaper, GarageBand, Ableton, Logic, etc.) and stick with it for 30 days.",
    "Create a repeatable signal chain and save it as a session template.",
    "Finish short 60-90 second projects before starting larger ones.",
]


CONFIDENCE_THRESHOLD = 0.18


@dataclass(frozen=True)
class Detection:
    label: str
    score: float


def _normalize(label: str) -> str:
    return label.strip().lower()


def select_relevant_detections(
    detections: Sequence[Detection],
    threshold: float = CONFIDENCE_THRESHOLD,
    max_items: int = 5,
) -> list[Detection]:
    ordered = sorted(detections, key=lambda item: item.score, reverse=True)
    above_threshold = [item for item in ordered if item.score >= threshold]
    if above_threshold:
        return above_threshold[:max_items]
    return ordered[:1]


def starter_recommendations(labels: Iterable[str], max_items: int = 8) -> list[str]:
    unique_labels = []
    seen_labels = set()
    for label in labels:
        normalized = _normalize(label)
        if normalized and normalized not in seen_labels:
            unique_labels.append(normalized)
            seen_labels.add(normalized)

    recommendations = []
    for label in unique_labels:
        recommendations.extend(STARTER_ACTIONS.get(label, []))
    recommendations.extend(CORE_STARTER_STEPS)

    unique_recommendations = []
    seen_recommendations = set()
    for item in recommendations:
        if item not in seen_recommendations:
            unique_recommendations.append(item)
            seen_recommendations.add(item)
    return unique_recommendations[:max_items]


def format_detection_markdown(detections: Sequence[Detection]) -> str:
    if not detections:
        return "### What I found\nI could not classify this image yet."

    lines = ["### What I found"]
    for item in detections:
        lines.append(f"- **{item.label}** ({item.score:.0%} confidence)")
    return "\n".join(lines)


def format_recommendations_markdown(detections: Sequence[Detection]) -> str:
    labels = [item.label for item in detections]
    recommendations = starter_recommendations(labels=labels)

    lines = ["### How to start"]
    for step in recommendations:
        lines.append(f"- {step}")
    return "\n".join(lines)
