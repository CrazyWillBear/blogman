import markdown
from dominate.tags import html, body, div, title, head, nav, a
from dominate.util import raw
from pathlib import Path
from blogman import HEAD_DEFAULTS


class BlogBuilder:
    """A class to convert markdown files to html files, placing them in the specified directory"""

    def __init__(self, html_dir: Path):
        """Initialize an BlogBuilder object"""
        self.html_dir = html_dir

    @staticmethod
    def _build_page(md_file: Path) -> str:
        """Builds and returns a blog's full page given its Markdown path as a string."""
        blog_title = md_file.stem
        raw_blog_html = BlogBuilder._convert_md(md_file)

        doc = html()
        with doc:
            with head() as h:
                h.add(raw(HEAD_DEFAULTS))
                title(blog_title)

            with body():
                with div(cls="nav-wrapper"):
                    nav(a("Home", href="/"))
                with div(id="blog") as d:
                    d.add(raw(raw_blog_html))

        return str(doc)

    @staticmethod
    def _convert_md(md_file: Path) -> str:
        """Returns the HTML version of a Markdown file"""
        with open(md_file, "r", encoding="utf-8") as input_file:
            text = input_file.read()
        return markdown.markdown(text)

    def build_blog(self, md_file: Path) -> None:
        """Converts a markdown file in the specified Markdown directory and places it in the specified HTML directory"""
        blog_html = BlogBuilder._build_page(md_file)
        html_file = self.html_dir / (md_file.stem.replace(" ", "-") + ".html")

        with open(html_file, "w", encoding="utf-8") as output_file:
            output_file.write(blog_html)
