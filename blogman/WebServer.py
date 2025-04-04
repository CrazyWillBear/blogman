from flask import Flask, send_file, request

from blogman import STYLE_SHEET_PATH
from blogman.Blog import Blog
from blogman.BlogPageBuilder import BlogPageBuilder
from blogman.HomepageBuilder import HomepageBuilder


class WebServer:
    """
    Hosts the Flask webserver.

    Sets up routes, serves files, and runs the Flask webserver.

    Attributes:
        app (Flask): the Flask app itself
        homepage_builder (HomepageBuilder): the homepage builder object
    """

    # --- Constructor --- #
    def __init__(self):
        self.app = Flask(__name__)
        self.homepage_builder = HomepageBuilder()

        self._setup_routes()

    # --- Public Methods --- #
    def run(self, debug: bool = False, use_reloader: bool = False) -> None:
        """
        Runs the Flask server.

        Args:
            debug (bool): whether debug mode is on
            use_reloader (bool): whether to use the reloader in app.run()
        """
        self.app.run(debug=debug, use_reloader=use_reloader)

    # --- Internal Methods --- #
    def _setup_routes(self) -> None:
        """
        Sets up routs for homepage and files.
        """
        @self.app.route('/', methods=('GET', 'POST'))
        def home():
            query = None
            sort_by = "date_created_desc"  # default

            if request.method == "POST":
                form_name = request.form.get('form_name')

                if form_name == "search_form":
                    query = request.form['search']

                if form_name == "sort_form":
                    sort_by = request.form.get("sort_by")

            return self.homepage_builder.build_homepage(query=query, sort_by=sort_by)

        @self.app.route('/<page>')
        def blog(page):
            # account for requesting a stylesheet
            if STYLE_SHEET_PATH.stem == page:
                return send_file(STYLE_SHEET_PATH)
            if "favicon.ico" in page:
                return "e"

            blog_name = Blog(page.replace("-", " "))
            return BlogPageBuilder.build_blog_page(blog_name)
        
        @self.app.errorhandler(404)
        def page_not_found(e):
            return e, 404
