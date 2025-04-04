import markdown
from dominate.tags import a, body, div, head, html, nav, title
from dominate.util import raw

from blogman import HEAD_DEFAULTS
from blogman.Blog import Blog


class BlogPageBuilder:
    """
    Builds individual Blog pages.

    All methods are static, the only one you need to use is build_blog_page(Blog).
    """

    @staticmethod
    def build_blog_page(blog: Blog) -> str:
        """
        Builds an HTML page for a given Blog.

        Args:
            blog (Blog): the Blog whose page you want to build

        Returns:
            str: the HTML for the page
        """
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
        """
        Returns the HTML conversion of a Markdown file.

        Args:
            md (str): the Markdown you wish to convert

        Returns:
            str: the HTML code
        """
        return markdown.markdown(md)
