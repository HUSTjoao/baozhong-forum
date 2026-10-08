"""Extract intact stroke contours from our licensed Noto Serif SC title subset.

Run with Python and fontTools after replacing the title font. The two glyphs in
this font each contain ten filled contours, corresponding to their ten strokes.
The browser uses the generated paths; fontTools is not a runtime dependency.
"""
import json
from pathlib import Path

from fontTools.pens.recordingPen import RecordingPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.ttLib import TTFont

root = Path(__file__).resolve().parents[1]
font = TTFont(root / "public/fonts/baozhong-title.ttf")
glyph_set = font.getGlyphSet()
cmap = font.getBestCmap()
strokes = []

for letter, character in enumerate("高校"):
    name = cmap[ord(character)]
    recording = RecordingPen()
    glyph_set[name].draw(recording)
    contour = []
    contours = []
    for operation, operands in recording.value:
        contour.append((operation, operands))
        if operation == "closePath":
            contours.append(contour)
            contour = []
    assert len(contours) == 10, f"Expected ten stroke contours in {character}"
    for index, commands in enumerate(contours):
        pen = SVGPathPen(glyph_set)
        points = []
        for operation, operands in commands:
            getattr(pen, operation)(*operands)
            points.extend(point for point in operands if point is not None)
        xs, ys = zip(*points)
        strokes.append({
            "id": f"{letter}-{index}",
            "letter": letter,
            "path": pen.getCommands(),
            "cx": (min(xs) + max(xs)) / 2,
            "cy": (min(ys) + max(ys)) / 2,
        })

output = root / "data/college-strokes.json"
output.write_text(json.dumps(strokes, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"Generated {len(strokes)} intact stroke paths")
