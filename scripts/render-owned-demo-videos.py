#!/usr/bin/env python3
"""Reproduce bounded fictional-demo MP4s from rights-checked project artwork.

The ledger is the edit list. This command never reads hosted content or fetches
third-party media. It preserves every source image and renders silent portrait
clips; six product diagrams contain only their exact product titles.
"""

import argparse
import concurrent.futures
import hashlib
import json
import pathlib
import subprocess
import tempfile


ROOT = pathlib.Path(__file__).resolve().parents[1]
LEDGER = ROOT / "docs/operations/S197-MOBILE-FALLBACK-ASSETS.json"
VIDEO_DIR = ROOT / "public/videos/demo"


def run(args: list[str]) -> str:
    result = subprocess.run(args, capture_output=True, text=True, check=False)
    if result.returncode:
        raise RuntimeError(f"{args[0]} failed: {result.stderr[-1000:]}")
    return result.stdout


def checked_image(ref: str, brief: str) -> pathlib.Path:
    if not ref.startswith("/uploads/seed/") or ".." in pathlib.PurePosixPath(ref).parts:
        raise ValueError(f"Unapproved demo image path: {ref}")
    source = ROOT / "public" / ref.lstrip("/")
    if not source.is_file():
        raise FileNotFoundError(source)
    rights = next((line for line in brief.splitlines() if f"`{ref}`" in line), "")
    if "illustrative demo artwork" not in rights or "| yes |" not in rights:
        raise ValueError(f"Missing demonstration rights record: {ref}")
    return source


def probe(path: pathlib.Path) -> tuple[int, float]:
    info = json.loads(run([
        "ffprobe", "-v", "error", "-show_entries",
        "format=duration,size:stream=codec_name,width,height,pix_fmt,codec_type",
        "-of", "json", str(path),
    ]))
    streams = info["streams"]
    if len(streams) != 1 or any((streams[0].get(key) != value for key, value in {
        "codec_name": "h264", "codec_type": "video", "width": 720,
        "height": 1280,
    }.items())) or streams[0].get("pix_fmt") not in ("yuv420p", "yuvj420p"):
        raise ValueError(f"Unexpected video stream: {path.name}: {streams}")
    return int(info["format"]["size"]), float(info["format"]["duration"])


