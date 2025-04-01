# The following unit test file was generated using ChatGPT o3-mini-high, which does exceptionally well with thinking
# about what cases are worth testing and which might legitimately fail.

import os
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import MagicMock, patch

# Add project root to sys.path so that the blogman package is found.
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from blogman.FileManager import FileManager  # Adjust import as needed.


# A simple dummy event class to simulate watchdog events.
class DummyEvent:
    def __init__(self, src_path):
        self.src_path = src_path


class TestFileManager(unittest.TestCase):
    def setUp(self):
        # Create temporary directories for markdown and html files.
        self.temp_md_dir = tempfile.TemporaryDirectory()
        self.temp_html_dir = tempfile.TemporaryDirectory()
        # Create a temporary file path for the homepage HTML (it need not exist)
        self.temp_home_html_file = Path(tempfile.NamedTemporaryFile(delete=False).name)

        self.md_dir = Path(self.temp_md_dir.name)
        self.html_dir = Path(self.temp_html_dir.name)

        # Instantiate FileManager.
        self.fm = FileManager(self.md_dir, self.html_dir, self.temp_home_html_file)
        # Replace the builders with mocks so we can assert calls.
        self.fm.blog_builder = MagicMock()
        self.fm.homepage_builder = MagicMock()

    def tearDown(self):
        self.temp_md_dir.cleanup()
        self.temp_html_dir.cleanup()
        try:
            os.unlink(self.temp_home_html_file)
        except Exception:
            pass

    def test_get_html_file_exists(self):
        # Create a dummy markdown file.
        md_file = self.md_dir / "test file.md"
        md_file.write_text("# Test")
        # Create the corresponding HTML file.
        html_file = self.html_dir / "test-file.html"
        html_file.write_text("<h1>Test</h1>")

        result = self.fm._get_html_file(md_file)
        self.assertEqual(result, html_file)

    def test_get_html_file_not_exists(self):
        # Create a dummy markdown file without a corresponding HTML file.
        md_file = self.md_dir / "nonexistent.md"
        md_file.write_text("# Test")
        result = self.fm._get_html_file(md_file)
        self.assertIsNone(result)

    def test_on_created_md_file(self):
        # Create a dummy markdown file that exists.
        md_file = self.md_dir / "new.md"
        md_file.write_text("# New")
        event = DummyEvent(str(md_file))

        self.fm.on_created(event)
        # Verify that build_blog was called with the markdown file.
        self.fm.blog_builder.build_blog.assert_called_once_with(md_file)

    def test_on_created_html_file(self):
        # Create a dummy html file (name is not "home").
        html_file = self.html_dir / "other.html"
        html_file.write_text("<h1>Other</h1>")
        event = DummyEvent(str(html_file))

        self.fm.on_created(event)
        # Verify that homepage_builder.build was called.
        self.fm.homepage_builder.build.assert_called_once()

    def test_on_created_nonexistent_file(self):
        # Provide an event for a file that doesn't exist.
        fake_path = self.md_dir / "fake.md"
        event = DummyEvent(str(fake_path))
        self.fm.on_created(event)
        # Neither builder should be called.
        self.fm.blog_builder.build_blog.assert_not_called()
        self.fm.homepage_builder.build.assert_not_called()

    def test_on_created_tilde_file(self):
        # Create a file whose suffix ends with "~" (temporary file).
        tmp_file = self.md_dir / "temp.md~"
        tmp_file.write_text("Temporary")
        event = DummyEvent(str(tmp_file))
        self.fm.on_created(event)
        self.fm.blog_builder.build_blog.assert_not_called()
        self.fm.homepage_builder.build.assert_not_called()

    def test_on_modified_md_file(self):
        # Create a dummy markdown file that exists.
        md_file = self.md_dir / "modify.md"
        md_file.write_text("# Modify")
        event = DummyEvent(str(md_file))
        self.fm.on_modified(event)
        # Verify that build_blog is called.
        self.fm.blog_builder.build_blog.assert_called_once_with(md_file)

    def test_on_modified_nonexistent_file(self):
        fake_path = self.md_dir / "nonexistent.md"
        event = DummyEvent(str(fake_path))
        self.fm.on_modified(event)
        self.fm.blog_builder.build_blog.assert_not_called()

    def test_on_modified_tilde_file(self):
        tmp_file = self.md_dir / "temp.md~"
        tmp_file.write_text("Temp")
        event = DummyEvent(str(tmp_file))
        self.fm.on_modified(event)
        self.fm.blog_builder.build_blog.assert_not_called()

    def test_on_deleted_md_file_existing_html(self):
        # Create a dummy markdown file and its corresponding HTML file.
        md_file = self.md_dir / "delete.md"
        md_file.write_text("# Delete")
        html_file = self.html_dir / "delete.html"
        html_file.write_text("<h1>Delete</h1>")
        event = DummyEvent(str(md_file))

        # Patch os.remove to record the call.
        with patch("os.remove") as mock_remove:
            self.fm.on_deleted(event)
            mock_remove.assert_called_once_with(html_file)

    def test_on_deleted_md_file_nonexistent_html(self):
        # Create a dummy markdown file without a corresponding HTML file.
        md_file = self.md_dir / "nodelete.md"
        md_file.write_text("# Nodelete")
        event = DummyEvent(str(md_file))
        with self.assertRaises(FileNotFoundError):
            self.fm.on_deleted(event)

    def test_on_deleted_html_file(self):
        # Create a dummy html file event.
        html_file = self.html_dir / "remove.html"
        html_file.write_text("<h1>Remove</h1>")
        event = DummyEvent(str(html_file))
        self.fm.on_deleted(event)
        self.fm.homepage_builder.build.assert_called_once()

    def test_on_deleted_tilde_file(self):
        # Create a file with a tilde; nothing should happen.
        tmp_file = self.md_dir / "temp.md~"
        tmp_file.write_text("Temp")
        event = DummyEvent(str(tmp_file))
        self.fm.on_deleted(event)
        self.fm.homepage_builder.build.assert_not_called()


if __name__ == "__main__":
    unittest.main()
