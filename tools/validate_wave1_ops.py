#!/usr/bin/env python3
from __future__ import annotations

import csv
from pathlib import Path
from urllib.parse import parse_qs, urlparse

ROOT = Path(__file__).resolve().parents[1]
CSV_PATH = ROOT / "ops" / "wave1-participant-links.csv"


def fail(message: str) -> None:
    raise SystemExit(message)


def params(url: str) -> dict[str, list[str]]:
    return parse_qs(urlparse(url).query)


def main() -> None:
    rows = list(csv.DictReader(CSV_PATH.read_text(encoding="utf-8").splitlines()))
    if len(rows) != 20:
        fail(f"Expected 20 Wave 1 allocations, got {len(rows)}")

    ids = [row["participant_id"] for row in rows]
    if ids != [f"P{i:03d}" for i in range(1, 21)]:
        fail("Wave 1 IDs must be exactly P001..P020 in order")

    orders = [row["order"] for row in rows]
    if orders.count("AB") != 10 or orders.count("BA") != 10:
        fail(f"Wave 1 order split must be 10/10, got AB={orders.count('AB')} BA={orders.count('BA')}")

    for row in rows:
        pid, order = row["participant_id"], row["order"]
        q = params(row["url"])
        rq = params(row["reset_url"])
        if q.get("pid") != [pid] or q.get("order") != [order]:
            fail(f"Bad participant URL for {pid}")
        if rq.get("pid") != [pid] or rq.get("order") != [order] or rq.get("reset") != ["1"]:
            fail(f"Bad reset URL for {pid}")
        if row.get("status") not in {"PENDING_PAGES_ENABLEMENT", "READY"}:
            fail(f"Unknown Wave 1 link status for {pid}: {row.get('status')}")

    print("OK Wave 1 operations: 20 participant IDs, exact 10 AB / 10 BA, URLs consistent")


if __name__ == "__main__":
    main()
