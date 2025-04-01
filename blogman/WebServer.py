from blogman import STYLE_SHEET_PATH, HomepageBuilder
from flask import Flask, abort, send_file, request
from pathlib import Path


class WebServer:
    """Class wrapper for the Flask webserver"""
    def __init__(self, html_dir: Path, homepage_file_path: Path, homepage_builder: HomepageBuilder):
        self.app = Flask(__name__)
        self.html_dir = html_dir
        self.homepage_file_path = homepage_file_path
        self.homepage_builder = homepage_builder

        self._setup_routes()

    def _setup_routes(self):
        """Sets up routs for homepage and files"""
        @self.app.route('/', methods=('GET', 'POST'))
        def home():
            if request.method == "POST":
                query = request.form['search']
                return self.homepage_builder.build_homepage(query=query)
            else:
                return send_file(self.homepage_file_path)

        @self.app.route('/<page>')
        def blog(page):
            # account for requesting a stylesheet
            if STYLE_SHEET_PATH.stem == page:
                return send_file(STYLE_SHEET_PATH)

            # otherwise, just return the html file
            path = self.html_dir / (page + ".html")
            
            if not path.exists():
                abort(404)  # tell Flask this is a 404 situation
            return send_file(path)
        
        @self.app.errorhandler(404)
        def page_not_found(e):
            return e, 404

    def run(self, debug: bool = False, use_reloader: bool = False):
        """Runs the webserver"""
        self.app.run(debug=debug, use_reloader=use_reloader)
