from bs4 import BeautifulSoup
from dominate.tags import title, body, div, head, a, html, main, p, header, h1, form, label, input_, br
from dominate.util import raw

from blogman import BlogBuilder, BLOG_NAME, BLOG_DESCRIPTION, HEAD_DEFAULTS
from pathlib import Path


class HomepageBuilder:
    """A class to build the blog's homepage based off of a template html file. Replaces template flag with boxes for each blog html file found"""

    def __init__(self, html_dir: Path, home_html_path: Path, blog_builder: BlogBuilder):
        """Initialize HomepageBuilder object"""
        self.html_dir = html_dir
        self.home_html_path = home_html_path
        self.blog_builder = blog_builder
        self.page_list = self._get_page_list()

        self.home_header = header(
            h1(BLOG_NAME),
            p(BLOG_DESCRIPTION)
        )

        self.build()

    def _get_page_list(self) -> list:
        """Creates and returns a list of dicts representing web pages, excludes homepage"""
        page_list = []

        for file in self.html_dir.iterdir():
            if file.stem == "home":
                continue

            with open(file, "r", encoding="UTF-8") as f:
                file_content = f.read()
            soup = BeautifulSoup(file_content, "html.parser")
            blog_div = soup.find("div", id="blog")
            try:
                content = blog_div.text
            except AttributeError:
                content = "Nothing"
                print("Couldn't find div with id='blog'")

            file_dict = {
                "path": file,
                "name": file.stem.replace("-", " "),  # no file extension + spaces instead of dashes
                "content": content
            }

            page_list.append(file_dict)

        return page_list

    def _build_blog_boxes(self, query: str = None) -> html:
        """Builds the html for the blog boxes as a string and returns it"""
        # update the page list
        self.page_list = self._get_page_list()

        blog_boxes = html()
        with (blog_boxes):
            for page in self.page_list:
                # this is for search feature, only adds blogs that match query in content or name (case-insensitive)
                if query is not None:
                    query_lower = query.lower()
                    content_lower = page["content"].lower()
                    name_lower = page["name"].lower()

                    if query_lower not in content_lower and query_lower not in name_lower:
                        continue

                blog_boxes.add(
                    div(
                    a(page["name"], href=page["path"].stem),
                        _class="blog-box"
                    )
                )

        return blog_boxes

    def build_homepage(self, query: str = None) -> str:
        """Builds and returns the homepage given a title and said title's subtext as a string. Takes an optional query
        argument for the search feature, the only place outside this class where this function is used."""
        blog_boxes = self._build_blog_boxes(query=query)

        doc = html()

        with doc:
            with head() as h:
                h.add(raw(HEAD_DEFAULTS))
                title(BLOG_NAME)

            with body():
                div(self.home_header)
                with form(method="post"):
                    label("Search query:", fr="search")
                    input_(type="text", id="search", name="search")
                    br()
                    input_(type="submit", value="Submit")
                main(blog_boxes)

        return str(doc)

    def build(self) -> None:
        """Builds the homepage and saves it to proper path"""
        final_html = self.build_homepage()

        with open(self.home_html_path, "w", encoding="utf-8") as output:
            output.write(final_html)
