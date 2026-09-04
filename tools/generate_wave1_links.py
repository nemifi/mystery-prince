#!/usr/bin/env python3
from __future__ import annotations

import argparse
import csv
import io
import random
from pathlib import Path
from urllib.parse import urlencode


def assignments(count: int, seed: int) -> list[tuple[str, str]]:
    if count < 2:
        raise ValueError("count must be >= 2")
    orders = ["AB"] * (count // 2) + ["BA"] * (count // 2)
    if count % 2:
        orders.append("AB" if seed % 2 == 0 else "BA")
    random.Random(seed).shuffle(orders)
    return [(f"P{i:03d}", order) for i, order in enumerate(orders, 1)]


def make_url(base: str, pid: str, order: str, reset: bool = False) -> str:
    base = base.rstrip("/") + "/"
    params = {"pid": pid, "order": order}
    if reset:
        params["reset"] = "1"
    return f"{base}?{urlencode(params)}"


def render_csv(base: str, count: int, seed: int) -> str:
    out = io.StringIO()
    writer = csv.writer(out)
    writer.writerow(["participant_id", "order", "url", "reset_url"])
    for pid, order in assignments(count, seed):
        writer.writerow([pid, order, make_url(base, pid, order), make_url(base, pid, order, True)])
    return out.getvalue()


def self_test() -> None:
    rows = assignments(20, 20260904)
    assert len(rows) == 20
    assert sum(order == "AB" for _, order in rows) == 10
    assert sum(order == "BA" for _, order in rows) == 10
    text = render_csv("https://example.test/mp", 4, 1)
    assert "participant_id,order,url,reset_url" in text
    assert "pid=P001" in text and "reset=1" in text
    print("OK Wave 1 link generator self-test")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--base-url", default="https://nemifi.github.io/mystery-prince/")
    parser.add_argument("--count", type=int, default=20)
    parser.add_argument("--seed", type=int, default=20260904)
    parser.add_argument("--output", type=Path)
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()

    if args.self_test:
        self_test()
        return

    text = render_csv(args.base_url, args.count, args.seed)
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(text, encoding="utf-8")
        print(f"WROTE {args.output}")
    else:
        print(text, end="")


if __name__ == "__main__":
    main()
