# File writer helper
import sys, os
sys.stdout.reconfigure(encoding='utf-8')
Q = "
SQ = '
NL = '\n'
BASE = 'D:/AI try/vibe coding/人生/弹幕机/client/src'

def w(relpath, content):
    full = os.path.join(BASE, relpath)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, 'w', encoding='utf-8') as f:
        f.write(content)
    print('wrote ' + relpath)

# File contents below

# === App.tsx ===
w('App.tsx', '')
