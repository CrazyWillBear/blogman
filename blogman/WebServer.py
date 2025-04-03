from blogman import STYLE_SHEET_PATH, HomepageBuilder, FAVICON_ICO_PATH
from flask import Flask, send_file, request

from blogman.Blog import Blog
from blogman.BlogPageBuilder import BlogPageBuilder


class WebServer:
    """Class wrapper for the Flask webserver"""
    def __init__(self, homepage_builder: HomepageBuilder):
        self.app = Flask(__name__)
        self.homepage_builder = homepage_builder

        self._setup_routes()

    def _setup_routes(self):
        """Sets up routs for homepage and files"""
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
                return send_file(FAVICON_ICO_PATH)

            blog_name = Blog(page.replace("-", " "))
            return BlogPageBuilder.build_blog_page(blog_name)
        
        @self.app.errorhandler(404)
        def page_not_found(e):
            return e, 404

    def run(self, debug: bool = False, use_reloader: bool = False):
        """Runs the webserver"""
        self.app.run(debug=debug, use_reloader=use_reloader)
