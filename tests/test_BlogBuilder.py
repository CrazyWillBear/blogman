# The following unit test file was generated using ChatGPT o3-mini-high, which does exceptionally well with thinking
# about what cases are worth testing and which might legitimately fail.

import os
import tempfile
import unittest
from pathlib import Path
import markdown

import blogman
from blogman.BlogBuilder import BlogBuilder

# set HEAD_DEFAULTS
blogman.HEAD_DEFAULTS = '<meta charset="utf-8">'


class TestBlogBuilder(unittest.TestCase):
    def setUp(self):
        # Create a temporary directory for the output HTML files.
        self.temp_html_dir = tempfile.TemporaryDirectory()

        # Create a temporary markdown file.
        self.temp_md_file = tempfile.NamedTemporaryFile(
            "w+", suffix=".md", delete=False, encoding="utf-8"
        )
        self.sample_md_content = "# Hello World\n\nThis is a test."
        self.temp_md_file.write(self.sample_md_content)
        self.temp_md_file.seek(0)
        self.temp_md_path = Path(self.temp_md_file.name)

    def tearDown(self):
        # Clean up the temporary markdown file and directory.
        self.temp_md_file.close()
        os.unlink(self.temp_md_file.name)
        self.temp_html_dir.cleanup()

    def test_convert_md(self):
        """Test that _convert_md correctly converts markdown to HTML."""
        expected_html = markdown.markdown(self.sample_md_content)
        actual_html = BlogBuilder._convert_md(self.temp_md_path)
        self.assertEqual(actual_html, expected_html)

    def test_build_page(self):
        """Test that _build_page returns a full HTML document with the expected elements."""
        html_output = BlogBuilder._build_page(self.temp_md_path)
        blog_title = self.temp_md_path.stem

        # Check that the <title> tag includes the blog title.
        self.assertIn(f"<title>{blog_title}</title>", html_output)
        # Verify that HEAD_DEFAULTS was included.
        self.assertIn('<meta charset="utf-8">', html_output.lower())
        # Ensure that navigation elements are present.
        self.assertIn("<nav>", html_output)
        self.assertIn("Home", html_output)
        # Check that the converted markdown content appears in the output.
        converted_md = markdown.markdown(self.sample_md_content)
        self.assertIn(converted_md, html_output)

    def test_build_blog(self):
        """Test that build_blog writes the expected HTML file to the output directory."""
        html_dir_path = Path(self.temp_html_dir.name)
        builder = BlogBuilder(html_dir=html_dir_path)
        builder.build_blog(self.temp_md_path)

        # Expected file name: replace spaces with hyphens and add .html extension.
        expected_filename = self.temp_md_path.stem.replace(" ", "-") + ".html"
        output_file_path = html_dir_path / expected_filename

        self.assertTrue(output_file_path.exists(), "Output HTML file was not created.")

        # Read the generated HTML file and verify its contents.
        with open(output_file_path, "r", encoding="utf-8") as f:
            content = f.read()

        blog_title = self.temp_md_path.stem
        self.assertIn(f"<title>{blog_title}</title>", content)
        self.assertIn('<meta charset="utf-8">', content.lower())
        converted_md = markdown.markdown(self.sample_md_content)
        self.assertIn(converted_md, content)

    def test_filename_replacement(self):
        """Test that a markdown file with spaces in its name results in an output file with hyphens."""
        with tempfile.NamedTemporaryFile(
            "w+", suffix=".md", prefix="My Blog ", delete=False, encoding="utf-8"
        ) as tmp_file:
            tmp_file.write("# Title\nContent")
            tmp_file.seek(0)
            tmp_file_path = Path(tmp_file.name)

        try:
            html_dir_path = Path(self.temp_html_dir.name)
            builder = BlogBuilder(html_dir=html_dir_path)
            builder.build_blog(tmp_file_path)
            expected_filename = tmp_file_path.stem.replace(" ", "-") + ".html"
            output_file_path = html_dir_path / expected_filename
            self.assertTrue(output_file_path.exists(), "Output file with replaced spaces was not created.")
        finally:
            os.unlink(tmp_file_path)


if __name__ == "__main__":
    unittest.main()
