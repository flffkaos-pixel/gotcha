import re, os
with open(r'C:\Users\중진공39\utilities_work\utilities\100days.html','r',encoding='utf-8') as f:
    s = f.read()
print('=== ALL INTERNAL SCRIPTS ===')
n = 0
for m in re.finditer(r'<script(?![^>]*\bsrc=)[^>]*>(.*?)</script>', s, re.S):
    body = m.group(1).strip()
    if body:
        n += 1
        print(f'--- SCRIPT #{n} ({len(body)} chars) ---')
        print(body[:500])
        print('...')
print('TOTAL:', n)
