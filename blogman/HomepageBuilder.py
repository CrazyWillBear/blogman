from bs4 import BeautifulSoup
from dominate.tags import title, body, div, head, a, html, main, p, header, h1, form, label, input_, br
from dominate.util import raw

from blogman import BlogPageBuilder, BLOG_NAME, BLOG_DESCRIPTION, HEAD_DEFAULTS, BLOG_DIR
from pathlib import Path

from blogman.Blog import Blog


class HomepageBuilder:
    """A class to build the blog's homepage based off of a template html file. Replaces template flag with boxes for each blog html file found"""

    def __init__(self):
        """Initialize HomepageBuilder object"""
        self.blog_list = self._get_blog_list()

        self.home_header = header(
            h1(BLOG_NAME),
            p(BLOG_DESCRIPTION)
        )

    @staticmethod
    def _get_blog_list() -> list:
        """Creates and returns the list of Blogs in the blog directory"""
        blog_list = []

        for file in BLOG_DIR.iterdir():
            print(file)
            blog = Blog(file.stem)
            blog_list.append(blog)

        return blog_list

    def _build_blog_boxes(self, query: str = None) -> html:
        """Builds the html for the blog boxes as a string and returns it"""
        # update the blog list
        self.blog_list = HomepageBuilder._get_blog_list()

        blog_boxes = html()
        with (blog_boxes):
            for blog in self.blog_list:
                print(blog.title)

                # this is for search feature, only adds blogs that match query in content or name (case-insensitive)
                if query is not None:
                    query_lower = query.lower()
                    content_lower = blog.md_content.lower()
                    name_lower = blog.title.lower()

                    if query_lower not in content_lower and query_lower not in name_lower:
                        continue

                url = blog.title.replace(" ", "-")
                blog_boxes.add(
                    div(
                    a(blog.title, href=url),
                        _class="blog-box"
                    )
                )

        return blog_boxes

    def build_homepage(self, query: str = None) -> str:
        """Builds and returns the homepage given a title and said title's subtext as a string. Takes an optional query
        argument for the search feature, the only place outside this class where this function is used."""
        print("Building homepage")
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
