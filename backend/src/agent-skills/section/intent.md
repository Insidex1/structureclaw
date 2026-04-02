---
id: section
domain: geometry-input
structureType: frame
version: 2.0.0
source: builtin
zhName: 全能截面设计
enName: All-Purpose Section Designer
zhDescription: 智能识别并生成工字钢、矩形、箱形、圆管、槽钢截面，自动提取参数，缺失项自动补全并交互确认，生成可直接分析的结构模型
enDescription: Generate I-beam, rectangle, box, pipe, channel sections; auto-extract parameters, complete missing data, generate analyzable structural models
triggers: [截面,工字钢,矩形,箱形,圆管,槽钢,型材,钢框架,截面设计,section,I-beam,rectangle,box,pipe,channel]
stages: [intent,draft,design,analysis]
autoLoadByDefault: true
capabilities: [section.generate,section.calc,section.complete,model.build]
priority: 200
requires: []
conflicts: []
compatibility:
  minRuntimeVersion: "0.1.0"
  skillApiVersion: "v1"
---

# 截面设计
## 中文说明
支持工字钢、矩形、箱形等截面参数化生成，自动计算截面面积、惯性矩等核心力学属性，适配所有结构类型。

## English Instruction
Support parametric generation of all section types (I-beam, rectangle, box, etc.), automatically calculate core mechanical properties.