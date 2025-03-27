from blogman import MD_Converter
from pathlib import Path

class Homepage_Builder:
    """A class to build the blog's homepage based off of a template html file. Replaces template flag with boxes for each blog html file found"""

    def __init__(self, html_dir: Path, home_template_path: Path, home_html_path: Path, home_md_path: Path, converter: MD_Converter):
        """Initialize Homepage_Builder object"""
        self.home_template_path = home_template_path
        with open(home_template_path, "r") as template:
            self.home_template = template.read()

        self.html_dir = html_dir
        self.home_html_path = home_html_path
        self.home_md_path = home_md_path

        self.converter = converter

        #if not self.home_html_path.exists():
        self.build()

    def _build_blog_boxes(self) -> str:
        """Builds the html for the blog boxes as a string and returns it"""
        html = ''

        for file in self.html_dir.iterdir():
            filename_formatted = file.stem.replace("-", " ")

            if file.suffix == ".html" and file.name != self.home_html_path.name:
                html += "<div class=\"blog-box\">" + \
                            f"<a href=\"{file.stem}\"><h3>{filename_formatted}</h3></a>" + \
                        "</div>"

        return html
    
    def _build_header(self) -> str:
        """Builds the homepage's header as a string and returns it"""
        html = self.converter.convert_md(self.home_md_path)

        return html
    
    def build(self) -> None:
        """Builds the home page based on the template"""
        header_html = self._build_header()
        blog_box_html = self._build_blog_boxes()
        final_html = self.home_template.replace("<!-- blog boxes -->", blog_box_html).replace("<!-- header -->", header_html)

        with open(self.home_html_path, "w", encoding="utf-8") as output:
            output.write(final_html)