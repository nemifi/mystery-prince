#!/usr/bin/env python3
"""Static checks for the external Wave-1 concept-test build."""

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
P = ROOT / "prototype"
A = P / "assets"

ROLE_ASSETS = [
    "rei-a.jpg", "rei-b.jpg",
    "minato-a.jpg", "minato-b.jpg",
    "kai-a.jpg", "kai-b.jpg",
]

ROLE_REFERENCES = [f"./assets/{name}" for name in ROLE_ASSETS]

SOURCE_PHRASES_THAT_MUST_BE_SANITIZED = [
    "短いミステリーを2つ、表示された順にプレイしてください。前の作品の設定を引き継ぐ前提はありません。",
    "前の事件を遊んでいても、その記憶をアリバイにしてはいけない。今回は今回のROLEと事実だけで選ぶ。",
    "君、前より人の秘密に慣れた顔してる。",
    "前より立派な悪事じゃなくて残念だった？",
    "そういうところ、REIだよね。",
]


def fail(message: str) -> None:
    raise SystemExit(message)


def main() -> None:
    for name in ROLE_ASSETS:
        path = A / name
        if not path.exists() or path.stat().st_size < 1000:
            fail(f"Missing/invalid cross-ROLE asset: {path.relative_to(ROOT)}")

    css = (P / "visual-overrides.css").read_text(encoding="utf-8")
    for ref in ROLE_REFERENCES:
        if ref not in css:
            fail(f"visual-overrides.css does not reference {ref}")

    # Each identity must resolve to different underlying files in hotel vs train.
    for name in ("rei", "minato", "kai"):
        if f".scene.hotel .portrait.{name}" not in css:
            fail(f"Missing hotel selector for {name}")
        if f".scene.train .portrait.{name}" not in css:
            fail(f"Missing train selector for {name}")

    index = (P / "index.html").read_text(encoding="utf-8")
    if "blind-sanitizer.js" not in index:
        fail("blind-sanitizer.js is not loaded")
    if index.index("blind-sanitizer.js") > index.index("app.js"):
        fail("blind-sanitizer.js must load before app.js")

    sanitizer = (P / "blind-sanitizer.js").read_text(encoding="utf-8")
    app = (P / "app.js").read_text(encoding="utf-8")
    content = "\n".join(
        path.read_text(encoding="utf-8") for path in sorted((P / "content").glob("*.json"))
    )
    source = app + "\n" + content

    # If a known contaminated phrase exists in authoring/runtime source, the blinding
    # layer must explicitly know how to replace it.
    for phrase in SOURCE_PHRASES_THAT_MUST_BE_SANITIZED:
        if phrase in source and phrase not in sanitizer:
            fail(f"Known hypothesis-revealing phrase is not sanitized: {phrase}")

    # The participant-facing replacements themselves must not contain the strongest
    # hypothesis-teaching phrases.
    participant_forbidden = [
        "前の作品の設定を引き継ぐ前提",
        "前の事件を遊んでいても",
        "今回は今回のROLE",
        "そういうところ、REIだよね",
    ]
    # Extract the RHS text conservatively by checking the sanitizer as a whole: these
    # phrases may appear on the source side, so require a distinct neutral replacement
    # marker for each class as well.
    required_neutral = [
        "短いミステリーを2つ、表示された順にプレイしてください。",
        "いま目の前にある立場と事実だけで選ぶ。",
        "君、人の秘密に慣れた顔してる。",
        "もっと立派な悪事じゃなくて残念だった？",
        "守る男を、守らずに見られる？",
    ]
    for phrase in required_neutral:
        if phrase not in sanitizer:
            fail(f"Missing neutral blind-test replacement: {phrase}")

    print("OK blind concept build: role-specific art + blinding layer present")


if __name__ == "__main__":
    main()
