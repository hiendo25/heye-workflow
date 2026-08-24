# -*- coding: utf-8 -*-
import os, sys, importlib
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import gendoc as g
import part1, part2, part3, part4, part5

part1.build(g)
part2.build(g)
part3.build(g)
part4.build(g)
part5.build(g)

os.makedirs(os.path.dirname(g.OUT), exist_ok=True)
g.doc.save(g.OUT)
print("Da tao:", g.OUT)
print("So doan:", len(g.doc.paragraphs), "| So bang:", len(g.doc.tables))
