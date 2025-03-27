import os
from pathlib import Path
from bs4 import BeautifulSoup
from blogman.MD_Converter import MD_Converter
from blogman.Homepage_Builder import Homepage_Builder
from blogman import BLOG_TEMPLATE_PATH
from watchdog.events import FileSystemEvent, FileSystemEventHandler
from watchdog.observers import Observer


class File_Manager(FileSystemEventHandler):
    """A class that manages all html, css, and markdown directories and files."""

    def __init__(self, md_dir: Path, html_dir: Path, home_template_path: Path, blog_template_path: Path, home_html_path: Path, home_md_path: Path):
        """Initialize a FileManager object"""
        self.md_dir = md_dir
        self.html_dir = html_dir
        self.html_template_path = home_template_path
        self.blog_template_path = blog_template_path
        self.home_html_path = home_html_path

        self.converter = MD_Converter(self.html_dir, blog_template_path)
        self.builder = Homepage_Builder(html_dir, home_template_path, home_html_path, home_md_path, self.converter)
        self.observer = Observer()

    def start(self) -> None:
        """Starts the file manager"""
        self.observer.schedule(self, path=str(self.md_dir), recursive=False)
        self.observer.start()

    def stop(self) -> None:
        """Stops the file manager"""
        self.observer.stop()
        self.observer.join()

    def _get_html_file(self, md_file: Path) -> Path:
        """Gets the path to a markdown file's corresponding html file. Returns None if it can't be found"""
        html_file = self.html_dir / (md_file.stem.replace(" ", "-") + ".html")

        if html_file.exists():
            return html_file
        return None
    
    def _format_html_file(self, html_file: Path) -> None:
        """Formats an HTML file"""
        with open(html_file, "r") as file:
            soup = BeautifulSoup(file, "html.parser")

        pretty_html = soup.prettify()

        with open(html_file, "w") as file:
            file.write(pretty_html)

        print(f"Just prettified {html_file}")

    def on_created(self, event: FileSystemEvent) -> None:
        """Event handling logic for file creation"""
        path = Path(event.src_path)
        self.converter.convert_file(path)
        self.builder.build()

        self._format_html_file(self._get_html_file(path))
        self._format_html_file(self.home_html_path)

    def on_modified(self, event: FileSystemEvent) -> None:
        """Event handling logic for file modification"""
        path = Path(event.src_path)
        self.converter.convert_file(path)
        self._format_html_file(self.home_html_path)

    def on_deleted(self, event) -> None:
        """Event handling logic for file deletion"""
        path = Path(event.src_path)
        html_file = self._get_html_file(path)

        if html_file != None:
            os.remove(html_file)
            self.builder.build()
        else:
            raise FileNotFoundError("Attempted to delete non-existent html file")
