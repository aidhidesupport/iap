#!/usr/bin/env python3
"""Exercise release reproducibility and failures in temporary directories."""
import importlib.util
import io
import json
from pathlib import Path
import shutil
import tarfile
import tempfile
import unittest

SPEC = importlib.util.spec_from_file_location(
    "package_codex", Path(__file__).with_name("package-codex.py")
)
pack = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(pack)


class PackagingTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name).resolve()
        self.source = self.root / "codex"
        shutil.copytree(pack.ROOT / "codex", self.source)

    def test_reproduces_published_bytes_and_manifest(self):
        name, data, checksum = pack.build(self.source)
        pack.check(pack.ROOT, name, data, checksum)
        self.assertEqual(pack.build(self.source), (name, data, checksum))
        with tarfile.open(fileobj=io.BytesIO(data), mode="r:gz") as archive:
            manifest = json.load(archive.extractfile(name + "/MANIFEST.json"))
            self.assertEqual(len(archive.getmembers()), len(manifest["files"]) + 1)
            for item in manifest["files"]:
                payload = archive.extractfile(name + "/" + item["path"]).read()
                self.assertEqual(pack.hashlib.sha256(payload).hexdigest(), item["sha256"])

    def test_changed_source_does_not_pass_as_existing_release(self):
        with (self.source / "checkpoint.mjs").open("a") as stream:
            stream.write("\n// Changed source must not pass as the published version.\n")
        with self.assertRaisesRegex(ValueError, "source and published file differ"):
            pack.check(pack.ROOT, *pack.build(self.source))

    def test_website_copy_is_also_checked(self):
        name, data, checksum = pack.build(self.source)
        for directory in (self.root, self.root / "website/public/downloads"):
            pack.write_release(directory, name, data, checksum)
        (self.root / "website/public/downloads" / (name + ".tar.gz")).write_bytes(b"damaged")
        with self.assertRaisesRegex(ValueError, "source and published file differ"):
            pack.check(self.root, name, data, checksum)

    def test_generated_state_and_unlisted_files_are_excluded(self):
        expected = pack.build(self.source)
        (self.source / "example/.iap/private-record.json").write_text('{"private":"synthetic"}')
        (self.source / ".env").write_text("SYNTHETIC_VALUE=not-a-secret\n")
        self.assertEqual(pack.build(self.source), expected)

    def test_refuses_overwrite_without_changing_existing_files(self):
        name, data, checksum = pack.build(self.source)
        output = self.root / "release"
        pack.write_release(output, name, data, checksum)
        pack.write_release(output, name, data, checksum)
        with self.assertRaisesRegex(ValueError, "refusing to replace"):
            pack.write_release(output, name, data + b"changed", checksum)
        self.assertEqual((output / (name + ".tar.gz")).read_bytes(), data)
        self.assertEqual((output / (name + ".sha256")).read_bytes(), checksum)

    def test_symlink_is_not_packaged(self):
        path = self.source / "example/artifact.txt"
        path.unlink()
        target = self.root / "outside.txt"
        target.write_text("outside fixture")
        path.symlink_to(target)
        with self.assertRaisesRegex(ValueError, "symlink"):
            pack.build(self.source)

    def test_new_version_can_be_written_separately(self):
        path = self.source / "package.json"
        package = json.loads(path.read_text())
        package["version"] = "0.2.7"
        path.write_text(json.dumps(package, indent=2) + "\n")
        name, data, checksum = pack.build(self.source)
        self.assertEqual(name, "iap-codex-0.2.7")
        output = self.root / "new-release"
        pack.write_release(output, name, data, checksum)
        self.assertEqual((output / (name + ".tar.gz")).read_bytes(), data)


if __name__ == "__main__":
    unittest.main()
