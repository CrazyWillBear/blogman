import markdown
from dominate.tags import html, body, div, title, head, nav, a
from dominate.util import raw
from blogman import HEAD_DEFAULTS
from blogman.Blog import Blog


class BlogPageBuilder:
    """A class to convert to build Blogs into HTML webpages"""

    @staticmethod
    def build_blog_page(blog: Blog) -> str:
        """Builds and returns a blog HTML page given said blog's Blog object."""
        blog_title = blog.title
        raw_blog_html = BlogPageBuilder._convert_md(blog.md_content)

        doc = html()
        with doc:
            with head() as h:
                h.add(raw(HEAD_DEFAULTS))
                title(blog_title)

            with body():
                with a(href="/"):
                    with div(cls="nav-wrapper"):
                        nav("Home")
                with div(id="blog") as d:
                    d.add(raw(raw_blog_html))

        return str(doc)

    @staticmethod
    def _convert_md(md: str) -> str:
        """Returns the HTML version of a Markdown file"""
        return markdown.markdown(md)