def render(asset: dict, brief_text: str, verify_only: bool) -> dict:
    slug = asset["slug"]
    if not isinstance(slug, str) or not slug.startswith("business-") or len(slug) > 32 or not all(
        char.islower() or char.isdigit() or char == "-" for char in slug
    ):
        raise ValueError("Invalid static video slug")
    sources = [checked_image(ref, brief_text) for ref in asset["sourceImages"]]
    if len(sources) != (5 if asset["role"] == "story" else 1):
        raise ValueError(f"Wrong number of source images for {slug}")
    destination = VIDEO_DIR / f"{slug}.mp4"
    if not verify_only and not destination.exists():
        seconds = 2 if asset["role"] == "story" else 8
        clips = []
        for index in range(len(sources)):
            clips.append(
                f"[{index}:v]scale=700:700:force_original_aspect_ratio=increase:flags=lanczos,"
                "crop=700:700,zoompan=z='min(zoom+0.0005,1.08)':"
                "x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=680x680:fps=24,"
                f"trim=duration={seconds},fps=24,settb=AVTB,setpts=PTS-STARTPTS,format=yuv420p[p{index}]"
            )
        if len(sources) == 1:
            clips.append("[p0]split=2[fg][bgsource]")
        else:
            ordered = "".join(f"[p{index}]" for index in range(len(sources)))
            clips.append(f"{ordered}concat=n={len(sources)}:v=1:a=0,split=2[fg][bgsource]")
        clips.extend([
            "[bgsource]scale=720:1280:force_original_aspect_ratio=increase:flags=lanczos,"
            "crop=720:1280,boxblur=25:2,eq=brightness=-0.06[bg]",
            "[bg][fg]overlay=x=20:y=300:shortest=1,"
            "drawbox=x=20:y=300:w=680:h=680:color=white@0.6:t=2,format=yuv420p[out]",
        ])
        with tempfile.NamedTemporaryFile(dir=VIDEO_DIR, suffix=".mp4", delete=False) as temporary:
            temporary_path = pathlib.Path(temporary.name)
        try:
            command = ["ffmpeg", "-nostdin", "-hide_banner", "-loglevel", "error", "-y"]
            for source in sources:
                command.extend(["-loop", "1", "-framerate", "24", "-t", str(seconds), "-i", str(source)])
            command.extend([
                "-filter_complex", ";".join(clips), "-map", "[out]", "-an",
                "-c:v", "libx264", "-preset", "veryfast", "-crf", "25", "-r", "24",
                "-pix_fmt", "yuv420p", "-threads", "2", "-movflags", "+faststart",
                str(temporary_path),
            ])
            run(command)
            probe(temporary_path)
            temporary_path.replace(destination)
        finally:
            temporary_path.unlink(missing_ok=True)
    if not destination.is_file():
        raise FileNotFoundError(destination)
    size, duration = probe(destination)
    expected_duration = 10 if asset["role"] == "story" else 8
    if abs(duration - expected_duration) > 0.05 or size > 1_000_000:
        raise ValueError(f"Unexpected duration or size: {slug}")
    digest = hashlib.sha256(destination.read_bytes()).hexdigest()
    if asset.get("sha256") and asset["sha256"] != digest:
        raise ValueError(f"Asset hash changed: {slug}")
    if verify_only:
        run(["ffmpeg", "-nostdin", "-v", "error", "-i", str(destination), "-f", "null", "-"])
    return {**asset, "sha256": digest, "bytes": size, "durationSeconds": expected_duration,
            "codec": "h264", "width": 720, "height": 1280, "audio": False}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--verify", action="store_true", help="Validate rights, hashes and full decode without rendering")
    parser.add_argument("--jobs", type=int, default=2)
    args = parser.parse_args()
    if not 1 <= args.jobs <= 4:
        parser.error("--jobs must be 1 through 4")
    ledger = json.loads(LEDGER.read_text())
    if ledger.get("schemaVersion") != 1:
        raise ValueError("Unknown mobile-fallback asset ledger")
    jobs = []
    seen = set()
    for business in ledger["businesses"]:
        brief_path = ROOT / business["sourceBrief"]
        if not brief_path.is_file() or not str(brief_path.resolve()).startswith(str((ROOT / "showroom-projects").resolve())):
            raise ValueError("Missing business source brief")
        brief_text = brief_path.read_text()
        for asset in business["assets"]:
            if asset["slug"] in seen:
                raise ValueError("Duplicate static video slug")
            seen.add(asset["slug"])
            jobs.append((business, asset, brief_text))
    pool = concurrent.futures.ThreadPoolExecutor(max_workers=args.jobs)
    futures = {pool.submit(render, asset, brief, args.verify): (business, asset)
               for business, asset, brief in jobs}
    updates = {}
    try:
        for future in concurrent.futures.as_completed(futures):
            business, asset = futures[future]
            result = future.result()
            updates[result["slug"]] = result
            print(f"{business['id']} {result['slug']} {result['bytes']} bytes", flush=True)
    except BaseException:
        for future in futures:
            future.cancel()
        pool.shutdown(wait=True, cancel_futures=True)
        raise
    else:
        pool.shutdown(wait=True)
    if not args.verify:
        for business in ledger["businesses"]:
            business["assets"] = [updates[asset["slug"]] for asset in business["assets"]]
        LEDGER.write_text(json.dumps(ledger, indent=2, ensure_ascii=False) + "\n")
    print(f"Validated {len(jobs)} exact demo assets ({sum(item['bytes'] for item in updates.values())} bytes).")


if __name__ == "__main__":
    main()
