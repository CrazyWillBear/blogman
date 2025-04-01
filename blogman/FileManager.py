import os
from pathlib import Path
from typing import Optional
from blogman.BlogBuilder import BlogBuilder
from blogman.HomepageBuilder import HomepageBuilder
from watchdog.events import FileSystemEvent, FileSystemEventHandler
from watchdog.observers import Observer


class FileManager(FileSystemEventHandler):
    """A class that manages all html, css, and markdown directories and files."""

    def __init__(self, md_dir: Path, html_dir: Path, home_html_path: Path):
        """Initialize a FileManager object"""
        self.md_dir = md_dir
        self.html_dir = html_dir

        self.blog_builder = BlogBuilder(self.html_dir)
        self.homepage_builder = HomepageBuilder(html_dir, home_html_path, self.blog_builder)
        self.md_observer = Observer()
        self.html_observer= Observer()

    def start(self) -> None:
        """Starts the file manager"""
        # Schedule observers for the HTML and MD directories
        self.md_observer.schedule(self, path=str(self.md_dir), recursive=False)
        self.html_observer.schedule(self, path=str(self.html_dir), recursive=False)

        # Start those observers
        self.md_observer.start()
        self.html_observer.start()

    def stop(self) -> None:
        """Stops the file manager"""
        # Stop HTML and MD observers
        self.md_observer.stop()
        self.html_observer.stop()

        # Join those observers to clear things
        self.md_observer.join()
        self.html_observer.join()

    def _get_html_file(self, md_file: Path) -> Optional[Path]:
        """Gets the path to a Markdown file's corresponding HTML file. Returns None if it can't be found"""
        html_file = self.html_dir / (md_file.stem.replace(" ", "-") + ".html")

        if html_file.exists():
            return html_file
        return None

    def on_created(self, event: FileSystemEvent) -> None:
        """Event handling logic for file creation"""
        path = Path(event.src_path)

        # error prevention
        if not path.exists() or path.suffix.endswith("~"):
            return

        # deal with Markdown files
        if path.suffix == ".md":
            self.blog_builder.build_blog(path)

        # deal with HTML files (excluding the home.html file)
        if path.suffix == ".html" and path.name != "home":
            self.homepage_builder.build()

    def on_modified(self, event: FileSystemEvent) -> None:
        """Event handling logic for file modification"""
        path = Path(event.src_path)

        # error prevention
        if not path.exists() or path.suffix.endswith("~"):
            return

        # deal with Markdown files
        if path.suffix == ".md":
            self.blog_builder.build_blog(path)

    def on_deleted(self, event) -> None:
        """Event handling logic for file deletion"""
        path = Path(event.src_path)

        # error prevention
        if path.suffix.endswith("~"):
            return

        # deal with Markdown files by deleting the corresponding HTML file
        if path.suffix == ".md":
            html_file = self._get_html_file(path)

            if html_file is not None:
                os.remove(html_file)
            else:
                raise FileNotFoundError("Attempted to delete non-existent html file")

        # deal with HTML files by rebuilding homepage
        if path.suffix == ".html":
            self.homepage_builder.build()
