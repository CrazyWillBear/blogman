from dominate.tags import title, body, div, head, a, html, main, p, header, h1, form, label, input_, select, option, \
    h3, span
from dominate.util import raw

from blogman import BLOG_NAME, BLOG_DESCRIPTION, HEAD_DEFAULTS, BLOG_DIR

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

        self.sort_options = [
            ("date_created_desc", "Date created (descending)"),
            ("date_created_asc", "Date created (ascending)"),
            ("date_modified_desc", "Date modified (descending)"),
            ("date_modified_asc", "Date modified (ascending)")
        ]

    @staticmethod
    def _get_blog_list(sort_by: str = None) -> list[Blog] | None:
        """Creates and returns the list of Blogs in the blog directory. You can pass the following into sort_by:
        - date_created_asc
        - date_created_desc
        - date_modified_asc
        -date_modified_desc
        """
        blog_list = []

        for file in BLOG_DIR.iterdir():
            print(file)
            blog = Blog(file.stem)
            blog_list.append(blog)

        if sort_by is None:
            return blog_list

        if sort_by == "date_created_asc":
            return sorted(blog_list, key=lambda blog_: blog_.date_created)
        elif sort_by == "date_created_desc":
            return sorted(blog_list, key=lambda blog_: blog_.date_created, reverse=True)
        elif sort_by == "date_modified_asc":
            return sorted(blog_list, key=lambda blog_: blog_.date_last_modified)
        elif sort_by == "date_modified_desc":
            return sorted(blog_list, key=lambda blog_: blog_.date_last_modified, reverse=True)

    def _build_blog_boxes(self, query: str = None, sort_by: str = None) -> html:
        """Builds the html for the blog boxes as a string and returns it"""
        # update the blog list
        self.blog_list = HomepageBuilder._get_blog_list(sort_by=sort_by)

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
                    a(
                        div(
                            h3(blog.title),
                            span("Created: " + blog.date_created.strftime("%m/%d/%Y"), _class="timestamp_created"),
                            span("Last modified: " + blog.date_last_modified.strftime("%m/%d/%Y"), _class="timestamp_modified"),
                            _class="blog-box"
                    ), href=url)
                )

        return blog_boxes

    def _build_search_and_sort_forms(self, sort_by: str = None):
        forms = html()

        with forms:
            with form(method="post"):
                input_(type="hidden", name="form_name", value="search_form")
                label("Search: ", fr="search")
                input_(type="text", id="search", name="search", placeholder="Search query...")
                input_(type="image", src="https://images.vexels.com/media/users/3/132068/isolated/preview/f9bb81e576c1a361c61a8c08945b2c48-search-icon.png", style="height: 1em; width: auto")

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

    def build_homepage(self, query: str = None, sort_by: str = None) -> str:
        """Builds and returns the homepage given a title and said title's subtext as a string. Takes optional arguments
        for the search and sort features, the only places outside this class where this function is used."""
        print("Building homepage")
        blog_boxes = self._build_blog_boxes(query=query, sort_by=sort_by)
        search_and_sort_forms = self._build_search_and_sort_forms(sort_by)

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
