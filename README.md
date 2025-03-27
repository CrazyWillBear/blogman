![Static Badge](https://img.shields.io/badge/version-0.0.1-blue)
![GitHub License](https://img.shields.io/github/license/CrazyWillBear/blogman)

# Blogman

Blogman is a blog manager software that allows posts to be written in Markdown and displayed on the web. It works by converting the Markdown files into HTML files and hosting them on a Flask web server. It also builds a homepage that lists all blog posts. The structure of the HTML files is templatable.

### How it works

In the `__init__.py` file, you configure directory and file paths for a few things, but the most important are:

- The Markdown directory, where Markdown files are placed
- The HTML directory, where generated/built HTML files are located
- Your template directories, of which default ones exist in the `html_templates` directory

The program monitors file creations, modifications, and deletions in the Markdown directory. Upon these changes, it accordingly builds, rebuilds, or deletes HTML files in the HTML directory. Upon creations and deletions, it also rebuilts the homepage.

### How to use

The directories `css/`, `html/`, and `md/` in the project root have sample files and are configured in `__init__.py` to serve their respective purposes. You can simply run `python -m blogman` and place your Markdown blog files in the `md/` directory.

As-is, this configuration may not be ideal for you. If this is the case, all you have to do is configure the directory and file paths in `__init__.py` to fit your needs.

You can also modify the HTML templates and the CSS styling to your liking. Just make sure you're correctly using the placeholder comments in your HTML templates.

### Warnings

This is **NOT** a complete project. In fact, it's very new. Expect bugs and limited functionality.

### License

This project uses the MIT License. The license text is in the `LICENSE` file.
