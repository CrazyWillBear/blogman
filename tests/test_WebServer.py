# The following code was generated by ChatGPT o3-mini-high in order
# to increase my efficiency and progress in regard to blogman's code:
# automating unit tests in this way is very helpful.

import unittest
import tempfile
from pathlib import Path

# Import the WebServer and also import the module to patch STYLE_SHEET_PATH.
import blogman.WebServer as ws
from blogman.WebServer import WebServer


class TestWebServer(unittest.TestCase):
    def setUp(self):
        # Create a temporary directory for all test files.
        self.temp_dir = tempfile.TemporaryDirectory()
        self.temp_path = Path(self.temp_dir.name)

        # Create a dummy homepage file.
        self.homepage_file = self.temp_path / "home.html"
        self.homepage_content = "Homepage Content"
        self.homepage_file.write_text(self.homepage_content, encoding="utf-8")

        # Create an HTML directory for blog pages.
        self.html_dir = self.temp_path / "html"
        self.html_dir.mkdir()

        # Create a dummy blog page file.
        self.blog_file = self.html_dir / "blog1.html"
        self.blog_content = "Blog1 Content"
        self.blog_file.write_text(self.blog_content, encoding="utf-8")

        # Create a dummy stylesheet file.
        self.stylesheet_file = self.temp_path / "style.css"
        self.stylesheet_content = "body { background: #fff; }"
        self.stylesheet_file.write_text(self.stylesheet_content, encoding="utf-8")

        # Patch the global STYLE_SHEET_PATH in the WebServer module
        ws.STYLE_SHEET_PATH = self.stylesheet_file

        # Initialize the WebServer with the dummy homepage and html directory.
        self.server = WebServer(html_dir=self.html_dir, homepage_file_path=self.homepage_file)
        self.client = self.server.app.test_client()

    def tearDown(self):
        self.temp_dir.cleanup()

    def test_home_route(self):
        """Test that GET '/' returns the homepage file."""
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data.decode("utf-8"), self.homepage_content)

    def test_blog_route_existing(self):
        """Test that GET '/blog1' returns the corresponding blog file."""
        response = self.client.get('/blog1')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data.decode("utf-8"), self.blog_content)

    def test_blog_route_missing(self):
        """Test that GET for a non-existent blog page returns a 404 error."""
        response = self.client.get('/nonexistent')
        self.assertEqual(response.status_code, 404)

    def test_stylesheet_route(self):
        """
        Test that a request with the stylesheet name in the URL returns the stylesheet.
        Since the route checks if STYLE_SHEET_PATH.name is in the page string,
        a request to '/style.css' should return the stylesheet file.
        """
        response = self.client.get('/style.css')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data.decode("utf-8"), self.stylesheet_content)


if __name__ == "__main__":
    unittest.main()
