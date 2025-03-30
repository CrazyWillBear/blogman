# The following code was generated by ChatGPT o3-mini-high in order
# to increase my efficiency and progress in regard to blogman's code:
# automating unit tests in this way is very helpful.

import unittest
import tempfile
from pathlib import Path
from unittest.mock import MagicMock, patch
from watchdog.events import FileCreatedEvent, FileModifiedEvent, FileDeletedEvent

# Import the FileManager class
from blogman.FileManager import FileManager

class TestFileManager(unittest.TestCase):
    def setUp(self):
        # Create temporary directories for markdown and HTML files.
        self.temp_md_dir = tempfile.TemporaryDirectory()
        self.temp_html_dir = tempfile.TemporaryDirectory()
        self.md_dir = Path(self.temp_md_dir.name)
        self.html_dir = Path(self.temp_html_dir.name)

        # Create dummy template files and homepage paths.
        self.home_template_path = self.md_dir / "home_template.html"
        self.home_template_path.write_text("<html><body>{content}</body></html>")

        self.blog_template_path = self.md_dir / "blog_template.html"
        self.blog_template_path.write_text("<html><body>{post}</body></html>")

        self.home_html_path = self.html_dir / "index.html"
        self.home_html_path.write_text("<html><body>Home</body></html>")

        self.home_md_path = self.md_dir / "index.md"
        self.home_md_path.write_text("# Home")

        # Initialize FileManager.
        self.fm = FileManager(
            md_dir=self.md_dir,
            html_dir=self.html_dir,
            home_template_path=self.home_template_path,
            blog_template_path=self.blog_template_path,
            home_html_path=self.home_html_path,
            home_md_path=self.home_md_path
        )

        # Replace the converter and builder with mocks.
        self.fm.converter = MagicMock()
        self.fm.builder = MagicMock()

    def tearDown(self):
        self.temp_md_dir.cleanup()
        self.temp_html_dir.cleanup()

    def test_get_html_file_exists(self):
        # Create a markdown file and its corresponding HTML file.
        md_file = self.md_dir / "test file.md"
        md_file.write_text("content")
        expected_html = self.html_dir / "test-file.html"
        expected_html.write_text("html content")

        result = self.fm._get_html_file(md_file)
        self.assertEqual(result, expected_html)

    def test_get_html_file_not_exists(self):
        # Markdown file exists but no corresponding HTML file.
        md_file = self.md_dir / "nonexistent.md"
        md_file.write_text("content")
        result = self.fm._get_html_file(md_file)
        self.assertIsNone(result)

    def test_format_html_file_existing(self):
        # Create an unformatted HTML file.
        html_file = self.html_dir / "sample.html"
        unformatted_html = "<html><body><p>Test</p></body></html>"
        html_file.write_text(unformatted_html)

        # Call the static method to format the file.
        FileManager._format_html_file(html_file)

        # Read back the file and check that it was prettified (e.g., it now includes newlines/indentation).
        formatted_html = html_file.read_text()
        self.assertNotEqual(formatted_html, unformatted_html)
        self.assertIn("<html>", formatted_html)
        self.assertIn("<body>", formatted_html)

    def test_format_html_file_non_existing(self):
        # Provide a non-existent file and capture the printed output.
        html_file = self.html_dir / "does_not_exist.html"
        with patch("builtins.print") as mock_print:
            FileManager._format_html_file(html_file)
            mock_print.assert_called_with(f"File {html_file} does not exist, skipping formatting.")

    def test_on_created(self):
        # Simulate the creation of a new markdown file.
        md_file = self.md_dir / "new post.md"
        md_file.write_text("# New Post")
        # Create a corresponding HTML file so that _get_html_file returns a valid path.
        html_file = self.html_dir / "new-post.html"
        html_file.write_text("<html></html>")

        event = FileCreatedEvent(str(md_file))
        # Patch _format_html_file to spy on its calls.
        with patch.object(FileManager, '_format_html_file') as mock_format:
            self.fm.on_created(event)
            self.fm.converter.convert_file.assert_called_with(md_file)
            self.fm.builder.build.assert_called()
            # Ensure _format_html_file is called for both the converted file and the homepage.
            expected_html = self.html_dir / "new-post.html"
            calls = mock_format.call_args_list
            self.assertEqual(len(calls), 2)
            self.assertEqual(calls[0][0][0], expected_html)
            self.assertEqual(calls[1][0][0], self.home_html_path)

    def test_on_modified(self):
        # Simulate modifying an existing markdown file.
        md_file = self.md_dir / "update.md"
        md_file.write_text("content")
        event = FileModifiedEvent(str(md_file))
        with patch.object(FileManager, '_format_html_file') as mock_format:
            self.fm.on_modified(event)
            self.fm.converter.convert_file.assert_called_with(md_file)
            mock_format.assert_called_once_with(self.home_html_path)

    def test_on_deleted_existing(self):
        # Create a markdown file and its corresponding HTML file.
        md_file = self.md_dir / "delete me.md"
        md_file.write_text("content")
        html_file = self.html_dir / "delete-me.html"
        html_file.write_text("html content")

        event = FileDeletedEvent(str(md_file))
        self.fm.builder.build.reset_mock()  # Reset mock call count.

        self.fm.on_deleted(event)

        # Assert that the HTML file was removed and builder.build was called.
        self.assertFalse(html_file.exists())
        self.fm.builder.build.assert_called_once()

    def test_on_deleted_non_existing(self):
        # Simulate deletion when no corresponding HTML file exists.
        md_file = self.md_dir / "nonexistent.md"
        md_file.write_text("content")
        event = FileDeletedEvent(str(md_file))
        with self.assertRaises(FileNotFoundError):
            self.fm.on_deleted(event)

    def test_start_stop(self):
        # Patch observer methods to avoid starting actual threads.
        with patch.object(self.fm.observer, 'schedule') as schedule_mock, \
             patch.object(self.fm.observer, 'start') as start_mock, \
             patch.object(self.fm.observer, 'stop') as stop_mock, \
             patch.object(self.fm.observer, 'join') as join_mock:
            self.fm.start()
            schedule_mock.assert_called_once_with(self.fm, path=str(self.md_dir), recursive=False)
            start_mock.assert_called_once()

            self.fm.stop()
            stop_mock.assert_called_once()
            join_mock.assert_called_once()

if __name__ == "__main__":
    unittest.main()
