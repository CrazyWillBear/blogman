import markdown
from pathlib import Path


class MD_Converter:
    """A class to convert markdown files to html files, placing them in the specified directory"""

    def __init__(self, html_dir: Path, blog_template_path: Path):
        """Initalize an MD_Converter object"""
        self.html_dir = html_dir
        self.blog_template_path = blog_template_path

    def _build_file(self, md_file: Path) -> str:
        """Builds a complete blog page file, including dealing with the headers"""
        html = MD_Converter.convert_md(md_file)

        with open(self.blog_template_path, "r") as input_file:
            text = input_file.read()

        text = text.replace("<!-- title -->", md_file.stem) \
                    .replace("<!-- blog -->", html)

        return text

    @staticmethod
    def convert_md(md_file: Path) -> str:
        """Returns the html version of a markdown file"""
        with open(md_file, "r") as input_file:
            text = input_file.read()
        return markdown.markdown(text)

    def convert_file(self, md_file: Path) -> None:
        """Converts a markdown file in the specified markdown directory and places it in the specified html directory"""
        html = self._build_file(md_file)
        html_file = self.html_dir / (md_file.stem.replace(" ", "-") + ".html")

        with open(html_file, "w", encoding="utf-8") as output_file:
            output_file.write(html)
