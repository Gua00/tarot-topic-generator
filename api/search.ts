import type { VercelRequest, VercelResponse } from '@vercel/node';

// 简易内存缓存 (Vercel serverless 实例存活期间有效)
const cache = new Map<string, { data: any; ts: number }>();
const CACHE_TTL = 2 * 60 * 60 * 1000; // 2 小时

// 情绪标签自动分类规则：标题中包含哪些词 → 属于哪种颜色
const EMOTION_RULES: [string[], string][] = [
  [['爱', '喜欢', '暗恋', '暧昧', '表白', '心动', '恋爱', '感情', '情感', '甜蜜', '浪漫', '约会', '牵手', '恋人', '情侣', '男朋友', '女朋友', '老公', '老婆', '相亲', '脱单', '桃花', '姻缘', '婚姻', '结婚', '正缘', 'soulmate', 'crush'], '粉色'],
  [['工作', '面试', '跳槽', '升职', '加薪', '职业', '事业', '职场', '老板', '领导', '同事', '公司', '岗位', '简历', 'offer', '转行', '副业', '辞职', '离职', '裁员', '年终奖', '考核', '晋升', '涨薪', '上班', '打工'], '蓝色'],
  [['考试', '学习', '学业', '考研', '考公', '考编', '考证', '成绩', '论文', '毕业', '升学', '留学', '学校', '专业', '课程', '导师', '录取', '高考', '期末', '复习', '读书', '背', '做题', '答辩', '学分'], '蓝色'],
  [['钱', '财', '财运', '收入', '投资', '理财', '经济', '存钱', '挣钱', '赚钱', '穷', '消费', '买', '支出', '进账', '负债', '债务', '花销', '省', '资产', '基金', '股票', '收益', '亏', '涨', '薪水', '工资', '花呗'], '绿色'],
  [['灵魂', '前世', '今生', '宇宙', '高我', '灵性', '冥想', '直觉', '梦境', '脉轮', '能量', '频率', '振动', '显化', '阿卡西', '天使', '守护灵', '命运', '因果', '业力', '轮回', '星际', '平行', '神秘', '占星', '星盘', '塔罗', '指引', '智慧', '觉醒', '意识', '超感', '通灵', '直觉力', '灵媒', '使命'], '紫色'],
  [['治愈', '疗愈', '和解', '爱自己', '焦虑', '创伤', '平和', '平静', '健康', '身体', '身心', '放松', '安眠', '睡眠', '情绪释放', '自我和解', '放下', '原谅', '接纳', '释怀', '安全感', '内在小孩', '正念', '休息'], '绿色'],
  [['沟通', '社交', '朋友', '人脉', '关系', '合作', '合伙', '团队', '聚会', '旅行', '出行', '活动', '表达', '说话', '聊天', '人际', '闺蜜', '兄弟', '同学'], '黄色'],
  [['冲突', '矛盾', '决断', '爆发', '吵', '愤怒', '激烈', '冲动', '决裂', '翻脸', '撕', '对抗', '竞争', '挑战', '冒险', '赌', '拼命', '爆发力', '突破', '打破', '无畏', '勇气', '背水一战', '奋不顾身', '激烈', '极端'], '红色'],
  [['等待', '顺其自然', '过渡', '沉静', '安静', '冷静', '静观', '平复', '放缓', '暂停', '沉寂', '放下', '慢', '耐心', '体悟', '体会', '随风', '顺流', '接纳', '适应', '转变', '过渡期', '转折', '沉淀', '积累', '蓄力'], '青色'],
  [['今天', '明天', '简单', '直接', '是不是', '会不会', '能不能', '是或否', '是否', '答案', '对吗', '对吗', '准吗', '好运', '运气'], '白色'],
  [['希望', '积极', '正能量', '提升', '信心', '自信', '变好', '美好', '开心', '快乐', '好运', '惊喜', '礼物', '机遇', '行动', '主动', '出发', '启程', '新生', '开始', '重启', '崭新', '阳光', '希望'], '橙色'],
  [['危机', '黑暗', '秘密', '隐瞒', '恐惧', '恐惧症', '阴影', '创伤', '逃避', '执念', '绝望', '困', '低谷', '最坏', '阴暗', '重蹈覆辙', '真相', '现实', '结束', '最深处', '深层', '隐情', '谎言', '欺骗'], '黑色'],
];

