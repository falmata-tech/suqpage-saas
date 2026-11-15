#!/usr/bin/env python3
"""Regenerate the bounded demo video allowlist from reviewed asset ledgers."""

import hashlib
import json
import pathlib
import re


ROOT = pathlib.Path(__file__).resolve().parents[1]
ORIGINAL = ROOT / "docs/operations/S197-DEMO-VIDEO-ASSETS.json"
MOBILE = ROOT / "docs/operations/S197-MOBILE-FALLBACK-ASSETS.json"
CATALOG = ROOT / "lib/video/demo-video-catalog.ts"


def main() -> None:
    original = json.loads(ORIGINAL.read_text())
    mobile = json.loads(MOBILE.read_text())
    if original.get("schemaVersion") != 1 or mobile.get("schemaVersion") != 1:
        raise ValueError("Unexpected demo video ledger schema")
    if len(original["assets"]) != 20 or len(mobile["businesses"]) != 50:
        raise ValueError("Demo video ledger scope changed")
    entries = [(item["businessId"], item) for item in original["assets"]]
    for business in mobile["businesses"]:
        if business["id"] == 21 or len(business["assets"]) != 5:
            raise ValueError("Unexpected mobile replacement scope")
        entries.extend((business["id"], item) for item in business["assets"])
    if len(entries) != 270:
        raise ValueError("Expected 20 existing and 250 replacement video assets")
    seen = set()
    lines = [
        "/** Reviewed first-party examples; each ref is bound to one fictional business. */",
        'export const DEMO_VIDEO_ASSETS: Record<string, {businessId:number;status:"approved"|"preview_only";sha256:string}> = {',
    ]
    for business_id, item in sorted(entries, key=lambda entry: entry[1]["slug"]):
        slug, digest = item["slug"], item["sha256"]
        if slug in seen or not re.fullmatch(r"[a-z0-9](?:[a-z0-9-]{0,30}[a-z0-9])?", slug):
            raise ValueError(f"Invalid or duplicate asset slug: {slug}")
        if not re.fullmatch(r"[a-f0-9]{64}", digest):
            raise ValueError(f"Missing asset digest: {slug}")
        seen.add(slug)
        video = ROOT / "public/videos/demo" / f"{slug}.mp4"
        data = video.read_bytes()
        if len(data) != item["bytes"] or hashlib.sha256(data).hexdigest() != digest:
            raise ValueError(f"Asset bytes or digest changed: {slug}")
        lines.append(f'  "{slug}": {{businessId:{business_id},status:"approved",sha256:"{digest}"}},')
    lines.extend([
        "};", "",
        "export function approvedDemoVideo(ref: string, businessId: number): boolean {",
        '  if (!/^demo:[a-z0-9](?:[a-z0-9-]{0,30}[a-z0-9])?$/.test(ref)) return false;',
        "  const asset=DEMO_VIDEO_ASSETS[ref.slice(5)];",
        '  return asset?.status==="approved" && asset.businessId===businessId;',
        "}", "",
    ])
    CATALOG.write_text("\n".join(lines))
    print(f"Cataloged {len(entries)} exact first-party MP4s.")


if __name__ == "__main__":
    main()
