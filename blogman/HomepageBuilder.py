from dominate.tags import meta, title, link, body, div, footer, head, a, html, main, p, header, h1

from blogman import BlogBuilder, BLOG_NAME, STYLE_SHEET_PATH, BLOG_DESCRIPTION
from pathlib import Path

# Thi

class HomepageBuilder:
    """A class to build the blog's homepage based off of a template html file. Replaces template flag with boxes for each blog html file found"""

    def __init__(self, page_list: list, home_html_path: Path, blog_builder: BlogBuilder):
        """Initialize HomepageBuilder object"""
        self.page_list = page_list
        self.home_html_path = home_html_path
        self.blog_builder = blog_builder

        self.home_header = header(
            h1(BLOG_NAME),
            p(BLOG_DESCRIPTION)  # put your blog title's subtext here
        )

        self.build()

    def _build_blog_boxes(self) -> html:
        """Builds the html for the blog boxes as a string and returns it"""
        blog_boxes = html()

        with blog_boxes:
            for page in self.page_list:
                if page["name"] != "home":
                    blog_boxes.add(
                        div(
                        a(page["name"], href=page["path"].stem),
                            _class="blog-box"
                        )
                    )

        return blog_boxes

    def _build_homepage(self) -> str:
        """Builds and returns the homepage given a title and said title's subtext as a string."""
        blog_boxes = self._build_blog_boxes()

        doc = html()

        with doc:
            with head():
                title(BLOG_NAME)
                meta(charset="UTF-8")
                meta(name="viewport", content="width=device-width, initial-scale=1.0")
                link(rel="stylesheet", href=STYLE_SHEET_PATH.stem)

            with body():
                div(
                    self.home_header
                )

                main(
                    blog_boxes
                )

        return str(doc)

    def build(self) -> None:
        final_html = self._build_homepage()

        with open(self.home_html_path, "w", encoding="utf-8") as output:
            output.write(final_html)
