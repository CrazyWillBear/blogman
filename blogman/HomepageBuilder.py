from dominate.tags import title, body, div, head, a, html, main, p, header, h1, form, label, input_, select, option, \
    h3, span
from dominate.util import raw

from blogman import BLOG_NAME, BLOG_DESCRIPTION, HEAD_DEFAULTS
from blogman.FileManager import FileManager


class HomepageBuilder:
    """
    Builds the homepage.

    Provides methods for building the homepage's HTML. Provides optional arguments for queries and sorting.

    Attributes:
        blog_list (list): list of blogs in blog directory
        home_header (header): the HTML header for the homepage
        sort_options (list): options for sorting the blogs
    """

    # --- Constructor --- #
    def __init__(self):
        """
        Constructor for HomepageBuilder object.
        """
        self.blog_list = FileManager.blog_list

        self.home_header = header(
            h1(BLOG_NAME),
            p(BLOG_DESCRIPTION)
        )

        self.sort_options = [
            ("date_created_desc", "Date created (descending)"),
            ("date_created_asc", "Date created (ascending)"),
            ("date_modified_desc", "Date modified (descending)"),
            ("date_modified_asc", "Date modified (ascending)")
        ]

    # --- Static Method(s) --- #
    @staticmethod
    def _build_blog_boxes(query: str = None, sort_by: str = None) -> html:
        """
        Builds the html for the blog boxes as a string and returns it.

        Args:
            query (str): the search query, can be None
            sort_by (str): what to sort by, can be None

        Returns:
            html: the HTML for blog boxes
        """
        # update the blog list
        FileManager.update_blog_list(query=query, sort_by=sort_by)

        blog_boxes = html()
        with (blog_boxes):
            for blog in FileManager.blog_list:

                url = blog.title.replace(" ", "-")
                blog_boxes.add(
                    a(
                        div(
                            h3(blog.title),

                            span("Created: " + blog.date_created.strftime("%m/%d/%Y"), _class="timestamp_created"),
                            span("Last modified: " + blog.date_last_modified.strftime("%m/%d/%Y"), _class="timestamp_modified"),

                            span("" if blog.tags_empty() else "Tags: ", _class="tag_label"),
                            span("" if blog.tags_empty() else blog.get_formatted_tags(), _class="tag_list"), _class="blog-box"
                        )
                    , href=url)
                )

        return blog_boxes

    # --- Public Methods --- #
    def build_homepage(self, query: str = None, sort_by: str = None) -> str:
        """
        Builds and returns the homepage.

        Args:
            query (str): the search query, can be None
            sort_by (str): what to sort by, can be None


        """
        blog_boxes = HomepageBuilder._build_blog_boxes(query=query, sort_by=sort_by)
        search_and_sort_forms = self._build_forms(sort_by)

        doc = html()

        with doc:
            with head() as h:
                h.add(raw(HEAD_DEFAULTS))
                title(BLOG_NAME)

            with body():
                div(self.home_header)

                div(search_and_sort_forms, cls="form_wrapper")

                main(blog_boxes)

        return str(doc)

    # --- Internal Methods --- #
    def _build_forms(self, sort_by: str = None) -> html:
        """
        Builds the search and sort forms for the homepage.

        Args:
            sort_by (str): what to sort by, here are your options:
                - 'date_created_asc'
                - 'date_created_desc'
                - 'date_modified_asc'
                - 'date_modified_desc'

        Returns:
            html: the HTML for the search and sort forms
        """
        forms = html()

        with forms:
            with form(method="post"):
                input_(type="hidden", name="form_name", value="search_form")
                label("Search: ", fr="search")
                input_(
                    type="text",
                    id="search",
                    name="search",
                    placeholder="Search query..."
                )
                input_(
                    type="image",
                    src="https://images.vexels.com/media/users/3/132068/isolated/preview/f9bb81e576c1a361c61a8c08945b2c48-search-icon.png",
                    style="height: 1em; width: auto"
                )

            with form(method="post"):
                input_(type="hidden", name="form_name", value="sort_form")
                with label("Sort By: ", fr="sort_by"):
                    with select(id="sort_by", name="sort_by", onchange="this.form.submit()"):
                        for value, label_text in self.sort_options:
                            if sort_by == value:
                                option(label_text, value=value, selected=True)
                            else:
                                option(label_text, value=value)

        return forms
