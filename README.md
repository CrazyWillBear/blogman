![Static Badge](https://img.shields.io/badge/version-0.0.3_beta-blue)
![GitHub License](https://img.shields.io/github/license/CrazyWillBear/blogman)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/83d6bd3faf7e4d6eb52b9eadb909b84d)](https://app.codacy.com/gh/CrazyWillBear/blogman/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade)
![Python package](https://github.com/CrazyWillBear/blogman/actions/workflows/python-package.yml/badge.svg)

# Blogman

Blogman is a blog managing software that allows posts to be written in Markdown and displayed on the web. You configure
your Markdown directory, which is where you place your blog posts written in Markdown. Blogman lists those on a homepage
and renders each blog when visited. Blogman also supports tagging your posts, which is explained later.

### Screenshots:
<img src="https://i.imgur.com/DTgdgCe.png" alt="Screenshot 1" width="510" height="300"/>
<img src="https://i.imgur.com/IYX7ngT.png" alt="Screenshot 2" width="510" height="300"/>

### How it works:

In the `__init__.py` file, you configure directory and file paths for a few things, but the most important are:

- Your blog name and description
- File and directory configurations. This includes:
  - Your blog directory, where blog JSON files are stored
  - Your Markdown directory, where blog posts written in Markdown are stored
  - Your style sheet
- Your default `<head>` section for webpages

The program works by monitoring changes in the Markdown directory. When detected, it acts accordingly by updating a
blog's JSON file. Those blogs are then listed on the homepage, sortable by date created or date last modified and
searchable by content, title, and/or tag(s).

### How to use it:

- As-is!

The directories `blogs/` and `md/` as well as the stylesheet in `css/style.css` are pre-configured in `__init__.py` to
serve their respective purposes. You can simply run `python -m blogman` and place your Markdown blog files in the `md/`
directory. Just be sure to configure your blog name and description. I've left a sample 'blog', titled `Leaving The
Forest.md` and its accompanying JSON file.

- Customize it!

As-is, this configuration may not be ideal for you. If this is the case, all you have to do is configure the directory
and file paths in `__init__.py` to fit your needs. If you want to edit the HTML itself, go into the `*Builder.py` files
and configure freely.

### How to write a blog in Markdown:

You can follow standard markdown practices and even include basic HTML in your post. The only extra information you need
to know is in regard to *tagging*.

You can add tags to your post by using `{tag_1}...{tag_n}` at the top of your Markdown file. Tags aren't required.

Here are some examples:
```markdown aiignore
{tag}{tag2}
# My Blog

This is an example of a blog!
```

```markdown aiignore
# My Other Blog

I can add
<br />
some HTML!
```

### License

This project uses the MIT License. The license text is in the `LICENSE` file.
