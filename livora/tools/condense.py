import re, sys
p = sys.argv[1]
html = open(p, encoding='utf-8', errors='replace').read()
m = re.search(r'<body[^>]*>(.*)</body>', html, re.S|re.I)
body = m.group(1) if m else html
body = re.sub(r'<script\b.*?</script>', '', body, flags=re.S|re.I)
body = re.sub(r'<style\b.*?</style>', '', body, flags=re.S|re.I)
body = re.sub(r'<svg\b.*?</svg>', '<svg/>', body, flags=re.S|re.I)
body = re.sub(r'<!--.*?-->', '', body, flags=re.S)
# drop noisy attributes
body = re.sub(r'\s(data-[a-z0-9_-]+|style|srcset|sizes|decoding|loading|fetchpriority|width|height|aria-[a-z-]+|role|tabindex|itemprop|itemscope|itemtype)="[^"]*"', '', body)
body = re.sub(r'\s+', ' ', body)
body = re.sub(r'>\s*<', '>\n<', body)
out = sys.argv[2] if len(sys.argv) > 2 else None
if out:
    open(out, 'w', encoding='utf-8').write(body)
    print(len(body), 'chars ->', out)
else:
    print(body)
