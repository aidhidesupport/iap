#!/usr/bin/env python3
"""Reproduce the public distribution from codex/ without overwriting a release."""
import argparse
import gzip
import hashlib
import io
import json
from pathlib import Path
import re
import sys
import tarfile

ROOT = Path(__file__).resolve().parents[1]
FILES = (
    "checkpoint.mjs", "local-files.mjs", "manage.mjs", "pilot.mjs",
    "checkpoint.test.mjs", "manage.test.mjs", "pilot.test.mjs",
    "LICENSE", "NOTICE", "README.md", "PM_GUIDE.md", "STATUS.md",
    "PILOT_RUNBOOK.md", "package.json", "example/artifact.txt",
    "example/.iap/contract.json", "example/.iap/assessment.json",
    "example/paired-session.md", "example/pilot-measurements.json",
)


def build(source):
    """Only the explicit public file list is eligible for packaging."""
    source = Path(source)
    contents = {}
    for relative in FILES:
        path = source / relative
        if any(parent.is_symlink() for parent in [path, *path.parents]):
            raise ValueError("symlink in distribution source: " + relative)
        contents[relative] = path.read_bytes()
    version = json.loads(contents["package.json"])["version"]
    if not isinstance(version, str) or not re.fullmatch(
        r"[0-9]+\.[0-9]+\.[0-9]+(?:-[0-9A-Za-z.-]+)?", version
    ):
        raise ValueError("invalid distribution version")
    name = "iap-codex-" + version
    manifest = {
        "format": "iap-distribution/1",
        "version": version,
        "files": [
            {"path": path, "sha256": hashlib.sha256(data).hexdigest(), "bytes": len(data)}
            for path, data in sorted(contents.items())
        ],
    }
    contents["MANIFEST.json"] = (
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n"
    ).encode()
    buffer = io.BytesIO()
    with gzip.GzipFile(fileobj=buffer, mode="wb", mtime=0, filename="") as gz:
        with tarfile.open(fileobj=gz, mode="w") as archive:
            for path, data in sorted(contents.items()):
                item = tarfile.TarInfo(name + "/" + path)
                item.size = len(data)
                item.mode = 0o644
                item.mtime = 0
                archive.addfile(item, io.BytesIO(data))
    data = buffer.getvalue()
    checksum = (hashlib.sha256(data).hexdigest() + "  " + name + ".tar.gz\n").encode()
    return name, data, checksum


def check(root, name, data, checksum):
    for directory in (Path(root), Path(root) / "website/public/downloads"):
        for suffix, expected in ((".tar.gz", data), (".sha256", checksum)):
            path = directory / (name + suffix)
            if path.read_bytes() != expected:
                raise ValueError(
                    "source and published file differ: " + str(path)
                    + "; retain the published release and prepare a new version"
                )


def write_release(output, name, data, checksum):
    output = Path(output)
    targets = [(output / (name + ".tar.gz"), data),
               (output / (name + ".sha256"), checksum)]
    # Validate both existing files before writing either one.
    for path, expected in targets:
        if path.is_symlink() or (path.exists() and path.read_bytes() != expected):
            raise ValueError("refusing to replace an existing release file: " + str(path))
    output.mkdir(parents=True, exist_ok=True)
    for path, expected in targets:
        if path.exists():
            continue
        with path.open("xb") as stream:
            stream.write(expected)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, default=ROOT / "codex")
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--check", action="store_true", help="compare with both published copies (default)")
    mode.add_argument("--output", type=Path, help="write an archive and checksum to this directory")
    args = parser.parse_args()
    try:
        name, data, checksum = build(args.source)
        if args.output:
            write_release(args.output, name, data, checksum)
        else:
            check(ROOT, name, data, checksum)
    except (OSError, ValueError, KeyError) as error:
        parser.exit(1, str(error) + "\n")
    print(json.dumps({
        "mode": "write" if args.output else "check",
        "archive": name + ".tar.gz", "files": len(FILES) + 1,
        "bytes": len(data), "sha256": hashlib.sha256(data).hexdigest(),
    }))


if __name__ == "__main__":
    main()