function classifyEmotion(title: string): string {
  for (const [keywords, color] of EMOTION_RULES) {
    if (keywords.some((kw) => title.includes(kw))) return color;
  }
  return '中性';
}

// 标题清洗正则：去掉【】前缀、UP主名字、接好运等无关内容
function cleanTitle(raw: string): string {
  let cleaned = raw
    .replace(/【[^】]*】/g, '')           // 去掉【xxx】
    .replace(/\[[^\]]*\]/g, '')           // 去掉[xxx]
    .replace(/大众占卜[:：]?/g, '')
    .replace(/互动视频/g, '')
    .replace(/点赞.*?好运/g, '')
    .replace(/三连.*/g, '')
    .replace(/（[^）]*接[^）]*）/g, '')    // 去掉（点赞接好运）
    .replace(/关注[^，。！？]*/g, '')
    .replace(/\/\/.*$/, '')               // 去掉//后面的
    .replace(/\s+/g, ' ')
    .trim();

  // 如果清洗后太短（< 4个字），保留原标题
  if (cleaned.length < 4) cleaned = raw.replace(/【[^】]*】/g, '').trim();
  if (cleaned.length < 4) cleaned = raw.trim();
  if (cleaned.length > 80) cleaned = cleaned.slice(0, 80) + '…';

  return cleaned;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const keyword = (req.query.keyword as string) || '塔罗占卜';
  const upFilter = (req.query.up as string) || '';
  const page = parseInt((req.query.page as string) || '1', 10);

  const cacheKey = `${keyword}|${upFilter}|${page}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return res.json({ ...cached.data, cached: true });
  }

  try {
    // 调用B站搜索API — 有UP主时加入UP主名提升精准度
    const searchQuery = upFilter
      ? `${upFilter} ${keyword} 塔罗占卜`
      : `${keyword} 塔罗占卜`;
    const searchUrl = new URL('https://api.bilibili.com/x/web-interface/search/type');
    searchUrl.searchParams.set('search_type', 'video');
    searchUrl.searchParams.set('keyword', searchQuery);
    searchUrl.searchParams.set('page', String(page));
    searchUrl.searchParams.set('page_size', '50');
    searchUrl.searchParams.set('order', 'click');

    const response = await fetch(searchUrl.toString(), {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        Referer: 'https://www.bilibili.com/',
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`B站 API 返回 ${response.status}`);
    }

    const data = await response.json();

    if (data.code !== 0) {
      throw new Error(`B站 API 错误: ${data.message}`);
    }

    const rawVideos = data.data?.result || [];

    // 清洗 + 分类
    const topics = rawVideos
      .map((v: any) => {
        const rawTitle = v.title || '';
        const cleaned = cleanTitle(rawTitle);
        const upMaster = v.author || '';
        // bvid 是精确的视频ID；极少数旧视频可能没有bvid，用aid兜底
        const videoId = v.bvid || (v.aid ? `av${v.aid}` : null);
        if (!videoId) return null;
        return {
          id: 'b_' + videoId,
          title: cleaned,
          category: '通用' as const,
          colorTag: classifyEmotion(cleaned),
          hotness: v.play || v.video_review || 0,
          upMaster,
          isNeutral: false,
          source: 'bilibili' as const,
        };
      })
      .filter(Boolean)
      .filter((t: any) => t.title.length >= 4)
      .filter((t: any) => {
        // 如果指定了UP主，只保留匹配的
        if (!upFilter) return true;
        const ups = upFilter.split(',').map((u) => u.trim());
        return ups.some((u) => t.upMaster.includes(u));
      });

    const result = {
      topics,
      total: topics.length,
      keyword,
      page,
      fromCache: false,
    };

    // 存入缓存
    cache.set(cacheKey, { data: result, ts: Date.now() });

    return res.json(result);
  } catch (error: any) {
    console.error('B站搜索失败:', error.message);
    // 返回空结果，由前端降级到本地库
    return res.json({
      topics: [],
      total: 0,
      keyword,
      error: error.message,
      fromCache: false,
    });
  }
}
