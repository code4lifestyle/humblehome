"""Print every CSS rule (with its @media context) that targets an Elementor element or a class in the ORIGINAL site.

Usage:
    python tools/css-of.py <needle> [--in <file-name-substring>] [--max 60]

<needle> examples
    9c15f22             → matches ".elementor-element-9c15f22 …" (the 7-char id is in every element's class list
                          in the original HTML, e.g. class="elementor-element elementor-element-9c15f22 …")
    category-item-slider→ matches any selector containing that class name (theme classes: team-item, section-title …)

Searched: ../wp-content/uploads/elementor/css/*.css (per-template Elementor styles, incl. header 148 / footer 153),
          ../wp-content/themes/livora/style*.css, ../wp-content/themes/livora/assets/css/woo*.css,
          ../wp-content/plugins/*/**/assets/css (only with --in <name>).
Tip: find the element id first with  python tools/condense.py ../about-us/index.html  (or Grep the original HTML).
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent  # the mirror root (parent of livora-angular)

args = sys.argv[1:]
if not args:
    print(__doc__)
    sys.exit(1)
needle = args[0]
only = None
limit = 60
if '--in' in args:
    only = args[args.index('--in') + 1]
if '--max' in args:
    limit = int(args[args.index('--max') + 1])

pattern = needle if needle.startswith(('.', '#')) else needle
needle_re = re.compile(re.escape(pattern))

files = sorted((ROOT / 'wp-content' / 'uploads' / 'elementor' / 'css').glob('*.css'))
files += sorted((ROOT / 'wp-content' / 'themes' / 'livora').glob('style*.css'))
files += sorted((ROOT / 'wp-content' / 'themes' / 'livora' / 'assets' / 'css').glob('woo*.css'))
if only:
    files = [f for f in files if only in f.name] or sorted(ROOT.glob(f'wp-content/**/*{only}*.css'))


def strip_comments(s: str) -> str:
    return re.sub(r'/\*.*?\*/', '', s, flags=re.S)


def parse_blocks(css: str, media: str = ''):
    """Yield (media, selector, body) for every style rule, descending into @media/@supports."""
    i, n = 0, len(css)
    while i < n:
        j = css.find('{', i)
        if j == -1:
            break
        head = css[i:j].strip()
        depth, k = 1, j + 1
        while k < n and depth:
            if css[k] == '{':
                depth += 1
            elif css[k] == '}':
                depth -= 1
            k += 1
        body = css[j + 1:k - 1]
        if head.startswith('@media') or head.startswith('@supports'):
            yield from parse_blocks(body, head)
        elif head.startswith('@'):
            pass  # @font-face, @keyframes … skip
        else:
            yield media, head, body.strip()
        i = k


count = 0
for f in files:
    text = strip_comments(f.read_text(encoding='utf-8', errors='replace'))
    hits = [(m, s, b) for m, s, b in parse_blocks(text) if needle_re.search(s)]
    if not hits:
        continue
    print(f'\n===== {f.relative_to(ROOT)}')
    for media, sel, body in hits:
        if count >= limit:
            print(f'… truncated at --max {limit}')
            sys.exit(0)
        count += 1
        prefix = f'{media} {{ ' if media else ''
        suffix = ' }' if media else ''
        props = ' '.join(body.split())
        print(f'{prefix}{sel} {{ {props} }}{suffix}')
if count == 0:
    print('no rules found for', needle)
