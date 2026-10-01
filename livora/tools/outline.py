import re, sys
from html.parser import HTMLParser

class O(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.out=[]; self.skip=0; self.buf=''; self.stack=[]
        self.in_body=False
    def flush(self):
        t=re.sub(r'\s+',' ',self.buf).strip()
        if t: self.out.append(t)
        self.buf=''
    def handle_starttag(self, tag, attrs):
        a=dict(attrs)
        if tag=='body': self.in_body=True
        if not self.in_body: return
        if tag in ('script','style','svg','noscript','template'):
            self.skip+=1; return
        if self.skip: return
        cls=a.get('class','')
        if tag in ('h1','h2','h3','h4','h5','h6'):
            self.flush(); self.buf=f'[{tag}] '
        elif tag=='a':
            self.buf+=f'<a href="{a.get("href","")}">'
        elif tag=='img':
            self.flush(); self.out.append(f'(img {a.get("src","")} alt="{a.get("alt","")}")')
        elif tag in ('p','li','button','label','td','th','tr','section','form','input','select','textarea','option'):
            self.flush()
            if tag in ('input','select','textarea','form'):
                self.out.append(f'<{tag} '+' '.join(f'{k}="{v}"' for k,v in a.items() if k in ('type','name','placeholder','action','method','value','id'))+'>')
        elif tag in ('div',):
            # mark major elementor widget boundaries
            m=re.search(r'elementor-widget-([a-z0-9_-]+)', cls)
            if m and 'elementor-widget-container' not in m.group(0):
                self.flush(); self.out.append(f'--- widget:{m.group(1)}')
    def handle_endtag(self, tag):
        if tag in ('script','style','svg','noscript','template'):
            if self.skip: self.skip-=1
            return
        if self.skip or not self.in_body: return
        if tag=='a': self.buf+='</a>'
        if tag in ('h1','h2','h3','h4','h5','h6','p','li','button','td','th','label'):
            self.flush()
    def handle_data(self, data):
        if self.skip or not self.in_body: return
        self.buf+=data

p=sys.argv[1]
h=open(p,encoding='utf-8',errors='replace').read()
o=O(); o.feed(h); o.flush()
res='\n'.join(o.out)
if len(sys.argv)>2:
    open(sys.argv[2],'w',encoding='utf-8').write(res); print(len(res),'chars')
else:
    print(res)
