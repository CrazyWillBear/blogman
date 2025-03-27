from blogman import STYLE_SHEET_PATH
from flask import Flask, send_file
from pathlib import Path

class WebServer:
    def __init__(self, html_dir: Path, homepage_file_path: Path):
        self.app = Flask(__name__)
        self.html_dir = html_dir
        self.homepage_file_path = homepage_file_path

        self._setup_routes()

    def _setup_routes(self):
        @self.app.route('/')
        def home():
            return send_file(self.homepage_file_path)

        @self.app.route('/<page>')
        def blog(page):
            # account for requesting a stylesheet
            if (STYLE_SHEET_PATH.name in page):
                return send_file(STYLE_SHEET_PATH)

            # otherwise, just return the html file
            path = self.html_dir / (page + ".html")
            return send_file(path)

    def run(self, debug: bool = False, use_reloader: bool = False):
        self.app.run(debug=debug, use_reloader=use_reloader)
