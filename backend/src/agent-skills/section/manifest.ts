import type { SkillManifest } from '../../agent-runtime/types.js';

export const manifest: SkillManifest = {
  id: 'section',
  domain: 'geometry-input',
  structureType: 'frame',
  name: { zh: '全能截面设计', en: 'All-Purpose Section Designer' },
  description: {
    zh: '支持工字钢/矩形/箱形/圆管/槽钢，智能提取参数，自动补全，生成可分析结构模型',
    en: 'I-beam/Rectangle/Box/Pipe/Channel, auto-extract, auto-complete, analyzable model'
  },
  triggers: ['截面','工字钢','矩形','箱形','圆管','槽钢','型材','钢框架','section','I-beam'],
  stages: ['intent','draft','design','analysis'],
  autoLoadByDefault: true,
  scenarioKeys: ['frame','beam','truss','portal-frame'],
  capabilities: ['section.generate','section.calc','section.complete','model.build','validate_model', 'run_analysis'],
  priority: 200,
  requires: [],
  conflicts: [],
  compatibility: { minRuntimeVersion: '0.1.0', skillApiVersion: 'v1' }
};

export default manifest;