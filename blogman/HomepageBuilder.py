from dominate.tags import title, body, div, head, a, html, main, p, header, h1, form, label, input_, select, option, \
    h3, span
from dominate.util import raw

from blogman import BLOG_NAME, BLOG_DESCRIPTION, HEAD_DEFAULTS
from blogman.FileManager import FileManager

# This is used below to place a pinned icon next to pinned blogs
GOOGLE_PINNED_ICON_CODE = """<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#4A4A4A"><path d="m640-480 80 80v80H520v240l-40 40-40-40v-240H240v-80l80-80v-280h-40v-80h400v80h-40v280Zm-286 80h252l-46-46v-314H400v314l-46 46Zm126 0Z"/></svg>"""

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
            h1(BLOG_NAME, _class="text-center text-3xl font-bold pb-2 mx-10"),
            p(BLOG_DESCRIPTION,  _class="text-justify")
        )

        self.sort_options = [
            ("date_created_desc", "Date created (descending)"),
            ("date_created_asc", "Date created (ascending)"),
            ("date_modified_desc", "Date modified (descending)"),
            ("date_modified_asc", "Date modified (ascending)")
        ]

    # --- Static Method(s) --- #
    @staticmethod
    def _build_blog_boxes(query: str = None, sort_by: str = None) -> div:
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

        blog_boxes = div()
        with (blog_boxes):
            for blog in FileManager.blog_list:

                url = blog.title.replace(" ", "-")
                blog_boxes.add(
                    a(
                        div(
                            div(
                                h3(blog.title, _class="text-xl font-bold text-center mx-5 pt-1"),

                                span(
                                    raw(GOOGLE_PINNED_ICON_CODE),
                                    _class="absolute top-0 left-0 h-5 w-5"
                                ),
                                _class="relative"
                            ) if blog.pinned else h3(blog.title, _class="text-xl font-bold text-center pt-1"),

                            div(
                                span(
                                    "" if blog.tags_empty() else "Tags: ",
                                    _class=""
                                ),
                                span(
                                    "" if blog.tags_empty() else blog.get_formatted_tags(),
                                    _class="tag_list"
                                ),
                                _class="pt-1 text-sm text-center"
                            ),

                            div(
                                span(
                                    "Created: " + blog.date_created.strftime("%m/%d/%Y"),
                                    _class="text-left text-xs"
                                ),
                                span(
                                    "Last modified: " + blog.date_last_modified.strftime("%m/%d/%Y"),
                                    _class="text-right text-xs"
                                ),
                                _class="flex justify-between pt-1"
                            ),

                            _class="mb-4 w-full h-auto border-2 border-gray-400 rounded-2xl mx-auto pt-3 px-3 pb-1 bg-transparent md:hover:bg-neutral-700 transition-colors duration-300 md:hover:text-stone-100"
                        ),
                    href=url
                    )
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

        doc = html(_class="m-8 lg:mx-64")

        with doc:
            with head() as h:
                h.add(raw(HEAD_DEFAULTS))
                title(BLOG_NAME)

            with body():
                div(self.home_header)

                div(search_and_sort_forms, _class="my-4")

                main(blog_boxes)

        return str(doc)

    # --- Internal Methods --- #
    def _build_forms(self, sort_by: str = None) -> div:
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
        forms = div(_class="flex flex-col items-center w-full")

        with forms:
            with form(method="post", _class="my-1"):
                input_(type="hidden", name="form_name", value="search_form")
                label("Search:  ", fr="search")
                input_(
                    type="text",
                    id="search",
                    name="search",
                    placeholder=" Search query...",
                    _class="h-6 w-auto rounded-md"
                )
                input_(
                    type="image",
                    src="https://images.vexels.com/media/users/3/132068/isolated/preview/f9bb81e576c1a361c61a8c08945b2c48-search-icon.png",
                    _class="h-4 w-auto align-middle"
                )

            with form(method="post", _class="my-1"):
                input_(type="hidden", name="form_name", value="sort_form")
                with label("Sort:  ", fr="sort_by"):
                    with select(id="sort_by", name="sort_by", onchange="this.form.submit()", _class="h-6 w-auto rounded-md text-gray-400"):
                        for value, label_text in self.sort_options:
                            if sort_by == value:
                                option(label_text, value=value, selected=True)
                            else:
                                option(label_text, value=value)

        return forms
