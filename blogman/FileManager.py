import os
from pathlib import Path
from bs4 import BeautifulSoup
from blogman.MDConverter import MDConverter
from blogman.HomepageBuilder import HomepageBuilder
from watchdog.events import FileSystemEvent, FileSystemEventHandler
from watchdog.observers import Observer


class FileManager(FileSystemEventHandler):
    """A class that manages all html, css, and markdown directories and files."""

    def __init__(self, md_dir: Path, html_dir: Path, home_template_path: Path,
                 blog_template_path: Path, home_html_path: Path,
                 home_md_path: Path):
        """Initialize a FileManager object"""
        self.md_dir = md_dir
        self.html_dir = html_dir
        self.html_template_path = home_template_path
        self.blog_template_path = blog_template_path
        self.home_html_path = home_html_path

        self.converter = MDConverter(self.html_dir, blog_template_path)
        self.builder = HomepageBuilder(html_dir, home_template_path,
                                       home_html_path, home_md_path,
                                       self.converter)
        self.observer = Observer()

    def start(self) -> None:
        """Starts the file manager"""
        self.observer.schedule(self, path=str(self.md_dir), recursive=False)
        self.observer.start()

    def stop(self) -> None:
        """Stops the file manager"""
        self.observer.stop()
        self.observer.join()

    def _get_html_file(self, md_file: Path) -> Path | None:
        """Gets the path to a markdown file's corresponding html file. Returns None if it can't be found"""
        html_file = self.html_dir / (md_file.stem.replace(" ", "-") + ".html")

        if html_file.exists():
            return html_file
        return None

    @staticmethod
    def _format_html_file(html_file: Path) -> None:
        """Formats an HTML file"""
        if not html_file.exists():
            print(f"File {html_file} does not exist, skipping formatting.")
            return

        with open(html_file, "r") as file:
            soup = BeautifulSoup(file, "html.parser")

        pretty_html = soup.prettify()

        with open(html_file, "w") as file:
            file.write(pretty_html)

        print(f"Just prettified {html_file}")

    def on_created(self, event: FileSystemEvent) -> None:
        """Event handling logic for file creation"""
        path = Path(event.src_path)

        if not path.exists():
            return

        self.converter.convert_file(path)
        self.builder.build()

        FileManager._format_html_file(self._get_html_file(path))
        FileManager._format_html_file(self.home_html_path)

    def on_modified(self, event: FileSystemEvent) -> None:
        """Event handling logic for file modification"""
        path = Path(event.src_path)

        if not path.exists():
            return

        self.converter.convert_file(path)
        FileManager._format_html_file(self.home_html_path)

    def on_deleted(self, event) -> None:
        """Event handling logic for file deletion"""
        path = Path(event.src_path)
        html_file = self._get_html_file(path)

        if html_file is not None:
            os.remove(html_file)
            self.builder.build()
        else:
            raise FileNotFoundError(
                "Attempted to delete non-existent html file")
