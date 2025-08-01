import markdown
from bs4 import BeautifulSoup
from dominate.tags import a, body, div, head, html, p, title
from dominate.util import raw

from blogman import HEAD_DEFAULTS


class BlogPageBuilder:
    """
    Builds individual Blog pages.

    All methods are static, the only one you need to use is build_blog_page().
    """

    @staticmethod
    def build_blog_page(md: str, blog_title: str) -> str:
        """
        Builds an HTML page for a given Blog.

        Args:
            md (str): the Blog's Markdown content
            blog_title (str): the Blog's title

        Returns:
            str: the HTML for the page
        """
        raw_blog_html = BlogPageBuilder._convert_md(md)

        doc = html(lang="en")
        with doc:
            with head() as h:
                h.add(raw(HEAD_DEFAULTS))
                title(blog_title)

            with body(_class="mx-2 mb-8 mt-4 lg:mx-64"):
                with a(href="/"):
                    with div(
                            _class="mx-auto my-2 w-fit py-1 px-4 border-2 rounded-md border-gray-400 bg-transparent md:hover:bg-neutral-700 transition-colors duration-300 md:hover:text-stone-100"):
                        p("Home")
                with div(_class="raw-blog") as d:
                    d.add(raw(raw_blog_html))

        return str(doc)

    @staticmethod
    def _convert_md(md: str) -> str:
        """
        Returns the HTML conversion of a Markdown file, getting rid of <script> elements.

        Args:
            md (str): the Markdown you wish to convert

        Returns:
            str: the HTML code
        """
        html_converted = markdown.markdown(md, extensions=['extra', 'fenced_code', 'codehilite'])
        soup = BeautifulSoup(html_converted, 'html.parser')

        for script in soup.find_all('script'):
            script.decompose()

        return str(soup)
