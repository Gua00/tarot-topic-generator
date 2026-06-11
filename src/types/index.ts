export type Category =
  | '爱情'
  | '事业'
  | '学业'
  | '财运'
  | '复合/前任'
  | '人际关系'
  | '运势预测'
  | '通用';

export type ColorTag =
  | '白色'
  | '橙色'
  | '黑色'
  | '粉色'
  | '蓝色'
  | '紫色'
  | '绿色'
  | '黄色'
  | '青色'
  | '红色'
  | '中性';

export interface Topic {
  id: string;
  title: string;
  category: Category;
  colorTag: ColorTag;
  hotness: number;
  upMaster: string;
  isNeutral: boolean;
  source: 'builtin' | 'user' | 'bilibili';
}

export interface TopicsData {
  version: string;
  updated: string;
  topics: Topic[];
}

export interface ColorInfo {
  name: string;
  label: string;
  emotion: string;
  description: string;
  example: string;
  cssVar: string;
  hex: string;
}

export const COLOR_MAP: Record<Exclude<ColorTag, '中性'>, ColorInfo> = {
  '白色': {
    name: '白色',
    label: '极简/纯粹',
    emotion: '纯粹',
    description: '简单、直接、纯粹的话题',
    example: '他今天会联系我吗？',
    cssVar: '--accent-white',
    hex: '#e8e0d8',
  },
  '橙色': {
    name: '橙色',
    label: '乐观/积极',
    emotion: '积极',
    description: '充满希望、正能量、行动力的话题',
    example: '如何提升个人魅力？',
    cssVar: '--accent-orange',
    hex: '#d4946a',
  },
  '黑色': {
    name: '黑色',
    label: '沉重/深度',
    emotion: '深度',
    description: '深度反思、阴暗面、危机话题',
    example: '这段关系里隐藏的危机是什么？',
    cssVar: '--accent-black',
    hex: '#5d4e37',
  },
  '粉色': {
    name: '粉色',
    label: '浪漫/情感',
    emotion: '情感',
    description: '恋爱、暧昧、人际关系等感性话题',
    example: '我们之间会有进一步发展吗？',
    cssVar: '--accent-pink',
    hex: '#c4877b',
  },
  '蓝色': {
    name: '蓝色',
    label: '理性/事业',
    emotion: '理性',
    description: '工作、学业、逻辑分析、客观规划',
    example: '这次跳槽是正确选择吗？',
    cssVar: '--accent-blue',
    hex: '#6d8a9e',
  },
  '紫色': {
    name: '紫色',
    label: '神秘/灵性',
    emotion: '灵性',
    description: '潜意识、前世今生、灵性成长、直觉指引',
    example: '宇宙现在想对我说什么？',
    cssVar: '--accent-purple',
    hex: '#8b6b9e',
  },
  '绿色': {
    name: '绿色',
    label: '治愈/健康',
    emotion: '治愈',
    description: '疗愈、身心状态、自我和解、财运',
    example: '如何才能与自己和解？',
    cssVar: '--accent-green',
    hex: '#7a9a7a',
  },
  '黄色': {
    name: '黄色',
    label: '活力/社交',
    emotion: '活力',
    description: '沟通、合作、考试、短期目标',
    example: '这次考试需要注意什么？',
    cssVar: '--accent-yellow',
    hex: '#c4a44a',
  },
  '青色': {
    name: '青色',
    label: '平静/过渡',
    emotion: '平静',
    description: '等待、顺其自然、情绪平复',
    example: '顺其自然是最好的选择吗？',
    cssVar: '--accent-teal',
    hex: '#6b9e9e',
  },
  '红色': {
    name: '红色',
    label: '激情/冲突',
    emotion: '冲突',
    description: '强烈感情、冲突、决断、突发事件',
    example: '我该做出这个决断吗？',
    cssVar: '--accent-red',
    hex: '#a0524a',
  },
};

export const UP_MASTERS = [
  '龙女塔罗',
  '丝瓜舅舅',
  'Venus塔罗',
  '酒友Tarot',
  '李奶奶塔罗',
  '小瓜-顶呱呱的瓜',
  '神奇的C总',
  'Sophie天使疗愈',
  '月亮上的白房子',
  'Tarot塔罗喵',
  '灵性占卜师Eva',
  '塔罗师小野',
  '神秘学研究所',
  '阿卡西记录者',
  '星尘塔罗馆',
] as const;

export const CATEGORIES: Category[] = [
  '爱情',
  '事业',
  '学业',
  '财运',
  '复合/前任',
  '人际关系',
  '运势预测',
  '通用',
];

export const COLOR_TAGS: Exclude<ColorTag, '中性'>[] = [
  '白色', '橙色', '黑色', '粉色', '蓝色', '紫色', '绿色', '黄色', '青色', '红色',
];

export const COLOR_NEIGHBORS: Record<Exclude<ColorTag, '中性'>, ColorTag[]> = {
  '白色': ['白色', '青色', '黄色'],
  '橙色': ['橙色', '黄色', '红色'],
  '黑色': ['黑色', '紫色', '蓝色'],
  '粉色': ['粉色', '红色', '紫色'],
  '蓝色': ['蓝色', '青色', '紫色'],
  '紫色': ['紫色', '蓝色', '粉色'],
  '绿色': ['绿色', '青色', '黄色'],
  '黄色': ['黄色', '橙色', '绿色'],
  '青色': ['青色', '蓝色', '绿色'],
  '红色': ['红色', '橙色', '粉色'],
};

export const DEFAULT_COLOR_TAG: Exclude<ColorTag, '中性'> = '紫色';
