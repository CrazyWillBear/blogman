# The following unit test file was generated using ChatGPT o3-mini-high, which does exceptionally well with thinking
# about what cases are worth testing and which might legitimately fail.

import os
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import MagicMock

# Add the project root directory to sys.path so that the blogman package can be imported.
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from blogman.HomepageBuilder import HomepageBuilder, BLOG_NAME, BLOG_DESCRIPTION, HEAD_DEFAULTS


class TestHomepageBuilder(unittest.TestCase):
    def setUp(self):
        # Create a temporary directory to simulate the html_dir with dummy HTML files.
        self.temp_html_dir = tempfile.TemporaryDirectory()
        self.html_dir = Path(self.temp_html_dir.name)

        # Create a "home.html" file, which should be excluded from the page list.
        (self.html_dir / "home.html").write_text("<html>Home</html>")
        # Create two dummy blog HTML files.
        (self.html_dir / "blog-one.html").write_text("<html>Blog One</html>")
        (self.html_dir / "blog-two.html").write_text("<html>Blog Two</html>")

        # Create a temporary file path for the homepage.
        # This file is where the HomepageBuilder.build() will write the final homepage.
        self.temp_home_html = tempfile.NamedTemporaryFile(delete=False, suffix=".html")
        self.temp_home_html_path = Path(self.temp_home_html.name)
        self.temp_home_html.close()  # Close the file; it will be written to by HomepageBuilder.

        # Create a dummy blog_builder (not used in building the homepage but required for the constructor).
        self.dummy_blog_builder = MagicMock()

        # Instantiate HomepageBuilder.
        # Note that __init__ automatically calls build(), writing the homepage file.
        self.homepage_builder = HomepageBuilder(self.html_dir, self.temp_home_html_path, self.dummy_blog_builder)

    def tearDown(self):
        self.temp_html_dir.cleanup()
        try:
            os.unlink(self.temp_home_html_path)
        except Exception:
            print(Exception)

    def test_get_page_list_excludes_home(self):
        """
        _get_page_list should return only blog pages,
        excluding the homepage file (whose stem is "home").
        """
        page_list = self.homepage_builder._get_page_list()
        # We expect two pages: "blog-one" and "blog-two"
        self.assertEqual(len(page_list), 2)
        names = [page["name"] for page in page_list]
        self.assertIn("blog one", names)
        self.assertIn("blog two", names)
        self.assertNotIn("home", names)

    def test_build_blog_boxes(self):
        """
        _build_blog_boxes should generate an HTML snippet that contains a div with class "blog-box"
        for each page and proper anchor links.
        """
        blog_boxes_doc = self.homepage_builder._build_blog_boxes()
        blog_boxes_html = str(blog_boxes_doc)
        # Check that there is a div with class "blog-box" in the generated HTML.
        self.assertIn('class="blog-box"', blog_boxes_html)
        # Check that the links for "blog-one" and "blog-two" exist.
        self.assertIn('href="blog-one"', blog_boxes_html)
        self.assertIn('href="blog-two"', blog_boxes_html)
        self.assertIn(">blog one<", blog_boxes_html)
        self.assertIn(">blog two<", blog_boxes_html)

    def test_build_homepage_contains_required_elements(self):
        """
        _build_homepage should return an HTML string that contains the HEAD_DEFAULTS,
        the blog title, description, and the homepage header.
        """
        homepage_html = self.homepage_builder.build_homepage()
        self.assertIn(HEAD_DEFAULTS, homepage_html.lower())
        self.assertIn(f"<title>{BLOG_NAME}</title>", homepage_html)
        self.assertIn(BLOG_NAME, homepage_html)
        self.assertIn(BLOG_DESCRIPTION, homepage_html)
        self.assertIn("<header>", homepage_html)

    def test_build_writes_homepage_file(self):
        """
        The build() method (called automatically on __init__) should write the final homepage HTML
        to the file specified by home_html_path.
        """
        with open(self.temp_home_html_path, "r", encoding="utf-8") as f:
            content = f.read()
        self.assertIn(HEAD_DEFAULTS, content.lower())
        self.assertIn(f"<title>{BLOG_NAME}</title>", content)
        self.assertIn("<main>", content.lower())


if __name__ == "__main__":
    unittest.main()
