# -*- coding: utf-8 -*-
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import gendoc as g
import r1, r2

r1.build(g)
r2.build(g)

os.makedirs(os.path.dirname(g.OUT), exist_ok=True)
g.doc.save(g.OUT)
print("Da tao:", g.OUT)
print("So doan:", len(g.doc.paragraphs), "| So bang:", len(g.doc.tables))
