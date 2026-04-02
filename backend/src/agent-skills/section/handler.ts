import type {
  SkillHandler,
  SkillDetectionInput,
  ScenarioMatch,
  DraftExtraction,
  SkillDraftContext,
  DraftState,
  SkillMissingResult,
  InteractionQuestion
} from '../../agent-runtime/types.js';
import type { AppLocale } from '../../services/locale.js';

// 类型定义（严格约束）
type SectionType = 'i-beam' | 'rectangle' | 'box' | 'pipe' | 'channel';
interface SectionGeometry {
  h?: number; b?: number; tw?: number; tf?: number; r?: number; d?: number; t?: number;
}

// 国标默认截面
const DEFAULT_SECTIONS: Record<SectionType, SectionGeometry> = {
  'i-beam':   { h: 400, b: 200, tw: 8, tf: 13, r: 16 },
  'rectangle':{ h: 400, b: 200 },
  'box':      { h: 400, b: 200, t: 12 },
  'pipe':     { d: 219, t: 8 },
  'channel':  { h: 400, b: 100, tw: 8, tf: 12 }
};

// 标准Q355钢材
const MATERIAL_Q355 = {
  id: 'mat-q355', type: 'steel', name: 'Q355',
  density: 7850, elasticModulus: 206000, poissonRatio: 0.3, yieldStrength: 355
};

export class SectionSkillHandler implements SkillHandler {
  // 场景识别
  detectScenario(input: SkillDetectionInput): ScenarioMatch | null {
    const { message, locale = 'zh' } = input;
    const txt = message.toLowerCase();
    const keywords = ['截面','工字钢','矩形','箱形','圆管','槽钢','section'];
    
    if (!keywords.some(k => txt.includes(k))) return null;

    let key: ScenarioMatch['key'] = 'frame';
    if (txt.includes('桁架')) key = 'truss';
    if (txt.includes('门架')) key = 'portal-frame';

    return {
      key,
      mappedType: key,
      skillId: 'section',
      supportLevel: 'supported',
      supportNote: locale === 'zh' ? '截面技能已激活' : 'Section Skill Ready'
    };
  }

  // 参数解析
  parseProvidedValues(values: Record<string, unknown>): DraftExtraction {
    const msg = String(values.message || '').toLowerCase();
    let type: SectionType = 'i-beam';

    if (msg.includes('矩形')) type = 'rectangle';
    if (msg.includes('箱形')) type = 'box';
    if (msg.includes('圆管')) type = 'pipe';
    if (msg.includes('槽钢')) type = 'channel';

    const geo = { ...DEFAULT_SECTIONS[type] };
    return {
      skillId: 'section',
      inferredType: 'frame',
      scenarioKey: 'frame',
      type,
      geo
    };
  }

  // 草稿提取
  extractDraft(ctx: SkillDraftContext): DraftExtraction {
    return {
      skillId: 'section',
      inferredType: 'frame',
      scenarioKey: ctx.scenario.key
    };
  }

  // 状态合并
  mergeState(prev: DraftState | undefined, patch: DraftExtraction): DraftState {
  // 初始化默认值，确保包含 DraftState 所有必填属性
  const defaultState: DraftState = {
    inferredType: 'frame',
    scenarioKey: 'frame',
    skillId: 'section',
    updatedAt: Date.now()
  };

  // 合并：默认值 → 原有状态 → 新补丁（优先级递增）
  return {
    ...defaultState,
    ...prev,
    ...patch,
    updatedAt: Date.now() // 强制更新时间戳
  };
}

  // 缺失字段检查
  computeMissing(state: DraftState): SkillMissingResult {
    return { critical: [], optional: [] };
  }

  // 标签映射
  mapLabels(keys: string[]): string[] {
    return keys;
  }

  // 交互问题（官方标准格式）
  buildQuestions(): InteractionQuestion[] {
    return [];
  }

    // 生成完整可分析模型（修复版）
  buildModel(state: DraftState) {
    const type = (state.type as SectionType) || 'i-beam';
    const geo = { ...DEFAULT_SECTIONS[type], ...(state.geo as SectionGeometry || {}) };
    const secId = `sec-${Date.now()}`;
    const elementId = 'e1'; // 明确单元ID，用于自重荷载绑定

    return {
      id: `model-${Date.now()}`,
      schemaVersion: '1.0.0',
      units: { length: 'mm', force: 'N' },
      name: `截面模型`,
      materials: [MATERIAL_Q355],
      sections: [{ id: secId, type, material: MATERIAL_Q355.id, geometry: geo }],
      nodes: [
        { id: 'n1', x: 0, y: 0, z: 0 },
        { id: 'n2', x: 6000, y: 0, z: 0 }
      ],
      elements: [{
        id: elementId,
        type: 'beam',
        nodes: ['n1', 'n2'],
        material: MATERIAL_Q355.id,
        section: secId
      }],
      boundaryConditions: [
        { id: 'bc1', node: 'n1', type: 'fixed' },
        { id: 'bc2', node: 'n2', type: 'hinge' }
      ],
      // ✅ 修复：严格符合校验规则的荷载定义
      loadCases: [
        { 
          id: 'lc1', 
          name: '自重', 
          type: 'dead', 
          elements: [elementId] // 明确指定自重作用的单元
        },
        { 
          id: 'lc2', 
          name: '节点荷载', 
          type: 'static',
          nodeLoads: [
            { node: 'n2', fx: 0, fy: -10000, fz: 0 }
          ]
        }
      ],
      loadCombinations: [
        {
          id: 'comb1',
          type: 'ultimate',
          factors: [
            { loadCase: 'lc1', factor: 1.35 }, // 分项系数只在组合里定义
            { loadCase: 'lc2', factor: 1.5 }
          ]
        }
      ],
      meta: { tip: "截面模型生成完成，荷载定义符合规范，可直接执行分析" }
    };
  }
}

export const handler = new SectionSkillHandler();
export default handler;