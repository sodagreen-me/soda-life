# 苏打人生 (soda-life) - 项目设计文档

## 项目概述

**苏打人生** 是一款网页互动游戏（人生模拟器），玩家以苏打绿乐队成员的视角，经历他们人生中的关键事件，做出选择，体验不同的人生分支。

## 核心设计

### 基本信息

| 维度 | 方案 |
|------|------|
| 类型 | 网页互动游戏 - 明星人生模拟器 |
| 视角 | 随机扮演苏打绿成员（V1 先做吴青峰线） |
| 原型 | 苏打绿/吴青峰真实经历 (1982-2026) |
| 视觉风格 | 像素风美术资源 |
| 交互方式 | 视觉小说式（静态像素场景图 + 文字 + 选择） |
| 核心机制 | 选择驱动，隐藏概率系统，无属性/天赋系统 |
| 事件范围 | 几十个关键人生事件（出生至今） |
| 存档 | localStorage 本地存档 |
| 部署 | 静态托管 (Vercel/Netlify) |

### 游戏机制

- **事件图（Event Graph）**：游戏由一系列事件组成，每个事件包含若干选择，每个选择指向下一个事件。形成 **事件 → 选择 → 事件** 的链式结构。
- **事件类型**：
  - **决策事件**：有 2-3 个有意义的选择，影响后续走向
  - **结论事件**：某个选择的直接结果，通常只有【继续】一个选项
  - **纯叙述事件**：推动叙事的事件，只有【继续】一个选项
- **选择驱动**：每个选择影响当前事件结局、设置 flags、影响后续事件触发概率
- **隐藏概率**：概率系统对玩家不可见，玩家只看到选择和结果
- **固定锚点事件**：大部分事件高概率触发，贴合明星真实人生
- **无属性系统**：不使用天赋、数值等属性机制

### 设计原则

- **不引导"正确"人生**：游戏是体验不同人生的工具，不是复刻真实轨迹的纪录片。每个选择都应是真正有意义的分支，不应暗示哪个选择是"对的"。即使偏离真实人生，也应该是一条完整、有趣的体验路径。
- **真实人生是高概率但非唯一路径**：贴合真实的路线只是概率较高的一种可能，玩家完全可以通过选择走向截然不同的人生。
- **每条分支都值得体验**：无论是贴近真实还是完全偏离，每条分支都应有精心设计的剧情和结局。

### 角色系统

- 玩家被随机分配扮演苏打绿六位成员之一
- 每位成员有独立的故事线，共享部分乐队事件
- 同一乐队事件，不同角色有不同的视角描述和选择项
- V1 阶段优先开发 **吴青峰** 线路

### 游玩模式

| 模式 | 名称 | 事件数 | 说明 |
|------|------|--------|------|
| 精简 | 速通模式 | ≤10 | 只包含最关键的转折点 |
| 标准 | 标准模式 | 30-40 | 完整但精炼的体验 |
| 详细 | 沉浸模式 | 50+ | 包含更多生活化事件和细节 |

玩家可在开始时选择游玩模式。

## 技术架构

### 技术栈

- **框架**: Astro
- **内容管理**: Astro Content Collections
- **剧情格式**: Markdown (正文) + frontmatter (结构化数据)
- **游戏逻辑**: 客户端 TypeScript
- **像素资源**: 静态图片资源

### 项目结构

```
soda-life/
├── public/
│   └── assets/
│       ├── scenes/          # 像素场景图
│       ├── characters/      # 像素角色图
│       └── audio/           # 音效/音乐
├── src/
│   ├── content/
│   │   ├── config.ts        # Content Collections schema 定义
│   │   ├── scenarios/       # 剧本定义
│   │   ├── events/          # 事件（Markdown + frontmatter）
│   │   │   └── wu-qingfeng/ # 吴青峰线事件
│   │   └── scenes/          # 场景配置
│   ├── components/
│   │   ├── GameEngine.astro # 游戏主引擎
│   │   ├── Scene.astro      # 场景渲染
│   │   ├── Dialog.astro     # 对话框
│   │   └── Choices.astro    # 选择按钮
│   ├── scripts/
│   │   ├── engine.ts        # 游戏引擎核心逻辑
│   │   ├── state.ts         # 游戏状态管理
│   │   └── save.ts          # 存档系统 (localStorage)
│   ├── layouts/
│   │   └── Game.astro       # 游戏布局
│   └── pages/
│       ├── index.astro      # 首页/开始画面
│       ├── play.astro       # 游戏主页面
│       └── ending.astro     # 结局页面
```

### 数据模型

```ts
// 剧本
interface Scenario {
  id: string;
  title: string;
  character: string;       // 角色标识
  description: string;
  coverImage: string;
  startEvent: string;      // 起始事件 ID
}

// 事件
interface GameEvent {
  id: string;
  title: string;
  scene: string;           // 场景 ID
  year: number;            // 年份
  text: string;            // 事件正文 (Markdown)
  mode: 'speedrun' | 'standard' | 'immersive'; // 所属模式
  condition?: {
    requiredFlags?: string[];
    excludeFlags?: string[];
  };
  choices: Choice[];
}

interface Choice {
  text: string;
  nextEvent?: string;      // 下一事件 ID (不填则按年份顺序)
  effects: {
    setFlags?: Record<string, boolean>;
    probabilityModifiers?: Record<string, number>; // 影响后续事件概率
  };
}

// 场景
interface Scene {
  id: string;
  image: string;
  music?: string;
}

// 玩家状态
interface PlayerState {
  character: string;
  currentEvent: string;
  flags: Record<string, boolean>;
  history: { eventId: string; choiceIndex: number; year: number }[];
}
```

### 剧情内容管理

使用 Astro Content Collections 管理剧情：

- 每个「事件」是一个 Markdown 文件
- frontmatter 包含结构化数据（ID、场景、年份、选择分支、条件等）
- 正文为事件的文字描述/剧情文本
- 构建时自动校验 ID 引用、flag 一致性等

示例事件文件：

```markdown
---
id: childhood-01
title: 幼年时光
scene: home
year: 1985
mode: immersive
choices:
  - text: 在房间里安静地画画
    effects:
      setFlags:
        introverted: true
  - text: 跑到外面和其他小朋友玩
    effects:
      setFlags:
        extroverted: true
---

家里总是安安静静的，窗外传来其他孩子的笑声...
```

## 开发计划

### V1 目标

- 完成吴青峰线路（从出生/童年到 2026）
- 三种游玩模式（速通/标准/沉浸）
- 核心游戏引擎 + 视觉小说交互
- 像素风场景美术
- localStorage 存档系统

### 后续扩展

- 添加其他五位成员的故事线
- 更多场景美术和动画
- 音效/背景音乐
- 结局收集系统
