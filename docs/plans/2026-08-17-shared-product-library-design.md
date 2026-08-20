# Shared Product Library Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将商品库改造成创意工作流公用的 mock 商品资产源，并让创意 Brief 使用统一选择器、独立创作设置和最长 60 秒的自定义视频时长。

**Architecture:** 商品列表、商品选择器和商品编辑弹窗共用一个客户端商品状态模块，并通过本地存储保持 demo 内的新增、编辑、删除和最近使用记录。创意 Brief 只保存选中的商品引用及项目快照提示，脚本风格、模板、Hook、语言、人物和时长放在独立的“其他创作设置”区域。

**Tech Stack:** Next.js 16 App Router、React 19、TypeScript、Tailwind CSS、Radix Dialog、Lucide Icons。

---

### Task 1: 公共商品状态

**Files:**
- Create: `src/components/products/product-store.ts`
- Modify: `src/components/products/product-data.ts`

**Steps:**
1. 给 mock 商品补充更新时间，并保持表单类型不包含系统字段。
2. 建立可订阅的客户端商品状态，提供新增、编辑、删除和最近使用操作。
3. 用 localStorage 保存 demo 状态，服务端快照保持为初始 mock 数据。

**Verify:** TypeScript 能正确推导商品表单和商品记录；商品更新后所有订阅组件获得同一列表。

### Task 2: 商品库和统一选择器

**Files:**
- Modify: `src/components/products/product-library-demo.tsx`
- Modify: `src/components/products/product-picker-dialog.tsx`

**Steps:**
1. 两个入口改用同一个商品状态，不再各自维护独立列表。
2. 商品库按更新时间倒序，支持名称、品牌、描述、卖点搜索和状态筛选。
3. 商品卡展示缩略图、名称、品牌、状态和更新时间，保留新增、编辑和删除。
4. 选择器展示最近使用、搜索、新增、编辑和删除，选择后写入最近使用记录。

**Verify:** 在商品库新增或编辑商品后，打开 Brief 选择器能看到相同结果；从选择器编辑后返回商品库仍一致。

### Task 3: 紧凑 Brief 创作条

**Files:**
- Modify: `src/components/assistant/modes/brief-mode.tsx`

**Steps:**
1. 用紧凑方块分别承载公共商品库选择和数字人选择，创意描述占据主要输入空间。
2. 将脚本风格、创意模板、Hook、目标语言和视频时长收进底部单行工具栏，与商品入口保持区隔。
3. 视频时长使用紧凑数值输入，限制 1–60 秒。

**Verify:** 商品入口与其他设置语义独立且整体高度接近参考创作条；输入 60 秒有效，超过 60 或低于 1 会被限制。

### Task 4: 回归验证

**Files:**
- Verify: `src/components/products/*.tsx`
- Verify: `src/components/assistant/modes/brief-mode.tsx`

**Steps:**
1. 运行目标文件 ESLint。
2. 运行 TypeScript 无输出检查。
3. 在 `/assets/products` 和 `/assistant` 验证商品增删改查、跨页面共用、最近使用、商品选择和时长边界。

**Expected:** 页面无运行时错误，核心交互可在当前 mock demo 中完整演示。
