# Blogman
![Static Badge](https://img.shields.io/badge/version-1.0.0-blue)
![GitHub License](https://img.shields.io/github/license/CrazyWillBear/blogman)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/83d6bd3faf7e4d6eb52b9eadb909b84d)](https://app.codacy.com/gh/CrazyWillBear/blogman/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade)
![Python package](https://github.com/CrazyWillBear/blogman/actions/workflows/python-package.yml/badge.svg)

<!-- TOC -->
* [Blogman](#blogman)
  * [Summary](#summary)
  * [Quickstart](#quickstart)
  * [Configuration guide](#configuration-guide)
    * [Name + description](#name--description)
    * [Files + directories](#files--directories)
    * [Misc.](#misc)
  * [How to write a blog in Markdown](#how-to-write-a-blog-in-markdown)
    * [Markdown guide](#markdown-guide)
    * [Tags](#tags)
    * [Pinning](#pinning)
    * [HTML](#html)
    * [Examples](#examples)
  * [Screenshots](#screenshots)
    * [Screenshot 1](#screenshot-1)
    * [Screenshot 2](#screenshot-2)
  * [How it works](#how-it-works)
  * [License](#license)
    * [MIT License](#mit-license)
<!-- TOC -->

## Summary

Blogman is a blog managing software that allows posts to be written in Markdown and displayed on the web. You configure
your Markdown directory, which is where you place your blog posts written in Markdown. Blogman lists those on a homepage
and renders each blog when visited. Blogman also supports tagging your posts, which is explained later.

## Quickstart

Clone the repository and run `pip install -r requirements.txt` followed by `python -m blogman`.
Then, just drop your blog posts into the `md/` directory. In deployment, it's recommended that you use [Gunicorn](https://gunicorn.org/)
or [Waitress](https://pypi.org/project/waitress/) for Windows.

## Configuration guide

Blogman is meant to be configured, and you can do so in the `blogman/__init__.py` file.

### Name + description

- `BLOG_NAME`: This is your blog's name. It will display on your homepage above your blogs.
- `BLOG_DESCRIPTION`: This is your blog's description. It will display below your blog's name on the homepage.

### Files + directories

- `BASE_DIR`: This is the parent directory of the following config options:
  - `BLOG_DIR`: This is where blog JSON files will be generated and stored.
  - `MD_DIR`: This is where your blog post Markdown files will go.
  - `CSS_DIR`: This is where you should place your CSS stylesheet. If you'd rather just hardcode the path to your style
sheet, you can do so using the following variable.
  - `STYLE_SHEET_PATH`: This is the path to your style sheet (.css file).
  - `FAVICON_ICO_PATH`: This is the path to whatever `.ico` you wish to use (this is the image that displays next to the
page title in a browser's tab).

### Misc.

- `HEAD_DEFAULTS`: You can just leave this as-is, unless you have a specific `<head>` you wish to use.
- `GH` + `VERSION`: These are not meant to be configured, but technically can be for whatever reason.

## How to write a blog in Markdown

### Markdown guide

This isn't a guide to Markdown, but [this is](https://www.markdownguide.org/). There are a couple things to keep in mind
that are additional/supplemental to standard Markdown.

### Tags

Tags are optional, but helpful. The homepage's search feature will compare the search query against tags. Thus, tags
serve as searchable categories within your blog.

You can add tags to your post by using the form `{tag_1}...{tag_n}` at the top of your Markdown file. There should be no
spaces between your tags and they should all be on one line, the top line of the Markdown file.

### Pinning

If you'd like to pin a post, add the tag `{pinned}` to your Markdown.

### HTML

You can write HTML in your Markdown file and have it render.

### Examples

```markdown aiignore
{tag}{tag2}
# My Blog

This is an example of a blog!
```

```markdown aiignore
{pinned}
# My Other Blog

I can add
<br />
some HTML!
```

## Screenshots

### Screenshot 1

<img src="https://i.imgur.com/K64awkB.png" alt="Screenshot 1" width="535" height="500"/>

### Screenshot 2

<img src="https://i.imgur.com/AWf8s1s.png" alt="Screenshot 2" width="715" height="500"/>

## How it works

The program works by monitoring changes in the Markdown directory. When detected, it acts accordingly by updating a
blog's JSON file. Those blogs are then listed on the homepage, sortable by date created or date last modified and
searchable by content, title, and/or tag(s).

## License

### MIT License

This project uses the MIT License. The license text is in the `LICENSE` file.
