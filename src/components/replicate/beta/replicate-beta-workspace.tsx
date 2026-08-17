"use client"

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  AlertCircle,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Captions,
  ChevronDown,
  CircleDashed,
  Clock3,
  Copy,
  Cpu,
  Download,
  House,
  ImagePlus,
  LoaderCircle,
  PackageCheck,
  Pencil,
  RefreshCw,
  ScanSearch,
  Search,
  SlidersHorizontal,
  Upload,
  UserRound,
  Users,
  WandSparkles,
  X,
  Zap,
} from "lucide-react"
import { DigitalHumanModal, type DHItem } from "@/components/modals/digital-human-modal"
import { ProductPickerDialog } from "@/components/products/product-picker-dialog"
import type { Product } from "@/components/products/product-data"
import {
  BETA_PROJECTS,
  SCRIPT_BRIEF,
  SCRIPT_SCENES,
  STATUS_META,
  type BetaMaterial,
  type BetaProjectStatus,
} from "@/lib/replicate/beta-mock"
import {
  AIGC_CATEGORY_OPTIONS,
  AIGC_PLATFORM_OPTIONS,
  AIGC_SORT_OPTIONS,
  BRAND_COUNTRY_OPTIONS,
  BRAND_PLATFORM_OPTIONS,
  BRAND_SORT_DIRECTION_OPTIONS,
  BRAND_SORT_METRIC_OPTIONS,
  BRAND_STATUS_OPTIONS,
  filterSourceMaterials,
  MARKET_CATEGORIES,
  MARKET_REGION_OPTIONS,
  MARKET_SORT_OPTIONS,
  MARKET_SPEND_OPTIONS,
  REPLICATE_SOURCE_TABS,
  WORKSPACE_MATERIALS,
} from "@/lib/replicate/source-filters"
import {
  getBetaProjectName,
  getBetaProjectNamesServerSnapshot,
  getBetaProjectNamesSnapshot,
  saveBetaProjectName,
  subscribeBetaProjectNames,
} from "@/lib/replicate/beta-project-names"
import { cn } from "@/lib/utils"

type StepId = 1 | 2 | 3 | 4
type RenderStatus = "idle" | "rendering" | "completed" | "failed"
type PersonReplacementMode = "digital-human" | "auto"

interface VideoVersion {
  id: string
  note: string
  createdAt: string
  video: string
  poster: string
  sourceTitle: string
  productName: string
  model: string
  resolution: string
  ratio: string
  duration: number
  language: string
  subtitles: string
}

interface Props {
  projectId: string
  title?: string
  sourceAssetId?: string
  sourceType?: string
  uploadedSourceName?: string
}

interface BreakdownProduct {
  name: string
  visual_identity: string
  usage_mode: string
  physical_constraints: string
}

interface DetectedProduct extends BreakdownProduct {
  id: string
  shortName: string
  primary: boolean
  cover?: string
  imagePosition: string
}

interface BreakdownCharacter {
  name: string
  type: string
  is_host: boolean
  description: string
}

interface DetectedPerson extends BreakdownCharacter {
  id: string
  cover?: string
}

interface SceneSetting {
  name: string
  description: string
}

interface NarrativeTranscript {
  time: string
  speaker: string
  content: string
  content_chinese: string
}

interface NarrativeScene {
  scene_id: number
  time: string
  duration: number
  video_layer: string
  transcript: NarrativeTranscript[]
}

interface NarrativeSection {
  sect_id: number
  role: string
  time: string
  function_brief: string
  strategy: string
  description: string
  key_messages: string[]
  scenes: NarrativeScene[]
}

const NARRATIVE_ROLE_LABELS: Record<string, string> = {
  hook: "吸睛钩子",
  problem_setup: "痛点铺垫",
  solution_intro: "方案引入 / 产品亮相",
  product_features: "产品特征 / 物理属性展示",
  product_demo: "功能演示 / 操作过程",
  scenario_application: "场景化应用",
  benefit_highlight: "利益点强调 / 价值主张",
  emotional_endorsement: "情绪背书 / 情绪种草",
  social_proof: "社会证明 / 信任背书",
  objection_handling: "疑虑消除 / 安全网机制",
  promotion_offer: "优惠机制 / 逼单促单",
  summary_closing: "总结收尾 / 温和种草",
  cta: "行动号召 / Call to Action",
  transition: "过渡",
}

function getNarrativeRoleLabel(role: string) {
  return NARRATIVE_ROLE_LABELS[role] ?? role
}

function formatTimeRangeInSeconds(time: string) {
  const trimmedTime = time.trim()
  if (!trimmedTime.includes(":")) {
    const seconds = trimmedTime.replace(/s$/i, "").split(/\s*-\s*/).map(Number)
    if (seconds.some(Number.isNaN)) return trimmedTime
    return `${seconds.map(Math.round).join("\u2013")}s`
  }

  const seconds = trimmedTime.split(/\s*-\s*/).map((point) => {
    const [minutes, secondsPart] = point.split(":").map(Number)
    return minutes * 60 + secondsPart
  })

  if (seconds.some(Number.isNaN)) return trimmedTime
  return `${seconds.map(Math.round).join("\u2013")}s`
}

const BREAKDOWN_PRODUCTS: BreakdownProduct[] = [
  {
    name: "迷你场景贴纸书套装",
    visual_identity: "一套包含四本不同封面设计（粉色、黄色、蓝色等）的迷你贴纸书，装在透明塑料袋中。每本书为长方形小册子，封面带有全息反光效果，印有卡通图案和中/韩文标题。内部包含可弹出的立体场景纸和多页透明贴纸。",
    usage_mode: "博主手持展示整套产品，随后取出一本打开，演示内部的立体场景结构和贴纸页，并用手指指向参考图示。",
    physical_constraints: "书本尺寸极小（约手掌大小），便于单手握持和放入包中；内页纸张轻薄，场景部分可折叠弹出形成立体空间。",
  },
  {
    name: "塑料镊子",
    visual_identity: "两把浅蓝色塑料材质的镊子，一把为直头设计，另一把为弯头设计，体型细小。",
    usage_mode: "博主将其与贴纸书一同展示，说明是套装附赠的工具。",
    physical_constraints: "轻量塑料材质，尖端精细，用于夹取微小贴纸。",
  },
]

const DETECTED_PRODUCTS: DetectedProduct[] = BREAKDOWN_PRODUCTS.map((product, index) => ({
  ...product,
  id: `product-${index + 1}`,
  shortName: product.name,
  primary: index === 0,
  imagePosition: "center",
}))

const BREAKDOWN_CHARACTERS: BreakdownCharacter[] = [
  {
    name: "博主",
    type: "人物",
    is_host: true,
    description: "25-35岁，中等身材，当代风格。棕色眼睛、化有眼影和睫毛膏的妆容；棕色中长发向后梳理；身穿黑色印花T恤，佩戴银色戒指、银色手链和深色耳环，涂有深紫色指甲油",
  },
]

const DETECTED_PEOPLE: DetectedPerson[] = BREAKDOWN_CHARACTERS.map((character, index) => ({
  ...character,
  id: `character-${index + 1}`,
}))

const SCENE_SETTINGS: SceneSetting[] = [
  {
    name: "室内-居家环境",
    description: "背景为米色墙壁，后方可见一个深木色玻璃门橱柜，柜顶放有编织篮装饰；右侧有百叶窗遮挡的窗户；光线为室内暖光，整体氛围居家温馨。",
  },
]

const CREATIVE_BRIEF = {
  overall_strategy: "以新品发现为钩子，通过便携卖点+带娃场景+玩法演示的组合拳，精准击中家长出行痛点并引导下单。",
  target_audience: "经常带孩子外出、需要便携玩具打发时间的年轻家长。",
  user_problem: "带娃出行时缺乏便携玩具，孩子在等待或途中容易无聊哭闹。",
  core_promise: "小巧便携的贴纸书能让孩子在出行途中安静专注地玩耍。",
  use_scenarios: ["医院候诊", "长途乘车", "商场购物", "餐厅等位"],
  emotional_journey: ["惊喜发现", "痛点共鸣", "安心验证", "愉悦种草", "行动冲动"],
}

const NARRATIVE_SECTIONS: NarrativeSection[] = [
  {
    sect_id: 0,
    role: "hook",
    time: "00:00.000 - 00:02.880",
    function_brief: "用新品发现感抓住注意力",
    strategy: "利用“发现好物”的兴奋情绪和新品悬念，在黄金 3 秒内快速抓住目标受众注意力。",
    description: "博主手持迷你场景贴纸书套装面向镜头，兴奋地宣称找到了该产品的迷你版本，以新品发现的惊喜感开场。",
    key_messages: ["发现了迷你版场景贴纸书"],
    scenes: [
      {
        scene_id: 0,
        time: "00:00.000 - 00:02.880",
        duration: 2.88,
        video_layer: "近景、平视，手持镜头轻微晃动。博主身穿黑色印花 T 恤，双手举起迷你场景贴纸书套装展示封面全息反光效果，随后展示透明包装袋内的四本书和两把浅蓝色塑料镊子。",
        transcript: [
          {
            time: "00:00.00 - 00:02.88",
            speaker: "博主",
            content: "I found the mini version of these little scene books.",
            content_chinese: "我找到了这些小小场景书的迷你版本。",
          },
        ],
      },
    ],
  },
  {
    sect_id: 1,
    role: "product_features",
    time: "00:02.880 - 00:12.960",
    function_brief: "展示套装规格与便携属性",
    strategy: "通过展示套装内容和对比尺寸差异，确立产品“小巧便携”的核心卖点，为后续场景铺垫。",
    description: "博主展示套装的四本装规格及附赠的两把塑料镊子，并强调其相比大尺寸版本更适合放入手提包。",
    key_messages: ["一套四本装，附带两把镊子", "比大尺寸版本更适合放进包里"],
    scenes: [
      {
        scene_id: 0,
        time: "00:02.880 - 00:12.960",
        duration: 10.08,
        video_layer: "近景、平视。博主先展示两把镊子的直头和弯头设计，再将四本迷你场景贴纸书扇形展开面向镜头，强调套装内容与便携性。",
        transcript: [
          {
            time: "00:02.88 - 00:07.68",
            speaker: "博主",
            content: "This one came in a pack of four, plus it came with two of these tweezers, one straight, one curved.",
            content_chinese: "这个是一套四本装的，还附带了两把镊子，一把直头，一把弯头。",
          },
          {
            time: "00:07.68 - 00:12.96",
            speaker: "博主",
            content: "We have a couple of the big size scene books, but these are absolutely perfect for putting these in your purse.",
            content_chinese: "我们有几本大尺寸的场景书，但这些迷你版本非常适合放进手提包里。",
          },
        ],
      },
    ],
  },
  {
    sect_id: 2,
    role: "scenario_application",
    time: "00:12.960 - 00:21.760",
    function_brief: "植入带娃出行场景引发共鸣",
    strategy: "将产品植入家长带娃出行的真实痛点场景，激发“我也需要这个来让孩子安静玩耍”的代入感。",
    description: "博主列举医院候诊、长途购物或开车等具体场景，描述在这些场合拿出贴纸书给孩子玩以打发时间。",
    key_messages: ["适合医院候诊时玩", "适合长途购物或乘车时使用", "能让孩子专注制作可爱场景"],
    scenes: [
      {
        scene_id: 0,
        time: "00:12.960 - 00:21.760",
        duration: 8.8,
        video_layer: "近景、平视，手持镜头微推。博主单手拿一本粉色封面的迷你场景贴纸书，另一只手配合讲解手势说明使用场景。",
        transcript: [
          {
            time: "00:12.96 - 00:21.76",
            speaker: "博主",
            content: "Say if you're sitting at a doctor's office, or if you're on a long shopping trip or a long drive, you can just whip one of these out, hand it to your little kiddo, and they're gonna be occupied making these cute little scenes.",
            content_chinese: "比如在医院候诊、长途购物或开车途中，你可以随时拿出一本给孩子，他们就会专注地制作这些可爱的小场景。",
          },
        ],
      },
    ],
  },
  {
    sect_id: 3,
    role: "product_demo",
    time: "00:21.760 - 00:28.000",
    function_brief: "演示立体弹出与贴纸玩法",
    strategy: "通过近距离操作演示验证产品的可玩性和易用性，消除用户对迷你版本是否好玩的疑虑。",
    description: "镜头切至特写，博主打开贴纸书，演示立体场景纸弹出过程，展示透明贴纸页并指向参考图示说明玩法。",
    key_messages: ["场景纸可弹出形成立体空间", "包含透明贴纸页和参考图示"],
    scenes: [
      {
        scene_id: 0,
        time: "00:21.760 - 00:28.000",
        duration: 6.24,
        video_layer: "特写、俯视，镜头聚焦手部动作。博主打开书本展示内部弹出的立体场景纸和透明贴纸页，并用手指指向背面的参考图示。",
        transcript: [
          {
            time: "00:21.76 - 00:24.80",
            speaker: "博主",
            content: "These scenes pop out, and then you have your sticker pages.",
            content_chinese: "这些场景可以弹出来，然后你就可以使用贴纸页了。",
          },
          {
            time: "00:24.80 - 00:28.00",
            speaker: "博主",
            content: "And you also have the reference sticker to see where things go.",
            content_chinese: "你还可以通过参考图示看到每个贴纸应该放在哪里。",
          },
        ],
      },
    ],
  },
  {
    sect_id: 4,
    role: "benefit_highlight",
    time: "00:28.000 - 00:35.360",
    function_brief: "强调创意自由与趣味价值",
    strategy: "从功能层面上升至情感价值，强调“创意自由”和“有趣”，强化购买欲望。",
    description: "博主鼓励观众发挥创意自由装饰，并表达对迷你场景贴纸书套装的喜爱，强调产品带来的趣味性和创造力价值。",
    key_messages: ["可发挥创意自由装饰场景", "产品可爱有趣，令人喜欢"],
    scenes: [
      {
        scene_id: 0,
        time: "00:28.000 - 00:35.360",
        duration: 7.36,
        video_layer: "近景、平视，手持镜头拉回至半身。博主再次组合展示四本迷你场景贴纸书和两把镊子，面带微笑总结推荐。",
        transcript: [
          {
            time: "00:28.00 - 00:32.16",
            speaker: "博主",
            content: "But of course, as always, you can be creative and just decorate how you want in these scenes.",
            content_chinese: "当然，你可以发挥创意，按照自己的想法来装饰这些场景。",
          },
          {
            time: "00:32.16 - 00:35.36",
            speaker: "博主",
            content: "I love this little four pack, these are absolutely so cute, so fun.",
            content_chinese: "我很喜欢这个四件套，它们真的太可爱、太有趣了。",
          },
        ],
      },
    ],
  },
  {
    sect_id: 5,
    role: "cta",
    time: "00:35.360 - 00:37.000",
    function_brief: "引导点击橙色购物车购买",
    strategy: "提供明确的购买路径指引，利用“已加入购物车”的行为暗示降低决策成本，促成转化。",
    description: "博主明确告知已将迷你场景贴纸书套装添加到橙色购物车，引导观众前往查看购买。",
    key_messages: ["产品已加入橙色购物车", "引导观众前往查看购买"],
    scenes: [
      {
        scene_id: 0,
        time: "00:35.360 - 00:37.000",
        duration: 1.64,
        video_layer: "近景、平视，博主手持整套商品面向镜头，以直接的语气收尾并引导购买。",
        transcript: [
          {
            time: "00:35.36 - 00:37.00",
            speaker: "博主",
            content: "You can go take a look at these, I added them to the orange shopping cart.",
            content_chinese: "你可以去看看这些产品，我已经把它们加到橙色购物车里了。",
          },
        ],
      },
    ],
  },
]

const INITIAL_PRODUCT_KNOWLEDGE = `材质：高弹锦纶混纺；
结构：加宽肩带；包裹式下围；
使用场景：穿搭在腰部以上身体区域，高弹性，无需纽扣在后背固定；适合跑步、力量训练和日常穿着；
风险声明：避免使用“矫正体态”等缺少证据的绝对化表述。`

const STEPS: { id: StepId; label: string }[] = [
  { id: 1, label: "爆款拆解" },
  { id: 2, label: "新商品信息确认" },
  { id: 3, label: "脚本转写" },
  { id: 4, label: "视频生成" },
]

const VOICEOVER_LANGUAGES = ["英语", "法语", "德语", "西班牙", "印尼", "马来", "泰语", "越南语"]
const AVAILABLE_CREDITS = 200

function getEstimatedRenderCost(duration: number, resolution: string) {
  const baseCost = 100 + duration * 4
  return resolution === "1080P" ? baseCost * 2 : baseCost
}

function getInitialState(projectId: string) {
  const status = BETA_PROJECTS.find((project) => project.id === projectId)?.status

  if (status === "completed") return { step: 4 as StepId, maxStep: 4 as StepId, renderStatus: "completed" as RenderStatus, breakdownStarted: true, breakdownLoading: false }
  if (status === "failed") return { step: 4 as StepId, maxStep: 4 as StepId, renderStatus: "failed" as RenderStatus, breakdownStarted: true, breakdownLoading: false }
  if (status === "rendering") return { step: 4 as StepId, maxStep: 4 as StepId, renderStatus: "rendering" as RenderStatus, breakdownStarted: true, breakdownLoading: false }
  if (status === "script_pending" || status === "script_generating") return { step: 3 as StepId, maxStep: 3 as StepId, renderStatus: "idle" as RenderStatus, breakdownStarted: true, breakdownLoading: false }
  if (status === "product_pending") return { step: 2 as StepId, maxStep: 2 as StepId, renderStatus: "idle" as RenderStatus, breakdownStarted: true, breakdownLoading: false }
  if (status === "breaking_down") return { step: 1 as StepId, maxStep: 1 as StepId, renderStatus: "idle" as RenderStatus, breakdownStarted: true, breakdownLoading: true }
  return { step: 1 as StepId, maxStep: 1 as StepId, renderStatus: "idle" as RenderStatus, breakdownStarted: false, breakdownLoading: false }
}

function getInitialSourceTab(sourceType?: string, sourceAssetId?: string) {
  if (sourceType === "upload") return "本地上传"
  if (sourceType === "market" || sourceType === "discover") return "市场爆款"
  if (sourceType === "brand") return "品牌追踪"
  if (sourceType === "aigc") return "AIGC 爆款"
  return sourceAssetId ? "AIGC 爆款" : "市场爆款"
}

function createMockVideoVersions({
  material,
  projectName,
  productName,
  model,
  resolution,
  ratio,
  duration,
  language,
  subtitles,
}: {
  material: BetaMaterial
  projectName: string
  productName: string
  model: string
  resolution: string
  ratio: string
  duration: number
  language: string
  subtitles: string
}): VideoVersion[] {
  return [
    {
      id: "v3",
      note: "当前版本",
      createdAt: "2026-07-23 14:26",
      video: material.video,
      poster: material.cover,
      sourceTitle: material.title,
      productName,
      model,
      resolution,
      ratio,
      duration,
      language,
      subtitles,
    },
    {
      id: "v2",
      note: projectName,
      createdAt: "2026-07-23 13:18",
      video: material.video,
      poster: "/replicate-covers/black-training-jacket.png",
      sourceTitle: material.title,
      productName: `${productName}（口播优化版）`,
      model,
      resolution,
      ratio,
      duration,
      language,
      subtitles,
    },
    {
      id: "v1",
      note: projectName,
      createdAt: "2026-07-22 18:42",
      video: material.video,
      poster: "/replicate-covers/sports-bra.jpg",
      sourceTitle: material.title,
      productName: `${productName}（初版）`,
      model: "Seedance 1.1",
      resolution: "720P",
      ratio: "9:16",
      duration: 20,
      language: "英语",
      subtitles: "无字幕",
    },
  ]
}

export function ReplicateBetaWorkspace({ projectId, title, sourceAssetId, sourceType, uploadedSourceName }: Props) {
  const startsFromAssistant = Boolean(sourceAssetId || (sourceType === "upload" && uploadedSourceName))
  const initial = useMemo(
    () => startsFromAssistant
      ? { step: 1 as StepId, maxStep: 1 as StepId, renderStatus: "idle" as RenderStatus, breakdownStarted: true, breakdownLoading: true }
      : getInitialState(projectId),
    [projectId, startsFromAssistant],
  )
  const existingProject = BETA_PROJECTS.find((project) => project.id === projectId)
  const defaultMaterial = WORKSPACE_MATERIALS.find((material) => material.id === sourceAssetId)
    ?? WORKSPACE_MATERIALS.find((material) => material.id === "aigc-003")
    ?? WORKSPACE_MATERIALS[0]
  const initialDuration = Number(defaultMaterial.duration.split(":").pop()) || 20

  const [step, setStep] = useState<StepId>(initial.step)
  const [maxStep, setMaxStep] = useState<StepId>(initial.maxStep)
  const [renderStatus, setRenderStatus] = useState<RenderStatus>(initial.renderStatus)
  const [progress, setProgress] = useState(initial.renderStatus === "completed" ? 100 : 0)
  const [sourceTab, setSourceTab] = useState(() => getInitialSourceTab(sourceType, sourceAssetId))
  const [selectedMaterialId, setSelectedMaterialId] = useState(defaultMaterial.id)
  const [uploadedFile, setUploadedFile] = useState<string | null>(uploadedSourceName ?? null)
  const [busy, setBusy] = useState<"analysis" | "script" | null>(null)
  const [breakdownStarted, setBreakdownStarted] = useState(initial.breakdownStarted)
  const [breakdownLoading, setBreakdownLoading] = useState(initial.breakdownLoading)
  const [productName, setProductName] = useState("FlexForm 高支撑运动内衣")
  const [brandName, setBrandName] = useState("FlexForm")
  const [productDescription, setProductDescription] = useState("适合中高强度训练的高支撑运动内衣，加宽肩带与包裹式下围减少晃动。")
  const [sellingPoints, setSellingPoints] = useState("加宽肩带分散压力\n高弹面料跟随伸展\n包裹式下围稳定承托")
  const [selectedTargetProductId, setSelectedTargetProductId] = useState(
    () => DETECTED_PRODUCTS.find((product) => product.primary)?.id ?? DETECTED_PRODUCTS[0].id,
  )
  const [selectedSourcePersonId, setSelectedSourcePersonId] = useState(
    () => DETECTED_PEOPLE.find((person) => person.is_host)?.id ?? DETECTED_PEOPLE[0].id,
  )
  const [digitalHuman, setDigitalHuman] = useState<DHItem | null>(null)
  const [personReplacementMode, setPersonReplacementMode] = useState<PersonReplacementMode | null>(null)
  const [scripts, setScripts] = useState(SCRIPT_SCENES)
  const [model, setModel] = useState("Seedance 2.0")
  const [ratio, setRatio] = useState("9:16")
  const [resolution, setResolution] = useState("720P")
  const [language, setLanguage] = useState("英语")
  const [subtitles, setSubtitles] = useState("跟随原视频")
  const initialProjectTitle = title || existingProject?.title || "运动内衣承托测试 · 新版本"
  const [titleDraft, setTitleDraft] = useState(initialProjectTitle)
  const [editingTitle, setEditingTitle] = useState(false)
  const projectNamesSnapshot = useSyncExternalStore(
    subscribeBetaProjectNames,
    getBetaProjectNamesSnapshot,
    getBetaProjectNamesServerSnapshot,
  )
  const [videoVersions, setVideoVersions] = useState<VideoVersion[]>(() => initial.renderStatus === "completed"
    ? createMockVideoVersions({
        material: defaultMaterial,
        projectName: initialProjectTitle,
        productName: "FlexForm 高支撑运动内衣",
        model: "Seedance 2.0",
        resolution: "720P",
        ratio: "9:16",
        duration: initialDuration,
        language: "英语",
        subtitles: "跟随原视频",
      })
    : [])
  const [selectedVersionId, setSelectedVersionId] = useState(initial.renderStatus === "completed" ? "v3" : "")
  const [pendingVersion, setPendingVersion] = useState<VideoVersion | null>(null)

  const selectedMaterial = sourceType === "upload" && uploadedSourceName
    ? {
        ...defaultMaterial,
        id: "local-upload",
        title: uploadedSourceName.replace(/\.[^.]+$/, ""),
        account: "本地文件",
        source: "本地上传",
        cover: "/replicate-covers/creative-draft.jpg",
        evidence: "本地上传 · 等待结构拆解",
      }
    : WORKSPACE_MATERIALS.find((material) => material.id === selectedMaterialId) ?? defaultMaterial
  const duration = Number(selectedMaterial.duration.split(":").pop()) || 20
  const estimatedCost = getEstimatedRenderCost(duration, resolution)
  const resolvedTitle = getBetaProjectName(projectId, projectNamesSnapshot) ?? initialProjectTitle

  useEffect(() => {
    if (renderStatus !== "rendering") return
    const timer = window.setInterval(() => {
      setProgress((current) => Math.min(100, current + 8))
    }, 260)
    return () => window.clearInterval(timer)
  }, [renderStatus])

  useEffect(() => {
    if (renderStatus !== "rendering" || progress < 100) return
    const timer = window.setTimeout(() => {
      if (pendingVersion) {
        setVideoVersions((currentVersions) => [
          pendingVersion,
          ...currentVersions.map((version) => version.note === "当前版本"
            ? { ...version, note: resolvedTitle }
            : version),
        ])
        setSelectedVersionId(pendingVersion.id)
        setPendingVersion(null)
      }
      setRenderStatus("completed")
    }, 250)
    return () => window.clearTimeout(timer)
  }, [pendingVersion, progress, renderStatus, resolvedTitle])

  useEffect(() => {
    if (step !== 1 || !breakdownStarted || !breakdownLoading) return
    const timer = window.setTimeout(() => setBreakdownLoading(false), 2500)
    return () => window.clearTimeout(timer)
  }, [breakdownLoading, breakdownStarted, step])

  const status = useMemo<BetaProjectStatus>(() => {
    if (step === 4) {
      if (renderStatus === "rendering") return "rendering"
      if (renderStatus === "completed") return "completed"
      if (renderStatus === "failed") return "failed"
    }
    if (busy === "analysis") return "breaking_down"
    if (busy === "script") return "script_generating"
    if (step === 1) return breakdownStarted ? "breaking_down" : "draft"
    if (step === 2) return "product_pending"
    return "script_pending"
  }, [breakdownStarted, busy, renderStatus, step])
  const statusMeta = step === 1 && breakdownStarted && breakdownLoading
    ? { label: "拆解中", tone: "#2563eb" }
    : STATUS_META[status]

  function goToStep(next: StepId) {
    if (next <= maxStep) {
      setStep(next)
    }
  }

  function runAnalysis() {
    setBreakdownStarted(true)
    setBreakdownLoading(true)
    setBusy("analysis")
    window.setTimeout(() => setBusy(null), 900)
  }

  function confirmBreakdown() {
    setStep(2)
    setMaxStep((current) => Math.max(current, 2) as StepId)
  }

  function generateScript() {
    setBusy("script")
    window.setTimeout(() => {
      setBusy(null)
      setStep(3)
      setMaxStep((current) => Math.max(current, 3) as StepId)
    }, 900)
  }

  function startRender() {
    if (AVAILABLE_CREDITS < estimatedCost) return
    const nextVersionId = `v${videoVersions.length + 1}`
    setSelectedVersionId(nextVersionId)
    setPendingVersion({
      id: nextVersionId,
      note: "当前版本",
      createdAt: "2026-08-17 刚刚",
      video: selectedMaterial.video,
      poster: selectedMaterial.cover,
      sourceTitle: selectedMaterial.title,
      productName,
      model,
      resolution,
      ratio,
      duration,
      language,
      subtitles,
    })
    setStep(4)
    setMaxStep(4)
    setProgress(4)
    setRenderStatus("rendering")
  }

  function editCompletedResult() {
    setStep(3)
    setMaxStep(4)
  }

  function commitProjectTitle() {
    const nextTitle = titleDraft.trim()
    if (nextTitle) {
      saveBetaProjectName(projectId, nextTitle)
    } else {
      setTitleDraft(resolvedTitle)
    }
    setEditingTitle(false)
  }

  return (
    <main className="flex min-h-0 flex-1 flex-col bg-[#f8f8f9]">
      <header className="border-b border-[var(--line)] bg-white px-5 py-3">
        <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/replicate" title="返回项目列表" aria-label="返回项目列表" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[var(--line)] text-[#6d7179] hover:bg-[#f4f4f5]">
              <ArrowLeft size={15} />
            </Link>
            <div className="min-w-0">
              {editingTitle ? (
                <div className="flex min-w-0 items-center gap-1">
                  <input
                    autoFocus
                    value={titleDraft}
                    onChange={(event) => setTitleDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") commitProjectTitle()
                      if (event.key === "Escape") {
                        setTitleDraft(resolvedTitle)
                        setEditingTitle(false)
                      }
                    }}
                    className="h-7 min-w-[220px] max-w-[520px] rounded-md border border-[#7f9d26] px-2 text-[13px] font-extrabold text-[#202229] outline-none"
                  />
                  <button type="button" title="保存项目名称" aria-label="保存项目名称" onClick={commitProjectTitle} className="flex h-7 w-7 items-center justify-center rounded-md text-[#66830f] hover:bg-[#f0f8d5]"><Check size={13} /></button>
                  <button type="button" title="取消修改" aria-label="取消修改" onClick={() => { setTitleDraft(resolvedTitle); setEditingTitle(false) }} className="flex h-7 w-7 items-center justify-center rounded-md text-[#8e929a] hover:bg-[#f2f3f5]"><X size={13} /></button>
                </div>
              ) : (
                <div className="flex min-w-0 items-center gap-1">
                  <h1 className="truncate text-[14px] font-extrabold text-[#202229]">{resolvedTitle}</h1>
                  <button type="button" title="修改项目名称" aria-label="修改项目名称" onClick={() => { setTitleDraft(resolvedTitle); setEditingTitle(true) }} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[#8e929a] hover:bg-[#f2f3f5] hover:text-[#34373d]"><Pencil size={13} /></button>
                </div>
              )}
              <p className="mt-0.5 flex items-center gap-1 text-[10px] text-[#9699a1]"><Clock3 size={10} />已自动保存</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span
              className="rounded px-2.5 py-1.5 text-[11px] font-extrabold"
              style={{ color: statusMeta.tone, backgroundColor: `${statusMeta.tone}12` }}
            >
              {statusMeta.label}
            </span>
          </div>
        </div>
      </header>

      <StepNavigation
        step={step}
        maxStep={maxStep}
        finalStepComplete={renderStatus === "completed" || renderStatus === "failed"}
        onStep={goToStep}
      />

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[1440px] px-5 py-6">
          {step === 4 && renderStatus === "rendering" && videoVersions.length === 0 && <RenderingView progress={progress} material={selectedMaterial} />}
          {step === 4 && (renderStatus === "completed" || (renderStatus === "rendering" && videoVersions.length > 0)) && (
            <ResultView
              projectName={resolvedTitle}
              versions={videoVersions}
              selectedVersionId={selectedVersionId}
              renderingVersion={renderStatus === "rendering" ? pendingVersion : null}
              renderProgress={progress}
              onSelectVersion={setSelectedVersionId}
              onRegenerate={editCompletedResult}
              onEdit={editCompletedResult}
            />
          )}
          {step === 4 && renderStatus === "failed" && <FailedView onRetry={startRender} />}
          {step === 1 && !breakdownStarted && (
            <SourceStep
              sourceTab={sourceTab}
              onSourceTab={setSourceTab}
              selectedMaterialId={selectedMaterialId}
              onSelectMaterial={setSelectedMaterialId}
              uploadedFile={uploadedFile}
              onUploadedFile={setUploadedFile}
            />
          )}
          {step === 1 && breakdownStarted && <BreakdownStep material={selectedMaterial} loading={breakdownLoading} />}
          {step === 2 && (
            <ProductStep
              material={selectedMaterial}
              productName={productName}
              onProductName={setProductName}
              brandName={brandName}
              onBrandName={setBrandName}
              description={productDescription}
              onDescription={setProductDescription}
              sellingPoints={sellingPoints}
              onSellingPoints={setSellingPoints}
              selectedTargetProductId={selectedTargetProductId}
              onTargetProduct={setSelectedTargetProductId}
              selectedSourcePersonId={selectedSourcePersonId}
              onSourcePerson={setSelectedSourcePersonId}
              digitalHuman={digitalHuman}
              onDigitalHuman={setDigitalHuman}
              personReplacementMode={personReplacementMode}
              onPersonReplacementMode={setPersonReplacementMode}
            />
          )}
          {step === 3 && (
            <ScriptStep
              scripts={scripts}
              onScripts={setScripts}
            />
          )}
        </div>
      </div>

      {step < 4 && renderStatus !== "rendering" && (
        <WorkspaceFooter
          step={step}
          breakdownStarted={breakdownStarted}
          busy={busy ?? (step === 1 && breakdownStarted && breakdownLoading ? "analysis" : null)}
          language={language}
          onLanguage={setLanguage}
          model={model}
          onModel={setModel}
          ratio={ratio}
          onRatio={setRatio}
          resolution={resolution}
          onResolution={setResolution}
          duration={duration}
          availableCredits={AVAILABLE_CREDITS}
          estimatedCost={estimatedCost}
          hasVideoVersions={videoVersions.length > 0}
          subtitles={subtitles}
          onSubtitles={setSubtitles}
          onRegenerateScript={generateScript}
          onBack={() => step === 1 ? undefined : goToStep((step - 1) as StepId)}
          onNext={step === 1 ? (breakdownStarted ? confirmBreakdown : runAnalysis) : step === 2 ? generateScript : startRender}
        />
      )}
    </main>
  )
}

function StepNavigation({
  step,
  maxStep,
  finalStepComplete,
  onStep,
}: {
  step: StepId
  maxStep: StepId
  finalStepComplete: boolean
  onStep: (step: StepId) => void
}) {
  return (
    <nav className="border-b border-[var(--line)] bg-white px-5" aria-label="高保真复刻步骤">
      <div className="mx-auto flex h-14 w-full max-w-[1440px] items-center">
        {STEPS.map((item, index) => {
          const current = step === item.id
          const complete = !current && (maxStep > item.id || (item.id === 4 && finalStepComplete))
          const enabled = item.id <= maxStep
          return (
            <div key={item.id} className="flex min-w-0 flex-1 items-center">
              <button
                type="button"
                disabled={!enabled}
                onClick={() => onStep(item.id)}
                className={cn(
                  "flex min-w-0 items-center gap-2 text-left",
                  enabled ? "cursor-pointer" : "cursor-not-allowed",
                )}
              >
                <span className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[11px] font-extrabold",
                  current && "border-[#17181c] bg-[#17181c] text-white",
                  complete && "border-[#a5c83b] bg-[#efffc4] text-[#4e650f]",
                  !current && !complete && "border-[#d7d9dd] bg-white text-[#a0a3aa]",
                )}>
                  {complete ? <Check size={13} strokeWidth={3} /> : item.id}
                </span>
                <span className={cn(
                  "truncate text-[12px] font-bold",
                  current ? "text-[#202229]" : enabled ? "text-[#666a72]" : "text-[#b0b3b9]",
                )}>{item.label}</span>
              </button>
              {index < STEPS.length - 1 && <span className={cn("mx-4 h-px flex-1", complete ? "bg-[#b9d665]" : "bg-[#e4e4e7]")} />}
            </div>
          )
        })}
      </div>
    </nav>
  )
}

type OwnedSortKey = "ctr" | "spend" | "impressions" | "clicks" | "conversions"
type SortDirection = "asc" | "desc"

const OWNED_PAGE_SIZE = 4
const OWNED_SORT_OPTIONS: Array<{ key: OwnedSortKey; label: string }> = [
  { key: "ctr", label: "点击率" },
  { key: "spend", label: "广告花费" },
  { key: "impressions", label: "展示次数" },
  { key: "clicks", label: "点击次数" },
  { key: "conversions", label: "转化次数" },
]
const OWNED_MATERIAL_METRICS: Record<string, Record<OwnedSortKey, number>> = {
  "aigc-003": { ctr: 0.052, spend: 18240, impressions: 1180000, clicks: 61360, conversions: 2640 },
  "aigc-004": { ctr: 0.047, spend: 15620, impressions: 980000, clicks: 46060, conversions: 2130 },
  "market-001": { ctr: 0.061, spend: 24380, impressions: 1420000, clicks: 86620, conversions: 3710 },
  "brand-001": { ctr: 0.039, spend: 12860, impressions: 760000, clicks: 29640, conversions: 1680 },
  "owned-001": { ctr: 0.044, spend: 11380, impressions: 690000, clicks: 30360, conversions: 1540 },
  "owned-002": { ctr: 0.057, spend: 20760, impressions: 1260000, clicks: 71820, conversions: 3080 },
  "owned-003": { ctr: 0.036, spend: 9840, impressions: 610000, clicks: 21960, conversions: 1260 },
  "owned-004": { ctr: 0.041, spend: 8460, impressions: 540000, clicks: 22140, conversions: 1180 },
}

function SourceStep({
  sourceTab,
  onSourceTab,
  selectedMaterialId,
  onSelectMaterial,
  uploadedFile,
  onUploadedFile,
}: {
  sourceTab: string
  onSourceTab: (value: string) => void
  selectedMaterialId: string
  onSelectMaterial: (value: string) => void
  uploadedFile: string | null
  onUploadedFile: (value: string | null) => void
}) {
  const [marketCategory, setMarketCategory] = useState("全部")
  const [marketSearch, setMarketSearch] = useState("")
  const [marketSort, setMarketSort] = useState("推荐")
  const [marketRegion, setMarketRegion] = useState("国家地区")
  const [marketSpend, setMarketSpend] = useState("全部消耗")
  const [aigcPlatform, setAigcPlatform] = useState("TikTok")
  const [aigcCategory, setAigcCategory] = useState("全部类目")
  const [aigcSort, setAigcSort] = useState("最新发布")
  const [aigcRefreshing, setAigcRefreshing] = useState(false)
  const [brandPlatform, setBrandPlatform] = useState("全部平台")
  const [brandCountry, setBrandCountry] = useState("全部国家")
  const [brandStatus, setBrandStatus] = useState("全部状态")
  const [brandSortMetric, setBrandSortMetric] = useState("点赞")
  const [brandSortDirection, setBrandSortDirection] = useState("倒序")
  const [ownedSortKey, setOwnedSortKey] = useState<OwnedSortKey>("ctr")
  const [ownedSortDirection, setOwnedSortDirection] = useState<SortDirection>("desc")
  const [ownedPage, setOwnedPage] = useState(1)

  const visibleMaterials = useMemo(() => filterSourceMaterials({
    sourceTab,
    marketCategory,
    marketSearch,
    marketSort,
    marketRegion,
    marketSpend,
    aigcPlatform,
    aigcCategory,
    aigcSort,
    brandPlatform,
    brandCountry,
    brandStatus,
    brandSortMetric,
    brandSortDirection,
  }), [
    marketCategory,
    marketSearch,
    marketSort,
    marketRegion,
    marketSpend,
    aigcPlatform,
    aigcCategory,
    aigcSort,
    brandPlatform,
    brandCountry,
    brandStatus,
    brandSortMetric,
    brandSortDirection,
    sourceTab,
  ])

  const sortedMaterials = useMemo(() => {
    if (sourceTab !== "自有素材") return visibleMaterials
    return [...visibleMaterials].sort((left, right) => {
      const leftValue = OWNED_MATERIAL_METRICS[left.id]?.[ownedSortKey] ?? 0
      const rightValue = OWNED_MATERIAL_METRICS[right.id]?.[ownedSortKey] ?? 0
      const difference = leftValue - rightValue
      return ownedSortDirection === "asc" ? difference : -difference
    })
  }, [ownedSortDirection, ownedSortKey, sourceTab, visibleMaterials])

  const ownedTotalPages = Math.max(1, Math.ceil(sortedMaterials.length / OWNED_PAGE_SIZE))
  const currentOwnedPage = Math.min(ownedPage, ownedTotalPages)
  const displayedMaterials = sourceTab === "自有素材"
    ? sortedMaterials.slice((currentOwnedPage - 1) * OWNED_PAGE_SIZE, currentOwnedPage * OWNED_PAGE_SIZE)
    : sortedMaterials

  function refreshAigcMaterials() {
    setAigcRefreshing(true)
    window.setTimeout(() => setAigcRefreshing(false), 600)
  }

  return (
    <section>
      <StepHeader title="选择你想复刻的爆款素材" description="从现有各类爆款池中选择或从本地上传你的爆款视频，进行视频结构拆解、商品信息和人物识别。" />
      <div className="mt-5 flex gap-1 overflow-x-auto border-b border-[var(--line)]">
        {REPLICATE_SOURCE_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => {
              setOwnedPage(1)
              onSourceTab(tab)
            }}
            className={cn(
              "relative h-10 shrink-0 px-3 text-[12px] font-bold",
              sourceTab === tab ? "text-[#17181c]" : "text-[#898d95]",
            )}
          >
            {tab}
            {sourceTab === tab && <span className="absolute inset-x-2 bottom-0 h-0.5 bg-[#17181c]" />}
          </button>
        ))}
      </div>

      {sourceTab === "市场爆款" && (
        <div className="mt-4 space-y-3 rounded-lg border border-[var(--line)] bg-white p-3">
          <div className="flex flex-wrap items-center gap-2">
            {MARKET_CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setMarketCategory(category)}
                className={cn(
                  "h-7 whitespace-nowrap rounded-full border px-3 text-[10.5px] font-bold transition-colors",
                  marketCategory === category
                    ? "border-[#17181b] bg-[#17181b] text-white"
                    : "border-[var(--line)] bg-white text-[#656972] hover:border-[#b9bdc4]",
                )}
              >
                {category}
              </button>
            ))}
            <button type="button" className="flex h-7 items-center gap-1 rounded-full border border-[var(--line)] px-3 text-[10.5px] font-bold text-[#656972]">
              更多 <ChevronDown size={11} />
            </button>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <label className="flex h-8 min-w-[210px] flex-1 items-center gap-2 rounded-full border border-[var(--line)] px-3 text-[#90949c] sm:max-w-[280px]">
              <Search size={13} />
              <input
                value={marketSearch}
                onChange={(event) => setMarketSearch(event.target.value)}
                placeholder="搜索标题或品牌..."
                className="min-w-0 flex-1 bg-transparent text-[11px] text-[#43464d] outline-none placeholder:text-[#a1a4aa]"
              />
            </label>
            <FilterSelect value={marketSort} onChange={setMarketSort} options={MARKET_SORT_OPTIONS} label="排序" />
            <FilterSelect value={marketRegion} onChange={setMarketRegion} options={MARKET_REGION_OPTIONS} label="国家地区" />
            <FilterSelect value={marketSpend} onChange={setMarketSpend} options={MARKET_SPEND_OPTIONS} label="消耗" />
          </div>
        </div>
      )}

      {sourceTab === "AIGC 爆款" && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[var(--line)] bg-white p-3">
          <div className="flex items-center gap-2">
            <FilterSelect value={aigcPlatform} onChange={setAigcPlatform} options={AIGC_PLATFORM_OPTIONS} label="平台" />
            <FilterSelect value={aigcCategory} onChange={setAigcCategory} options={AIGC_CATEGORY_OPTIONS} label="类目" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10.5px] font-bold text-[#858991]">排序</span>
            <FilterSelect value={aigcSort} onChange={setAigcSort} options={AIGC_SORT_OPTIONS} label="排序" />
            <button
              type="button"
              onClick={refreshAigcMaterials}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--line)] text-[#6f737b] hover:border-[#b7bbc2]"
              aria-label="刷新 AIGC 爆款素材"
              title="刷新素材"
            >
              <RefreshCw size={13} className={cn(aigcRefreshing && "animate-spin")} />
            </button>
          </div>
        </div>
      )}

      {sourceTab === "品牌追踪" && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[var(--line)] bg-white p-3">
          <div className="flex flex-wrap items-center gap-2">
            <FilterSelect value={brandPlatform} onChange={setBrandPlatform} options={BRAND_PLATFORM_OPTIONS} label="投放平台" />
            <FilterSelect value={brandCountry} onChange={setBrandCountry} options={BRAND_COUNTRY_OPTIONS} label="投放国家" />
            <FilterSelect value={brandStatus} onChange={setBrandStatus} options={BRAND_STATUS_OPTIONS} label="投放状态" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10.5px] font-bold text-[#858991]">排序</span>
            <FilterSelect
              value={brandSortMetric}
              onChange={setBrandSortMetric}
              options={BRAND_SORT_METRIC_OPTIONS}
              label="排序指标"
            />
            <FilterSelect value={brandSortDirection} onChange={setBrandSortDirection} options={BRAND_SORT_DIRECTION_OPTIONS} label="排序方向" />
          </div>
        </div>
      )}

      {sourceTab === "自有素材" && (
        <div className="mt-4 flex flex-wrap items-center justify-end gap-2 rounded-lg border border-[var(--line)] bg-white p-3">
          <span className="text-[10.5px] font-bold text-[#858991]">排序</span>
          <FilterSelect
            value={OWNED_SORT_OPTIONS.find((option) => option.key === ownedSortKey)?.label ?? "点击率"}
            onChange={(value) => {
              const option = OWNED_SORT_OPTIONS.find((item) => item.label === value)
              if (!option) return
              setOwnedPage(1)
              setOwnedSortKey(option.key)
            }}
            options={OWNED_SORT_OPTIONS.map((option) => option.label)}
            label="排序指标"
          />
          <FilterSelect
            value={ownedSortDirection === "desc" ? "倒序" : "正序"}
            onChange={(value) => {
              setOwnedPage(1)
              setOwnedSortDirection(value === "正序" ? "asc" : "desc")
            }}
            options={BRAND_SORT_DIRECTION_OPTIONS}
            label="排序方向"
          />
        </div>
      )}

      {sourceTab === "本地上传" ? (
        <label className="mt-5 flex min-h-[320px] cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-[#cfd2d7] bg-white text-center hover:border-[#9ca3af]">
          <Upload size={25} className="text-[#8d9199]" />
          <p className="mt-3 text-[13px] font-extrabold text-[#34373d]">{uploadedFile || "拖拽或选择一个视频"}</p>
          <p className="mt-1 text-[11px] text-[#9699a1]">MP4 / MOV · 不超过 500MB · 3-120 秒</p>
          <input
            type="file"
            accept="video/mp4,video/quicktime"
            className="sr-only"
            onChange={(event) => onUploadedFile(event.target.files?.[0]?.name ?? null)}
          />
        </label>
      ) : (
        <>
          <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
          {displayedMaterials.map((material) => {
            const selected = selectedMaterialId === material.id
            return (
              <button
                key={material.id}
                type="button"
                onClick={() => onSelectMaterial(material.id)}
                className={cn(
                  "overflow-hidden rounded-lg border bg-white text-left transition",
                  selected ? "border-[#8fb226] ring-2 ring-[#c9ff29]/70" : "border-[var(--line)] hover:border-[#bfc2c8]",
                )}
              >
                <span className="relative block aspect-[9/12] overflow-hidden bg-[#e9eaed]">
                  <Image src={material.cover} alt={material.title} fill sizes="25vw" className="object-cover" />
                  <span className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-1 text-[10px] font-bold text-white">{material.duration}</span>
                  {selected && <span className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#c9ff29] text-[#263000]"><Check size={15} strokeWidth={3} /></span>}
                </span>
                <span className="block p-3">
                  <span className="block line-clamp-2 min-h-10 text-[12.5px] font-extrabold leading-5 text-[#292c32]">{material.title}</span>
                  <span className="mt-1 block text-[10.5px] text-[#9699a1]">{material.account} · {material.source}</span>
                  <span className="mt-2 block text-[10.5px] font-bold text-[#62666f]">{material.evidence}</span>
                </span>
              </button>
            )
          })}
          {visibleMaterials.length === 0 && (
            <div className="col-span-full flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed border-[#d5d7dc] bg-white text-center">
              <ScanSearch size={22} className="text-[#a0a3aa]" />
              <p className="mt-2 text-[12px] font-extrabold text-[#555962]">暂无符合条件的素材</p>
              <p className="mt-1 text-[10.5px] text-[#999ca3]">请调整筛选条件后重试</p>
            </div>
          )}
          </div>
          {sourceTab === "自有素材" && (
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line)] pt-4">
              <p className="text-[10.5px] text-[#9699a1]">第 {currentOwnedPage} / {ownedTotalPages} 页 · 每页 {OWNED_PAGE_SIZE} 条</p>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setOwnedPage((page) => Math.max(1, page - 1))}
                  disabled={currentOwnedPage === 1}
                  aria-label="上一页"
                  title="上一页"
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--line)] text-[#676b73] hover:bg-[#f5f6f7] disabled:cursor-not-allowed disabled:opacity-35"
                >
                  <ArrowLeft size={13} />
                </button>
                {Array.from({ length: ownedTotalPages }, (_, index) => index + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setOwnedPage(page)}
                    aria-current={currentOwnedPage === page ? "page" : undefined}
                    className={cn(
                      "h-8 min-w-8 rounded-md border px-2 text-[10.5px] font-bold",
                      currentOwnedPage === page
                        ? "border-[#8fb226] bg-[#efffc4] text-[#405409]"
                        : "border-[var(--line)] bg-white text-[#555962] hover:bg-[#f5f6f7]",
                    )}
                  >
                    {page}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setOwnedPage((page) => Math.min(ownedTotalPages, page + 1))}
                  disabled={currentOwnedPage === ownedTotalPages}
                  aria-label="下一页"
                  title="下一页"
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--line)] text-[#676b73] hover:bg-[#f5f6f7] disabled:cursor-not-allowed disabled:opacity-35"
                >
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  )
}

function FilterSelect({
  value,
  onChange,
  options,
  label,
}: {
  value: string
  onChange: (value: string) => void
  options: string[]
  label: string
}) {
  return (
    <label className="relative">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-8 appearance-none rounded-md border border-[var(--line)] bg-white pl-3 pr-8 text-[10.5px] font-bold text-[#555962] outline-none hover:border-[#b7bbc2] focus:border-[#8fae31]"
      >
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
      <ChevronDown size={11} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8c9098]" />
    </label>
  )
}

const NARRATIVE_STAGE_TONES = [
  { backgroundColor: "#fff1f2", borderColor: "#ffb4b8", color: "#d92d20" },
  { backgroundColor: "#eef5ff", borderColor: "#b6d4fe", color: "#2869c8" },
  { backgroundColor: "#f4f0ff", borderColor: "#d7c8ff", color: "#6f48d6" },
  { backgroundColor: "#fff8e6", borderColor: "#ffd77a", color: "#a15c00" },
  { backgroundColor: "#ecfdf7", borderColor: "#a7efd3", color: "#087a57" },
  { backgroundColor: "#edfadf", borderColor: "#b7e979", color: "#4b7c12" },
]

const getNarrativeStageTone = (index: number) => NARRATIVE_STAGE_TONES[index % NARRATIVE_STAGE_TONES.length]
function BreakdownStep({ material, loading }: { material: BetaMaterial; loading: boolean }) {
  const [activeSection, setActiveSection] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const pendingSeek = useRef<number | null>(null)

  function selectSection(section: NarrativeSection) {
    setActiveSection(section.sect_id)
    const [minutes, seconds] = section.time.split("-")[0].trim().split(":").map(Number)
    const startTime = minutes * 60 + seconds
    const video = videoRef.current

    if (!video || video.readyState < HTMLMediaElement.HAVE_METADATA) {
      pendingSeek.current = startTime
      return
    }

    video.pause()
    video.currentTime = startTime
  }

  function handleLoadedMetadata() {
    const video = videoRef.current
    if (!video || pendingSeek.current === null) return

    video.pause()
    video.currentTime = pendingSeek.current
    pendingSeek.current = null
  }

  if (loading) return <BreakdownSkeleton material={material} />

  return (
    <section className="text-[#152238]">
      <StepHeader title="查看爆款拆解结果" description="理解爆款视频为什么有效：包括爆款创意策略、视频叙事结构、核心商品和人物有什么特点" />
      <div className="mt-5 grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="space-y-4">
          <div className="overflow-hidden rounded-lg bg-black">
            <video
              ref={videoRef}
              suppressHydrationWarning
              src={material.video}
              poster={material.cover}
              controls
              muted
              playsInline
              preload="metadata"
              onLoadedMetadata={handleLoadedMetadata}
              className="aspect-[9/16] max-h-[560px] w-full object-contain"
            />
          </div>
          <div className="grid grid-cols-3 overflow-hidden rounded-lg border border-[#dfe4ec] bg-white shadow-[0_8px_24px_rgba(32,52,86,0.06)] sm:grid-cols-6">
            {NARRATIVE_SECTIONS.map((section) => (
              <button
                key={section.sect_id}
                type="button"
                onClick={() => selectSection(section)}
                className={cn(
                  "h-12 whitespace-nowrap border-r border-[var(--line)] px-1 text-[10px] font-extrabold last:border-r-0",
                  activeSection === section.sect_id ? "bg-[#9bea32] text-[#17210a] shadow-[inset_0_-3px_0_#78c91e]" : "bg-[#f8fafc] text-[#6e788b] hover:bg-[#f0f8dd]",
                )}
              >
                {getNarrativeRoleLabel(section.role).split(" / ")[0]}<span className="mt-0.5 block text-[9px] opacity-70">#{section.sect_id + 1}</span>
              </button>
            ))}
          </div>
        </aside>

        <div className="space-y-5">
          <section className="rounded-2xl border border-[#dfe4ec] bg-white p-5 shadow-[0_10px_30px_rgba(32,52,86,0.06)]">
            <h3 className="flex items-center gap-2 text-[14px] font-extrabold text-[#16233a]"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#efffc4] text-[#64821a]"><WandSparkles size={15} /></span>策略摘要</h3>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <InfoField label="创意策略" value={CREATIVE_BRIEF.overall_strategy} />
              <InfoField label="目标受众" value={CREATIVE_BRIEF.target_audience} />
              <InfoField label="用户痛点" value={CREATIVE_BRIEF.user_problem} />
              <InfoField label="核心承诺" value={CREATIVE_BRIEF.core_promise} />
              <div>
                <InfoField label="使用场景" value={CREATIVE_BRIEF.use_scenarios.join("、")} />
              </div>
              <div>
                <EmotionJourney items={CREATIVE_BRIEF.emotional_journey} />
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between">
              <h3 className="text-[14px] font-extrabold text-[#16233a]">叙事结构</h3>
              <span className="text-[10.5px] text-[#94a0b4]">{NARRATIVE_SECTIONS.length} 个叙事阶段</span>
            </div>
            <div className="mt-3 space-y-3">
              {NARRATIVE_SECTIONS.map((section, sectionIndex) => (
                <details
                  key={section.sect_id}
                  open={sectionIndex === 0}
                  className={cn(
                    "overflow-hidden rounded-xl border bg-white transition-shadow",
                    activeSection === section.sect_id ? "border-[#99dc38] ring-2 ring-[#d8ff8a] shadow-[0_10px_28px_rgba(126,183,28,0.10)]" : "border-[#dfe4ec]",
                  )}
                >
                  <summary
                    onClick={() => selectSection(section)}
                    className={cn(
                      "cursor-pointer list-none px-4 py-3",
                      activeSection === section.sect_id ? "bg-[#fbfff2]" : "bg-[#f8fafc]",
                    )}
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="shrink-0 rounded-full border px-2 py-1 text-[10px] font-extrabold" style={getNarrativeStageTone(section.sect_id)}>阶段 {section.sect_id + 1}</span>
                      <span className="shrink-0 text-[13px] font-extrabold text-[#16233a]">{getNarrativeRoleLabel(section.role).split(" / ")[0]}</span>
                      <span className="shrink-0 text-[10.5px] text-[#8e9aaf]">{formatTimeRangeInSeconds(section.time)}</span>
                      <span className="min-w-0 flex-1 border-l border-[#d9e0e9] pl-2 text-[12px] font-bold leading-5 text-[#152238]">{section.function_brief}</span>
                      <ChevronDown size={14} className="shrink-0 text-[#8e9aaf]" />
                    </span>
                  </summary>
                  <div className="space-y-4 border-t border-[#e3e8ef] p-4">
                    <div className="grid gap-3 md:grid-cols-[minmax(220px,0.7fr)_minmax(0,1.3fr)]">
                      <div className="md:col-span-2">
                        <InfoField label="创意策略" value={section.strategy} />
                      </div>
                      <div className="md:col-span-2">
                        <InfoField label="创意描述" value={section.description} />
                      </div>
                      <div className="md:col-span-2">
                        <span className="text-[10.5px] font-bold text-[#94a0b4]">关键信息</span>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {section.key_messages.map((message) => (
                            <span key={message} className="rounded-full border border-[#d7eb9a] bg-[#efffc4] px-2.5 py-1 text-[10.5px] font-bold text-[#55701c]">
                              {message}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-[11.5px] font-extrabold text-[#16233a]">分镜</h4>
                      <div className="mt-2 space-y-2">
                        {section.scenes.map((scene, sceneIndex) => (
                          <details key={scene.scene_id} open className="overflow-hidden rounded-lg border border-[#e2e7ee] bg-[#f8fafc]">
                            <summary className="cursor-pointer list-none px-3 py-2.5">
                              <span className="flex flex-wrap items-center gap-2">
                                <span className="rounded bg-[#edf1f5] px-2 py-1 text-[10px] font-extrabold text-[#536078]">
                                  分镜{" "}
                                  {NARRATIVE_SECTIONS.slice(0, sectionIndex).reduce(
                                    (total, item) => total + item.scenes.length,
                                    0,
                                  ) +
                                    sceneIndex +
                                    1}
                                </span>
                                <span className="text-[10.5px] text-[#6f7b90]">{formatTimeRangeInSeconds(scene.time)}</span>
                                <span className="rounded-full bg-white px-2 py-1 text-[10px] text-[#6f7b90]">时长 {Math.round(scene.duration)}s</span>
                                <span className="rounded-full bg-white px-2 py-1 text-[10px] text-[#6f7b90]">
                                  讲话者 {scene.transcript[0]?.speaker}
                                </span>
                                <ChevronDown size={13} className="ml-auto text-[#94a0b4]" />
                              </span>
                            </summary>
                            <div className="space-y-3 border-t border-[#e3e8ef] bg-white p-3">
                              <div className="space-y-2 rounded-lg bg-[#f5f7fa] p-3">
                                <InfoField label="口播内容" value={scene.transcript.map((line) => line.content).filter(Boolean).join(" ")} />
                                <InfoField label="口播翻译" value={scene.transcript.map((line) => line.content_chinese).filter(Boolean).join(" ")} />
                              </div>
                              <InfoField label="画面内容" value={scene.video_layer} />
                            </div>
                          </details>
                        ))}
                      </div>
                    </div>
                  </div>
                </details>
              ))}
            </div>
          </section>

          <section className="grid gap-5 border-t border-[var(--line)] pt-5 md:grid-cols-2">
            <div>
              <h3 className="flex items-center gap-2 text-[14px] font-extrabold text-[#292c32]">
                <PackageCheck size={16} />
                商品信息
              </h3>
              <div className="mt-3 space-y-2">
                {DETECTED_PRODUCTS.map((product) => (
                  <DetectedItem
                    key={product.id}
                    name={product.name}
                    description={product.visual_identity}
                    primaryLabel={product.primary ? "主要商品" : undefined}
                  />
                ))}
              </div>
            </div>
            <div>
              <h3 className="flex items-center gap-2 text-[14px] font-extrabold text-[#292c32]">
                <Users size={16} />
                人物信息
              </h3>
              <div className="mt-3 space-y-2">
                {DETECTED_PEOPLE.map((person) => (
                  <DetectedItem
                    key={person.id}
                    name={person.name}
                    description={person.description}
                    primaryLabel={person.is_host ? "主要人物" : undefined}
                  />
                ))}
              </div>
            </div>
          </section>

          <section className="border-t border-[var(--line)] pt-5">
            <h3 className="flex items-center gap-2 text-[14px] font-extrabold text-[#292c32]">
              <House size={16} />
              环境信息
            </h3>
            <div className="mt-3 space-y-2">
              {SCENE_SETTINGS.map((setting) => (
                <DetectedItem
                  key={setting.name}
                  name={setting.name}
                  description={setting.description}
                />
              ))}
            </div>
          </section>

        </div>
      </div>
    </section>
  )
}

function BreakdownSkeleton({ material }: { material: BetaMaterial }) {
  return (
    <section aria-busy="true" aria-label="拆解结果加载中">
      <StepHeader title="正在拆解爆款视频" description="正在识别创意策略、叙事结构、商品、人物和环境信息，请稍候…" />
      <div className="mt-5 grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="space-y-4">
          <div className="overflow-hidden rounded-lg bg-black">
            <video
              suppressHydrationWarning
              src={material.video}
              poster={material.cover}
              controls
              muted
              playsInline
              preload="metadata"
              aria-label={`选中的视频：${material.title}`}
              className="aspect-[9/16] max-h-[560px] w-full object-contain"
            />
          </div>
          <p className="truncate text-[12px] font-bold text-[#25324a]">{material.title}</p>
          <div className="grid animate-pulse grid-cols-4 gap-px overflow-hidden rounded-md border border-[var(--line)] bg-[#e2e4e7]">
            {Array.from({ length: 4 }, (_, index) => (
              <span key={index} className="h-12 bg-[#eef0f2]" />
            ))}
          </div>
        </aside>

        <div className="space-y-5 text-[#152238]">
          <section className="border-b border-[var(--line)] pb-5">
            <h3 className="text-[14px] font-extrabold">策略摘要</h3>
            <div className="mt-4 grid animate-pulse gap-4 md:grid-cols-2">
              {Array.from({ length: 4 }, (_, index) => (
                <div key={index} className="space-y-2">
                  <div className="h-2.5 w-16 rounded bg-[#e3e5e8]" />
                  <div className="h-3 w-4/5 rounded bg-[#d9dcdf]" />
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between">
              <h3 className="text-[14px] font-extrabold">叙事结构</h3>
              <span className="text-[11px] font-bold text-[#98a2b3]">正在识别阶段与分镜</span>
            </div>
            <div className="mt-3 animate-pulse space-y-2">
              {Array.from({ length: 4 }, (_, index) => (
                <div key={index} className="flex h-[70px] items-center gap-3 rounded-lg border border-[var(--line)] bg-white p-3">
                  <div className="h-7 w-28 shrink-0 rounded bg-[#e7e9eb]" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-1/3 rounded bg-[#d9dcdf]" />
                    <div className="h-2.5 w-3/4 rounded bg-[#e7e9eb]" />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="grid gap-5 border-t border-[var(--line)] pt-5 md:grid-cols-2">
            {["商品信息", "人物信息"].map((heading) => (
              <div key={heading}>
                <h3 className="text-[14px] font-extrabold">{heading}</h3>
                <div className="mt-3 animate-pulse space-y-2">
                  {Array.from({ length: 2 }, (_, itemIndex) => (
                    <div key={itemIndex} className="h-[68px] rounded-lg border border-[var(--line)] bg-white" />
                  ))}
                </div>
              </div>
            ))}
          </section>
          <section className="border-t border-[var(--line)] pt-5">
            <h3 className="text-[14px] font-extrabold">环境信息</h3>
            <div className="mt-3 h-[68px] animate-pulse rounded-lg border border-[var(--line)] bg-white" />
          </section>
        </div>
      </div>
    </section>
  )
}

function ProductStep({
  material,
  productName,
  onProductName,
  brandName,
  onBrandName,
  description,
  onDescription,
  sellingPoints,
  onSellingPoints,
  selectedTargetProductId,
  onTargetProduct,
  selectedSourcePersonId,
  onSourcePerson,
  digitalHuman,
  onDigitalHuman,
  personReplacementMode,
  onPersonReplacementMode,
}: {
  material: BetaMaterial
  productName: string
  onProductName: (value: string) => void
  brandName: string
  onBrandName: (value: string) => void
  description: string
  onDescription: (value: string) => void
  sellingPoints: string
  onSellingPoints: (value: string) => void
  selectedTargetProductId: string
  onTargetProduct: (value: string) => void
  selectedSourcePersonId: string
  onSourcePerson: (value: string) => void
  digitalHuman: DHItem | null
  onDigitalHuman: (value: DHItem | null) => void
  personReplacementMode: PersonReplacementMode | null
  onPersonReplacementMode: (value: PersonReplacementMode | null) => void
}) {
  const selectedTargetProduct = DETECTED_PRODUCTS.find((product) => product.id === selectedTargetProductId) ?? DETECTED_PRODUCTS[0]
  const selectedSourcePerson = DETECTED_PEOPLE.find((person) => person.id === selectedSourcePersonId) ?? DETECTED_PEOPLE[0]
  const [productKnowledge, setProductKnowledge] = useState(INITIAL_PRODUCT_KNOWLEDGE)
  const [knowledgeDraft, setKnowledgeDraft] = useState(INITIAL_PRODUCT_KNOWLEDGE)
  const [isEditingKnowledge, setIsEditingKnowledge] = useState(false)
  const [dhModalOpen, setDhModalOpen] = useState(false)
  const [productPickerOpen, setProductPickerOpen] = useState(false)
  const [productImages, setProductImages] = useState(() => [
    { id: "source-product-image", src: material.cover, name: "商品图 1" },
  ])
  const [activeProductImageId, setActiveProductImageId] = useState("source-product-image")
  const productImageInputRef = useRef<HTMLInputElement>(null)
  const uploadedProductImageUrls = useRef<string[]>([])
  const activeProductImage = productImages.find((image) => image.id === activeProductImageId) ?? productImages[0]

  useEffect(() => {
    const urls = uploadedProductImageUrls.current
    return () => urls.forEach((url) => URL.revokeObjectURL(url))
  }, [])

  function addProductImages(event: React.ChangeEvent<HTMLInputElement>) {
    const remainingSlots = 8 - productImages.length
    const files = Array.from(event.target.files ?? []).slice(0, remainingSlots)
    const additions = files.map((file, index) => {
      const src = URL.createObjectURL(file)
      uploadedProductImageUrls.current.push(src)
      return {
        id: `product-image-${Date.now()}-${index}`,
        src,
        name: file.name || `商品图 ${productImages.length + index + 1}`,
      }
    })

    if (additions.length > 0) {
      setProductImages((current) => [...current, ...additions])
      setActiveProductImageId(additions[0].id)
    }
    event.target.value = ""
  }

  function removeProductImage(imageId: string) {
    const removedImage = productImages.find((image) => image.id === imageId)
    const nextImages = productImages.filter((image) => image.id !== imageId)
    if (removedImage?.src.startsWith("blob:")) {
      URL.revokeObjectURL(removedImage.src)
      uploadedProductImageUrls.current = uploadedProductImageUrls.current.filter((url) => url !== removedImage.src)
    }
    setProductImages(nextImages)
    if (activeProductImageId === imageId) {
      setActiveProductImageId(nextImages[0]?.id ?? "")
    }
  }

  function startEditingKnowledge() {
    setKnowledgeDraft(productKnowledge)
    setIsEditingKnowledge(true)
  }

  function cancelEditingKnowledge() {
    setKnowledgeDraft(productKnowledge)
    setIsEditingKnowledge(false)
  }

  function saveProductKnowledge() {
    setProductKnowledge(knowledgeDraft)
    setIsEditingKnowledge(false)
  }

  function selectLibraryProduct(product: Product) {
    const nextKnowledge = [
      `商品名称：${product.name}`,
      `商品描述：${product.description}`,
      `核心卖点：${product.sellingPoints.join("；")}`,
      `目标人群：${product.audiences.join("；")}`,
      `使用场景：${product.scenarios.join("；")}`,
    ].join("\n")
    const libraryImage = { id: `library-${product.id}`, src: product.image, name: product.name }

    onProductName(product.name)
    onBrandName(product.brand)
    onDescription(product.description)
    onSellingPoints(product.sellingPoints.join("\n"))
    setProductKnowledge(nextKnowledge)
    setKnowledgeDraft(nextKnowledge)
    setProductImages([libraryImage])
    setActiveProductImageId(libraryImage.id)
    setProductPickerOpen(false)
  }

  function selectDigitalHuman(value: DHItem) {
    onDigitalHuman(value)
    onPersonReplacementMode("digital-human")
  }

  function removeDigitalHuman() {
    onDigitalHuman(null)
    onPersonReplacementMode(null)
  }

  function selectAutoGeneratedPerson() {
    onDigitalHuman(null)
    onPersonReplacementMode("auto")
  }

  return (
    <>
    <section>
      <StepHeader title="确认替换商品和模特" description="选择原视频中要替换的商品与人物，并核对新商品事实和新人物模特。" />
      <div className="mt-5 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div>
          <div className="mb-3">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <h3 className="text-[14px] font-extrabold text-[#292c32]">原视频商品</h3>
                <p className="mt-1 text-[11px] text-[#92959d]">默认选中主要商品，可点击切换本次替换目标。</p>
              </div>
              <span className="rounded bg-[#f1f2f4] px-2 py-1 text-[10px] font-bold text-[#666a72]">
                已选择：{selectedTargetProduct.shortName}
              </span>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:min-h-[168px] xl:auto-rows-fr">
              {DETECTED_PRODUCTS.map((product) => {
                const selected = product.id === selectedTargetProductId
                return (
                  <button
                    key={product.id}
                    type="button"
                    aria-label={`选择原视频商品：${product.name}`}
                    aria-pressed={selected}
                    onClick={() => onTargetProduct(product.id)}
                    className={cn(
                      "relative flex min-h-24 items-center gap-3 rounded-lg border bg-white p-3 text-left transition xl:h-full",
                      selected
                        ? "border-[#96b733] bg-[#fbfff1] ring-2 ring-[#dff49d]"
                        : "border-[var(--line)] hover:border-[#b9bdc4] hover:bg-[#fafafa]",
                    )}
                  >
                    <span className="relative h-16 w-12 shrink-0 overflow-hidden rounded-md bg-[#eceef0]">
                      <Image
                        src={product.cover ?? material.cover}
                        alt={product.name}
                        fill
                        sizes="48px"
                        className="object-cover"
                        style={{ objectPosition: product.imagePosition }}
                      />
                    </span>
                    <span className="min-w-0">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-[12px] font-extrabold text-[#30333a]">{product.name}</span>
                        {product.primary && (
                          <span className="rounded bg-[#e6f6b9] px-1.5 py-0.5 text-[9px] font-extrabold text-[#526b12]">
                            主要商品
                          </span>
                        )}
                      </span>
                      <span className="mt-1 block text-[10.5px] leading-5 text-[#777b84]">{product.visual_identity}</span>
                    </span>
                    {selected && (
                      <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#c9ff29] text-[#334008]">
                        <Check size={11} strokeWidth={3} />
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
            <div
              role="img"
              aria-label="原视频商品替换为新商品"
              className="mt-4 flex items-center gap-3"
            >
              <span className="h-px flex-1 bg-[var(--line)]" />
              <span className="inline-flex h-8 items-center gap-1.5 rounded-full border border-[#cfd6b8] bg-[#f8faef] px-3 text-[10.5px] font-extrabold text-[#56603c] shadow-sm">
                <ArrowDown size={13} strokeWidth={2.5} />
                替换为
              </span>
              <span className="h-px flex-1 bg-[var(--line)]" />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-[14px] font-extrabold text-[#292c32]">新商品信息</h3>
              <span className="rounded bg-[#f1f2f4] px-2 py-1 text-[9.5px] font-bold text-[#686c75]">
                将替换：{selectedTargetProduct.shortName}
              </span>
            </div>
            <button type="button" onClick={() => setProductPickerOpen(true)} className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#d7ddc6] bg-white px-3 text-[11px] font-extrabold text-[#4d5637] shadow-sm transition hover:border-[#9ebd3f] hover:bg-[#fbfff2]">
              <Search size={13} />从商品库选择
            </button>
          </div>
          <div className="mt-3 grid gap-4 md:grid-cols-[180px_minmax(0,1fr)]">
            <div>
              <input
                ref={productImageInputRef}
                type="file"
                accept="image/*"
                multiple
                aria-label="上传商品图片"
                className="sr-only"
                onChange={addProductImages}
              />
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[10.5px] font-bold text-[#6d7179]">商品图片</span>
                <span className="text-[10px] font-bold text-[#92959d]">{productImages.length} / 8</span>
              </div>
              <div className="relative flex min-h-[210px] flex-col items-center justify-center overflow-hidden rounded-lg border border-dashed border-[#ccd0d5] bg-white">
                {activeProductImage ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={activeProductImage.src} alt="当前商品主图" className="absolute inset-0 h-full w-full object-cover opacity-90" />
                    <button
                      type="button"
                      onClick={() => productImageInputRef.current?.click()}
                      disabled={productImages.length >= 8}
                      className="relative z-10 mt-auto flex w-full items-center justify-center gap-1.5 bg-black/60 py-2 text-[10.5px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      <ImagePlus size={13} />
                      {productImages.length >= 8 ? "已达 8 张上限" : "添加商品图片"}
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => productImageInputRef.current?.click()}
                    className="flex h-full min-h-[210px] w-full flex-col items-center justify-center gap-2 text-[10.5px] font-bold text-[#71757e]"
                  >
                    <ImagePlus size={20} />
                    添加商品图片
                  </button>
                )}
              </div>
              <div className="mt-2 grid grid-cols-4 gap-1.5">
                {productImages.map((image, index) => {
                  const active = image.id === activeProductImage?.id
                  return (
                    <div key={image.id} className="group relative">
                      <button
                        type="button"
                        aria-label={`查看商品图片 ${index + 1}`}
                        aria-pressed={active}
                        onClick={() => setActiveProductImageId(image.id)}
                        className={cn(
                          "relative block aspect-square w-full overflow-hidden rounded-md border bg-white",
                          active ? "border-[#8fac31] ring-2 ring-[#dff49d]" : "border-[var(--line)] hover:border-[#aeb2b8]",
                        )}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={image.src} alt={`商品图片 ${index + 1}`} className="h-full w-full object-cover" />
                      </button>
                      <button
                        type="button"
                        aria-label={`删除商品图片 ${index + 1}`}
                        onClick={() => removeProductImage(image.id)}
                        className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#202227] text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100 focus:opacity-100"
                      >
                        <X size={8} strokeWidth={2.5} />
                      </button>
                    </div>
                  )
                })}
                {productImages.length < 8 && (
                  <button
                    type="button"
                    aria-label="继续添加商品图片"
                    onClick={() => productImageInputRef.current?.click()}
                    className="flex aspect-square items-center justify-center rounded-md border border-dashed border-[#cfd2d7] text-[#858992] hover:border-[#aeb2b8] hover:text-[#555a63]"
                  >
                    <ImagePlus size={14} />
                  </button>
                )}
              </div>
              <p className="mt-1.5 text-[9.5px] leading-4 text-[#9699a1]">支持多选上传，最多 8 张</p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <TextField label="品牌名称" value={brandName} onChange={onBrandName} />
              <TextField label="商品名称" value={productName} onChange={onProductName} />
              <TextAreaField label="商品描述" value={description} onChange={onDescription} className="md:col-span-2" />
              <TextAreaField label="核心卖点（每行一条）" value={sellingPoints} onChange={onSellingPoints} className="md:col-span-2" />
            </div>
          </div>

          <div className="mt-5 rounded-lg border border-[#dfe4cf] bg-[#f8faef] p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 className="flex items-center gap-2 text-[13px] font-extrabold text-[#333820]"><PackageCheck size={15} />商品知识已识别</h4>
              </div>
              <button type="button" className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[#d7ddc6] bg-white px-3 text-[11px] font-bold text-[#56603c]"><RefreshCw size={12} />重新识别</button>
            </div>
            {isEditingKnowledge ? (
              <div className="mt-3 space-y-3">
                <label className="block">
                  <span className="mb-1 block text-[10.5px] font-bold text-[#6d735c]">商品知识内容</span>
                  <textarea
                    value={knowledgeDraft}
                    onChange={(event) => setKnowledgeDraft(event.target.value)}
                    rows={8}
                    className="w-full resize-y rounded-md border border-[#cfd6b8] bg-white px-3 py-2 text-[11.5px] leading-6 text-[#4d5342] outline-none transition focus:border-[#93af3d] focus:ring-2 focus:ring-[#dff0a6]"
                  />
                </label>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={cancelEditingKnowledge}
                    className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[#d7ddc6] bg-white px-3 text-[11px] font-bold text-[#666c59] hover:bg-[#f5f7ed]"
                  >
                    <X size={12} />
                    取消
                  </button>
                  <button
                    type="button"
                    onClick={saveProductKnowledge}
                    className="inline-flex h-8 items-center gap-1.5 rounded-md bg-[#1d2019] px-3 text-[11px] font-bold text-white hover:bg-black"
                  >
                    <Check size={12} />
                    保存
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="mt-3 flex items-end justify-between gap-4">
                  <div className="min-w-0 flex-1 space-y-2 py-1 text-[11.5px] leading-6 text-[#626852]">
                    {productKnowledge.split("\n").map((paragraph) => {
                      const separatorIndex = paragraph.indexOf("：")
                      return (
                        <p key={paragraph}>
                          {separatorIndex > 0 && <strong className="font-extrabold text-[#4c533e]">{paragraph.slice(0, separatorIndex + 1)}</strong>}
                          {paragraph.slice(separatorIndex + 1)}
                        </p>
                      )
                    })}
                  </div>
                  <button
                    type="button"
                    onClick={startEditingKnowledge}
                    className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md border border-[#bfc99d] bg-white px-3 text-[11px] font-bold text-[#4d5637] hover:border-[#9ebd3f] hover:bg-[#f7faec]"
                  >
                    <Pencil size={12} />
                    修改
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <aside className="border-l border-[var(--line)] pl-6">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h3 className="text-[14px] font-extrabold text-[#292c32]">原视频人物</h3>
              <p className="mt-1 text-[11px] text-[#92959d]">默认选中主要人物，可点击切换本次替换目标。</p>
            </div>
            <span className="rounded bg-[#f1f2f4] px-2 py-1 text-[10px] font-bold text-[#666a72]">
              已选择：{selectedSourcePerson.name}
            </span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 xl:min-h-[168px] xl:auto-rows-fr">
            {DETECTED_PEOPLE.map((person) => {
              const selected = selectedSourcePersonId === person.id
              return (
                <button
                  key={person.id}
                  type="button"
                  aria-label={`选择原视频人物：${person.name}`}
                  aria-pressed={selected}
                  onClick={() => onSourcePerson(person.id)}
                  className={cn(
                    "relative flex min-h-24 items-center gap-2 rounded-lg border bg-white p-2 text-left transition xl:h-full",
                    selected
                      ? "border-[#96b733] bg-[#fbfff1] ring-2 ring-[#dff49d]"
                      : "border-[var(--line)] hover:border-[#b9bdc4] hover:bg-[#fafafa]",
                  )}
                >
                  <span className="relative h-14 w-11 shrink-0 overflow-hidden rounded-md bg-[#eceef0]">
                    <Image
                      src={person.cover ?? material.cover}
                      alt={person.name}
                      fill
                      sizes="44px"
                      className="object-cover"
                    />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[11px] font-extrabold text-[#30333a]">{person.name}</span>
                    {person.is_host && (
                      <span className="mt-1 inline-flex rounded bg-[#e6f6b9] px-1.5 py-0.5 text-[8.5px] font-extrabold text-[#526b12]">
                        主要人物
                      </span>
                    )}
                  </span>
                  {selected && (
                    <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#c9ff29] text-[#334008]">
                      <Check size={11} strokeWidth={3} />
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          <div role="img" aria-label="原视频人物替换为新人物模特" className="my-4 flex items-center gap-3">
            <span className="h-px flex-1 bg-[var(--line)]" />
            <span className="inline-flex h-8 items-center gap-1.5 rounded-full border border-[#cfd6b8] bg-[#f8faef] px-3 text-[10.5px] font-extrabold text-[#56603c] shadow-sm">
              <ArrowDown size={13} strokeWidth={2.5} />
              替换为
            </span>
            <span className="h-px flex-1 bg-[var(--line)]" />
          </div>

          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h3 className="text-[14px] font-extrabold text-[#292c32]">新人物模特</h3>
              <p className="mt-1 text-[11px] text-[#92959d]">选择数字人，或保留原视频人物由 AI 自动生成。</p>
            </div>
            {personReplacementMode && (
              <span className="rounded bg-[#f1f2f4] px-2 py-1 text-[10px] font-bold text-[#666a72]">
                已选择：{personReplacementMode === "auto" ? "AI 自动生成" : digitalHuman?.name}
              </span>
            )}
          </div>
          <div
            className={cn(
              "relative mt-3 flex items-center gap-3 rounded-lg border bg-white p-3 transition",
              personReplacementMode === "digital-human"
                ? "border-[#96b733] bg-[#fbfff1] ring-2 ring-[#dff49d]"
                : "border-[var(--line)]",
            )}
          >
            {digitalHuman ? (
              <div className="relative h-10 w-10 shrink-0">
                <button
                  type="button"
                  onClick={() => setDhModalOpen(true)}
                  aria-label="更换数字人"
                  className="h-full w-full overflow-hidden rounded-[10px] border border-[var(--line)] bg-[var(--soft)]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={digitalHuman.thumb} alt={digitalHuman.name} className="h-full w-full object-cover" />
                </button>
                <button
                  type="button"
                  onClick={removeDigitalHuman}
                  aria-label="移除数字人"
                  className="absolute -right-1.5 -top-1.5 z-10 flex h-4 w-4 items-center justify-center rounded-full bg-[#18181b] text-white shadow-sm hover:bg-[#444]"
                >
                  <X size={8} strokeWidth={2.5} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setDhModalOpen(true)}
                aria-label="数字人"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] border border-dashed border-[var(--line-strong)] bg-white/60 text-[var(--muted)] transition-colors hover:border-[var(--muted)] hover:text-[var(--text)]"
              >
                <UserRound size={16} strokeWidth={2} />
              </button>
            )}
            <div className="min-w-0">
              <p className="text-[11.5px] font-extrabold text-[#30333a]">
                {digitalHuman ? digitalHuman.name : "选择数字人"}
              </p>
              <p className="mt-0.5 text-[10.5px] leading-4 text-[#92959d]">
                {digitalHuman ? "点击头像可重新选择数字人" : "点击图标打开创意助手数字人选择器"}
              </p>
            </div>
            {personReplacementMode === "digital-human" && (
              <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#c9ff29] text-[#334008]">
                <Check size={11} strokeWidth={3} />
              </span>
            )}
          </div>
          <button
            type="button"
            aria-label="不替换人物，AI 自动生成"
            aria-pressed={personReplacementMode === "auto"}
            onClick={selectAutoGeneratedPerson}
            className={cn(
              "relative mt-3 flex w-full items-center gap-3 rounded-lg border bg-white p-3 text-left transition",
              personReplacementMode === "auto"
                ? "border-[#96b733] bg-[#fbfff1] ring-2 ring-[#dff49d]"
                : "border-[var(--line)] hover:border-[#b9bdc4] hover:bg-[#fafafa]",
            )}
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] border border-dashed border-[var(--line-strong)] bg-white/60 text-[var(--muted)]">
              <WandSparkles size={16} strokeWidth={2} />
            </span>
            <span className="min-w-0">
              <span className="block text-[11.5px] font-extrabold text-[#30333a]">不替换，AI 自动生成</span>
              <span className="mt-0.5 block text-[10.5px] leading-4 text-[#92959d]">保留原视频人物，无需选择数字人</span>
            </span>
            {personReplacementMode === "auto" && (
              <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#c9ff29] text-[#334008]">
                <Check size={11} strokeWidth={3} />
              </span>
            )}
          </button>
        </aside>
      </div>
      <DigitalHumanModal
        open={dhModalOpen}
        onOpenChange={setDhModalOpen}
        onConfirm={selectDigitalHuman}
      />
    </section>
    <ProductPickerDialog open={productPickerOpen} onOpenChange={setProductPickerOpen} onSelect={selectLibraryProduct} />
    </>
  )
}

function ScriptStep({
  scripts,
  onScripts,
}: {
  scripts: typeof SCRIPT_SCENES
  onScripts: (scripts: typeof SCRIPT_SCENES) => void
}) {
  const [editingShotId, setEditingShotId] = useState<string | null>(null)
  const [voiceoverDraft, setVoiceoverDraft] = useState("")
  const [voiceoverTranslationDraft, setVoiceoverTranslationDraft] = useState("")
  const totalShots = scripts.reduce((total, scene) => total + scene.shots.length, 0)

  type ScriptShot = (typeof SCRIPT_SCENES)[number]["shots"][number]

  function startEditingVoiceover(shot: ScriptShot) {
    setEditingShotId(shot.id)
    setVoiceoverDraft(shot.voiceover)
    setVoiceoverTranslationDraft(shot.voiceoverTranslation)
  }

  function updateVoiceoverDraft(shot: ScriptShot, nextVoiceover: string) {
    setVoiceoverDraft(nextVoiceover)
    if (nextVoiceover.trim() === shot.voiceover.trim()) {
      setVoiceoverTranslationDraft(shot.voiceoverTranslation)
      return
    }
    if (!nextVoiceover.trim()) {
      setVoiceoverTranslationDraft("输入英文口播后，将自动生成中文翻译。")
      return
    }
    const translation = shot.voiceoverTranslation.replace(/[。！？]$/, "")
    setVoiceoverTranslationDraft(`${translation}（已根据修改后的英文口播自动同步）。`)
  }

  function cancelEditingVoiceover() {
    setEditingShotId(null)
    setVoiceoverDraft("")
    setVoiceoverTranslationDraft("")
  }

  function saveVoiceover(shotId: string) {
    onScripts(scripts.map((scene) => ({
      ...scene,
      shots: scene.shots.map((shot) => shot.id === shotId ? {
        ...shot,
        voiceover: voiceoverDraft,
        voiceoverTranslation: voiceoverTranslationDraft,
      } : shot),
    })))
    setEditingShotId(null)
    setVoiceoverDraft("")
    setVoiceoverTranslationDraft("")
  }

  return (
    <section className="text-[#152238]">
      <StepHeader title="确认转写后的脚本" description="继承参考视频的爆款叙事骨架，完成新商品策略、阶段结构、镜头、口播与字幕的整套转写" />
      <div className="mt-5 space-y-5">
        <section className="rounded-2xl border border-[#dfe4ec] bg-white p-5 shadow-[0_8px_24px_rgba(24,35,56,0.04)]">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="flex items-center gap-2 text-[14px] font-extrabold text-[#16233a]"><span className="inline-flex size-8 items-center justify-center rounded-lg bg-[#efffc4] text-[#5f8f19]"><WandSparkles size={15} /></span>新创意策略摘要</h3>
              <p className="mt-1 text-[10.5px] text-[#94a0b4]">从原片爆款机制到新商品内容的整体映射</p>
            </div>
            <span className="rounded-full border border-[#d7eb9a] bg-[#efffc4] px-2.5 py-1 text-[10px] font-extrabold text-[#55701c]">
              {scripts.length} 个叙事阶段 · {totalShots} 个分镜
            </span>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <InfoField label="创意策略" value={SCRIPT_BRIEF.overallStrategy} />
            <InfoField label="目标受众" value={SCRIPT_BRIEF.targetAudience} />
            <InfoField label="用户痛点" value={SCRIPT_BRIEF.userProblem} />
            <InfoField label="核心承诺" value={SCRIPT_BRIEF.corePromise} />
            <div>
              <InfoField label="使用场景" value={SCRIPT_BRIEF.useScenarios.join("、")} />
            </div>
            <div>
              <EmotionJourney items={SCRIPT_BRIEF.emotionalJourney} />
            </div>
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-[14px] font-extrabold text-[#16233a]">
                分镜脚本
                <span className="ml-1 text-[#e5484d]">（可校正修改口播文案）</span>
              </h3>
              <p className="mt-1 text-[10.5px] text-[#94a0b4]">按参考视频叙事阶段组织，阶段内拆分为可直接执行的镜头</p>
            </div>

          </div>
          <div className="space-y-3">
            {scripts.map((scene, sceneIndex) => {
              const roleLabel = getNarrativeRoleLabel(scene.role).split(" / ")[0]
              const shotOffset = scripts.slice(0, sceneIndex).reduce((total, item) => total + item.shots.length, 0)
              return (
                <details key={scene.id} open={sceneIndex === 0} className={cn("overflow-hidden rounded-xl border bg-white transition-shadow", sceneIndex === 0 ? "border-[#99dc38] ring-2 ring-[#d8ff8a] shadow-[0_10px_28px_rgba(126,183,28,0.10)]" : "border-[#dfe4ec]")}>
                  <summary className={cn("cursor-pointer list-none px-4 py-3", sceneIndex === 0 ? "bg-[#fbfff2]" : "bg-[#f8fafc]")}>
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="shrink-0 rounded-full border px-2 py-1 text-[10px] font-extrabold" style={getNarrativeStageTone(sceneIndex)}>阶段 {sceneIndex + 1}</span>
                      <span className="shrink-0 text-[13px] font-extrabold text-[#16233a]">{roleLabel}</span>
                      <span className="shrink-0 text-[10.5px] text-[#8e9aaf]">{formatTimeRangeInSeconds(scene.time)}</span>
                      <span className="min-w-0 flex-1 border-l border-[#d9e0e9] pl-2 text-[12px] font-bold leading-5 text-[#152238]">{scene.functionBrief}</span>
                      <ChevronDown size={14} className="shrink-0 text-[#8e9aaf]" />
                    </span>
                  </summary>

                  <div className="space-y-4 border-t border-[#e3e8ef] p-4">
                    <div className="grid gap-3 md:grid-cols-[minmax(220px,0.7fr)_minmax(0,1.3fr)]">
                      <div className="md:col-span-2"><InfoField label="创意策略" value={scene.strategy} /></div>
                      <div className="md:col-span-2"><InfoField label="创意描述" value={scene.description} /></div>
                      <div className="md:col-span-2">
                        <span className="text-[10.5px] font-bold text-[#94a0b4]">关键信息</span>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {scene.keyMessages.map((message) => (
                            <span key={message} className="rounded-full border border-[#d7eb9a] bg-[#efffc4] px-2.5 py-1 text-[10.5px] font-bold text-[#55701c]">{message}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-[11.5px] font-extrabold text-[#16233a]">分镜</h4>
                      <div className="mt-2 space-y-2">
                        {scene.shots.map((shot, shotIndex) => {
                          const shotNumber = shotOffset + shotIndex + 1
                          return (
                            <details key={shot.id} open={sceneIndex === 0} className="overflow-hidden rounded-lg border border-[#e2e7ee] bg-[#f8fafc]">
                              <summary className="cursor-pointer list-none px-3 py-2.5">
                                <span className="flex flex-wrap items-center gap-2">
                                  <span className="rounded bg-[#edf1f5] px-2 py-1 text-[10px] font-extrabold text-[#536078]">分镜 {shotNumber}</span>
                                  <span className="text-[10.5px] text-[#6f7b90]">{formatTimeRangeInSeconds(shot.time)}</span>
                                  <span className="rounded-full bg-white px-2 py-1 text-[10px] text-[#6f7b90]">时长 {Math.round(shot.duration)}s</span>
                                  <span className="rounded-full bg-white px-2 py-1 text-[10px] text-[#6f7b90]">讲话者 {shot.speaker}</span>
                                  <ChevronDown size={13} className="ml-auto text-[#94a0b4]" />
                                </span>
                              </summary>

                              <div className="space-y-3 border-t border-[#e3e8ef] bg-white p-3">
                                {editingShotId === shot.id ? (
                                  <div className="rounded-lg bg-[#f5f7fa] p-3">
                                    <label>
                                      <span className="text-[10px] font-bold text-[#94a0b4]">口播内容</span>
                                      <textarea
                                        value={voiceoverDraft}
                                        aria-label={`编辑分镜 ${shotNumber} 口播文案`}
                                        onChange={(event) => updateVoiceoverDraft(shot, event.target.value)}
                                        className="mt-1 min-h-20 w-full resize-none rounded-md border border-[#d9e0e9] bg-white p-2.5 text-[11.5px] leading-5 text-[#152238] outline-none focus:border-[#8acb2f] focus:ring-2 focus:ring-[#d8ff8a]"
                                      />
                                    </label>
                                    <div className="mt-2">
                                      <div className="flex items-center justify-between gap-3">
                                        <span className="text-[10px] font-bold text-[#94a0b4]">口播翻译</span>
                                        <span className="text-[9.5px] font-bold text-[#5f8f19]">根据口播语言自动翻译</span>
                                      </div>
                                      <div aria-label={`分镜 ${shotNumber} 中文翻译（自动同步）`} aria-live="polite" className="mt-1 min-h-16 rounded-md bg-white p-2.5 text-[11px] leading-5 text-[#536078]">
                                        {voiceoverTranslationDraft}
                                      </div>
                                    </div>
                                    <div className="mt-2 flex justify-end gap-2">
                                      <button type="button" aria-label={`取消修改分镜 ${shotNumber} 口播文案`} onClick={cancelEditingVoiceover} className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[var(--line)] bg-white px-3 text-[10.5px] font-bold text-[#666a72] hover:bg-[#f5f6f7]"><X size={11} />取消</button>
                                      <button type="button" aria-label={`保存分镜 ${shotNumber} 口播文案`} onClick={() => saveVoiceover(shot.id)} className="inline-flex h-8 items-center gap-1.5 rounded-md bg-[#1d2019] px-3 text-[10.5px] font-bold text-white hover:bg-black"><Check size={11} />保存</button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="rounded-lg bg-[#f5f7fa] p-3">
                                    <InfoField label="口播内容" value={shot.voiceover} />
                                    <div className="mt-2 border-t border-dashed border-[#dde3eb] pt-2"><InfoField label="口播翻译" value={shot.voiceoverTranslation} /></div>
                                    <div className="mt-3 flex justify-end">
                                      <button type="button" aria-label={`修改分镜 ${shotNumber} 口播文案`} disabled={editingShotId !== null} onClick={() => startEditingVoiceover(shot)} className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[#b8d875] bg-white px-3 text-[10.5px] font-bold text-[#55701c] hover:border-[#8acb2f] hover:bg-[#f4ffd8] disabled:cursor-not-allowed disabled:opacity-45"><Pencil size={11} />修改</button>
                                    </div>
                                  </div>
                                )}
                                <InfoField
                                  label="画面内容"
                                  value={`镜头采用${shot.shotSize}，${shot.cameraMovement}。${shot.action}${shot.visual}画面屏显“${shot.subtitle}”。${shot.editingNote}`}
                                />
                              </div>
                            </details>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </details>
              )
            })}
          </div>
        </section>
      </div>
    </section>
  )
}

function RenderingView({ progress, material }: { progress: number; material: BetaMaterial }) {
  const stages = [
    { label: "锁定脚本与商品版本", threshold: 10 },
    { label: "生成镜头与人物动作", threshold: 38 },
    { label: "合成口播、字幕和音乐", threshold: 72 },
    { label: "安全检查与结果封装", threshold: 94 },
  ]
  return (
    <section className="mx-auto max-w-[900px] py-8">
      <StepHeader title="高保真复刻正在生成" description="任务已创建，可以离开此页面，完成后会在项目中心更新。" centered />
      <div className="mt-7 grid gap-6 rounded-lg border border-[var(--line)] bg-white p-5 md:grid-cols-[180px_minmax(0,1fr)]">
        <div className="relative aspect-[9/16] overflow-hidden rounded-md bg-black">
          <Image src={material.cover} alt="生成预览" fill sizes="180px" className="object-cover opacity-65" />
          <div className="absolute inset-0 flex items-center justify-center"><LoaderCircle size={28} className="animate-spin text-white" /></div>
        </div>
        <div className="self-center">
          <div className="flex items-end justify-between">
            <div><p className="text-[11px] font-bold text-[#8f939b]">任务进度</p><p className="mt-1 text-[24px] font-extrabold tabular-nums text-[#202229]">{progress}%</p></div>
            <span className="text-[11px] text-[#9699a1]">预计剩余 1 分钟</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#eceef0]"><div className="h-full bg-[#9dc42d] transition-all" style={{ width: `${progress}%` }} /></div>
          <div className="mt-6 space-y-3">
            {stages.map((stage) => {
              const done = progress >= stage.threshold
              return (
                <div key={stage.label} className="flex items-center gap-3 text-[12px]">
                  {done ? <CheckCircle2 size={16} className="text-[#6f9215]" /> : <CircleDashed size={16} className="text-[#b4b7bd]" />}
                  <span className={done ? "font-bold text-[#3e4249]" : "text-[#999ca4]"}>{stage.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

function ResultView({
  projectName,
  versions,
  selectedVersionId,
  renderingVersion,
  renderProgress,
  onSelectVersion,
  onRegenerate,
  onEdit,
}: {
  projectName: string
  versions: VideoVersion[]
  selectedVersionId: string
  renderingVersion: VideoVersion | null
  renderProgress: number
  onSelectVersion: (versionId: string) => void
  onRegenerate: () => void
  onEdit: () => void
}) {
  const selectedVersion = renderingVersion && renderingVersion.id === selectedVersionId
    ? renderingVersion
    : versions.find((version) => version.id === selectedVersionId) ?? versions[0]
  if (!selectedVersion) return null
  const viewingRenderingVersion = renderingVersion?.id === selectedVersion.id

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <StepHeader
          title={renderingVersion ? "新版本生成中" : "视频已生成"}
          description={renderingVersion ? "新版本正在后台生成，可以继续切换和查看历史视频。" : "可查看结果、下载视频，或返回重新迭代。"}
        />
        <div className="flex gap-2">
          {!renderingVersion && <button type="button" onClick={onEdit} className="inline-flex h-9 items-center gap-1.5 rounded-md border border-[var(--line)] bg-white px-3 text-[11.5px] font-bold text-[#5f636c]"><ArrowLeft size={13} />返回修改脚本</button>}
          {!renderingVersion && <button type="button" onClick={onRegenerate} className="inline-flex h-9 items-center gap-1.5 rounded-md border border-[var(--line)] bg-white px-3 text-[11.5px] font-bold text-[#5f636c]"><RefreshCw size={13} />再次生成</button>}
          {viewingRenderingVersion ? (
            <span aria-label="当前视频生成中" className="inline-flex h-9 items-center gap-1.5 rounded-md bg-[#e8edf2] px-4 text-[11.5px] font-extrabold text-[#78818c]"><LoaderCircle size={13} className="animate-spin" />生成中</span>
          ) : (
            <a href={selectedVersion.video} download className="inline-flex h-9 items-center gap-1.5 rounded-md bg-[#17181c] px-4 text-[11.5px] font-extrabold text-white"><Download size={13} />下载 MP4</a>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[430px_minmax(0,1fr)]">
        <div className="overflow-hidden rounded-lg bg-black">
          {viewingRenderingVersion ? (
            <div role="status" aria-label={`${selectedVersion.id} 视频生成中`} className="relative aspect-[9/16] max-h-[680px] w-full overflow-hidden">
              <Image src={selectedVersion.poster} alt="生成中视频封面" fill sizes="430px" priority className="object-cover opacity-30 blur-[1px]" />
              <span className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(30,41,59,0.28),rgba(7,10,15,0.88))]" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white">
                <span className="flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-black/30 shadow-[0_12px_36px_rgba(0,0,0,0.35)] backdrop-blur-sm"><LoaderCircle size={28} className="animate-spin text-[#c9ff29]" /></span>
                <strong className="mt-5 text-[20px] font-extrabold tracking-[0.12em]">生成中</strong>
                <span className="mt-2 text-[12px] font-bold tabular-nums text-white/65">{renderProgress}%</span>
                <span className="mt-5 h-1.5 w-36 overflow-hidden rounded-full bg-white/15">
                  <span className="block h-full rounded-full bg-[#c9ff29] transition-[width] duration-300" style={{ width: `${renderProgress}%` }} />
                </span>
                <span className="mt-3 text-[10.5px] text-white/45">新版本渲染完成后可播放</span>
              </div>
            </div>
          ) : (
            <video key={selectedVersion.id} suppressHydrationWarning src={selectedVersion.video} poster={selectedVersion.poster} controls playsInline preload="metadata" className="aspect-[9/16] max-h-[680px] w-full object-contain" />
          )}
        </div>
        <div>
          <section className="border-b border-[var(--line)] pb-5">
            <p className="text-[10px] font-bold text-[#9a9da5]">结果版本</p>
            <h2 className="mt-1 text-[18px] font-extrabold text-[#202229]">{selectedVersion.id} · {projectName}</h2>
            <p className="mt-2 text-[12px] text-[#777b84]">创建于 {selectedVersion.createdAt} · 来源素材：{selectedVersion.sourceTitle}</p>
          </section>
          <section className="grid gap-4 border-b border-[var(--line)] py-5 md:grid-cols-2">
            <InfoField label="新商品信息" value={selectedVersion.productName} />
            <InfoField label="生成模型" value={selectedVersion.model} />
            <InfoField label="画面配置" value={`${selectedVersion.ratio} · ${selectedVersion.resolution} · ${selectedVersion.duration}s`} />
            <InfoField label="语言与字幕" value={`${selectedVersion.language} · ${selectedVersion.subtitles}`} />
          </section>
          <section className="py-5">
            <div className="flex items-center justify-between">
              <h3 className="text-[14px] font-extrabold text-[#292c32]">历史结果</h3>
              <button type="button" className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[var(--line)] px-3 text-[11px] font-bold text-[#62666f]"><Copy size={12} />复制为新项目</button>
            </div>
            <div className="mt-3 divide-y divide-[var(--line)] border-y border-[var(--line)]">
              {renderingVersion && (
                <button
                  type="button"
                  aria-label={`查看 ${renderingVersion.id} 生成中版本`}
                  aria-pressed={viewingRenderingVersion}
                  onClick={() => onSelectVersion(renderingVersion.id)}
                  className={cn(
                    "relative flex w-full items-center justify-between overflow-hidden px-3 py-3.5 text-left transition-colors",
                    viewingRenderingVersion ? "bg-[#f7fce9] shadow-[inset_3px_0_0_#9dc42d]" : "bg-[#fbfcf8] hover:bg-[#f7fce9]",
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#e9f9b7] text-[#5e7b14]"><LoaderCircle size={14} className="animate-spin" /></span>
                    <div>
                      <p className="text-[12px] font-extrabold text-[#536b16]">{renderingVersion.id}</p>
                      <p className="mt-0.5 text-[10.5px] text-[#7b8b55]">新版本正在生成</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {viewingRenderingVersion && <span className="rounded-full bg-white px-2 py-1 text-[9.5px] font-extrabold text-[#536b16] shadow-sm">当前查看</span>}
                    <span className="rounded-full bg-[#e9f9b7] px-2.5 py-1 text-[9.5px] font-extrabold tabular-nums text-[#536b16]">生成中 {renderProgress}%</span>
                    <span className="text-[10.5px] text-[#8c986f]">预计约 1 分钟</span>
                  </div>
                  <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[#e3ebcd]">
                    <span className="block h-full bg-[#9dc42d] transition-[width] duration-300" style={{ width: `${renderProgress}%` }} />
                  </span>
                </button>
              )}
              {versions.map((version) => {
                const selected = selectedVersion.id === version.id
                return (
                  <button
                    key={version.id}
                    type="button"
                    aria-label={`查看 ${version.id} 版本`}
                    aria-pressed={selected}
                    onClick={() => onSelectVersion(version.id)}
                    className={cn(
                      "flex w-full items-center justify-between px-3 py-3 text-left transition-colors",
                      selected ? "bg-[#f7fce9] shadow-[inset_3px_0_0_#b7eb22]" : "hover:bg-[#fafafa]",
                    )}
                  >
                    <div>
                      <p className={cn("text-[12px] font-extrabold", selected ? "text-[#536b16]" : "text-[#3e4249]")}>{version.id}</p>
                      <p className="mt-0.5 text-[10.5px] text-[#9699a1]">{version.note}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {selected && <span className="rounded-full bg-[#e9f9b7] px-2 py-1 text-[9.5px] font-extrabold text-[#536b16]">当前查看</span>}
                      <span className="text-[10.5px] text-[#9699a1]">{version.createdAt}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </section>
        </div>
      </div>
    </section>
  )
}

function FailedView({ onRetry }: { onRetry: () => void }) {
  return (
    <section className="mx-auto flex max-w-[720px] flex-col items-center py-20 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#fff0f0] text-[#c93636]"><AlertCircle size={26} /></span>
      <h2 className="mt-5 text-[20px] font-extrabold text-[#202229]">视频生成失败</h2>
      <p className="mt-2 text-[12.5px] leading-6 text-[#777b84]">人物参考图在镜头 3 中未通过一致性检查。已保存脚本、商品信息和生成配置。</p>
      <div className="mt-4 rounded-md bg-[#f6f7f8] px-3 py-2 text-[11px] font-mono text-[#747880]">错误编号：RENDER_AVATAR_102</div>
      <button type="button" onClick={onRetry} className="mt-6 inline-flex h-10 items-center gap-2 rounded-md bg-[#17181c] px-5 text-[12px] font-extrabold text-white"><RefreshCw size={14} />重新生成</button>
    </section>
  )
}

function WorkspaceFooter({
  step,
  breakdownStarted,
  busy,
  language,
  onLanguage,
  model,
  onModel,
  ratio,
  onRatio,
  resolution,
  onResolution,
  duration,
  availableCredits,
  estimatedCost,
  hasVideoVersions,
  subtitles,
  onSubtitles,
  onRegenerateScript,
  onBack,
  onNext,
}: {
  step: StepId
  breakdownStarted: boolean
  busy: "analysis" | "script" | null
  language: string
  onLanguage: (value: string) => void
  model: string
  onModel: (value: string) => void
  ratio: string
  onRatio: (value: string) => void
  resolution: string
  onResolution: (value: string) => void
  duration: number
  availableCredits: number
  estimatedCost: number
  hasVideoVersions: boolean
  subtitles: string
  onSubtitles: (value: string) => void
  onRegenerateScript: () => void
  onBack: () => void
  onNext: () => void
}) {
  const labels: Record<StepId, string> = {
    1: breakdownStarted ? "立即复刻" : "拆解分析此视频",
    2: "生成新脚本",
    3: hasVideoVersions ? "生成新版本" : "生成视频",
    4: "视频生成",
  }
  const [activeConfigPopup, setActiveConfigPopup] = useState<"model" | "subtitles" | "settings" | null>(null)
  const footerConfigRef = useRef<HTMLDivElement>(null)
  const insufficientCredits = step === 3 && availableCredits < estimatedCost

  useEffect(() => {
    if (!activeConfigPopup) return
    function closePopup(event: MouseEvent) {
      if (footerConfigRef.current && !footerConfigRef.current.contains(event.target as Node)) {
        setActiveConfigPopup(null)
      }
    }
    document.addEventListener("mousedown", closePopup)
    return () => document.removeEventListener("mousedown", closePopup)
  }, [activeConfigPopup])

  function toggleConfigPopup(popup: "model" | "subtitles" | "settings") {
    setActiveConfigPopup((current) => current === popup ? null : popup)
  }

  return (
    <footer className="border-t border-[var(--line)] bg-white px-5 py-3">
      <div className="mx-auto flex w-full max-w-[1440px] items-center gap-4">
        {step > 1 ? (
          <button type="button" onClick={onBack} className="inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-[12px] font-bold text-[#686c75] hover:bg-[#f3f4f6]"><ArrowLeft size={13} />返回上一步</button>
        ) : (
          <Link href="/replicate" className="inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-[12px] font-bold text-[#686c75] hover:bg-[#f3f4f6]"><ArrowLeft size={13} />返回项目列表</Link>
        )}
        {step === 1 && breakdownStarted && (
          <div className="ml-auto flex min-w-0 items-center gap-4 overflow-hidden whitespace-nowrap text-[11px] text-[#646953]">
            <span className="flex shrink-0 items-center gap-1.5 font-extrabold text-[#333820]"><ScanSearch size={14} />复刻边界</span>
            <span className="truncate"><strong className="text-[#3e4333]">保留：</strong>创意策略、叙事结构</span>
            <span className="truncate"><strong className="text-[#3e4333]">替换：</strong>商品信息、人物，适配新产品卖点、口播</span>
          </div>
        )}
        {step === 2 && (
          <label className="ml-auto flex items-center gap-2">
            <span className="text-right">
              <span className="block text-[11px] font-extrabold text-[#3d4148]">口播语言</span>
            </span>
            <span className="relative">
              <select
                aria-label="口播语言"
                value={language}
                onChange={(event) => onLanguage(event.target.value)}
                className="h-10 min-w-28 appearance-none rounded-md border border-[var(--line)] bg-white py-0 pl-3 pr-8 text-[11.5px] font-bold text-[#4f535b] outline-none focus:border-[#9aa36d]"
              >
                {VOICEOVER_LANGUAGES.map((option) => <option key={option}>{option}</option>)}
              </select>
              <ChevronDown size={12} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#91949b]" />
            </span>
          </label>
        )}
        {step === 3 && (
          <div ref={footerConfigRef} className="ml-auto flex min-w-0 flex-1 items-center justify-end gap-2 whitespace-nowrap py-0.5">
            <button
              type="button"
              disabled={busy !== null}
              onClick={onRegenerateScript}
              className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-[#d9dadd] bg-white px-3 text-[11px] font-bold text-[#4f535b] hover:bg-[#f5f6f7] disabled:cursor-wait disabled:opacity-60"
            >
              {busy === "script" ? <LoaderCircle size={12} className="animate-spin" /> : <RefreshCw size={12} />}
              {busy === "script" ? "正在重新生成" : "重新生成脚本"}
            </button>
            <div className="relative shrink-0">
              <button
                type="button"
                aria-label="选择生成模型"
                aria-expanded={activeConfigPopup === "model"}
                onClick={() => toggleConfigPopup("model")}
                className={cn(
                  FOOTER_PICKER_CLASS,
                  activeConfigPopup === "model" && "border-[#b6d44f] bg-[#efffb8]",
                )}
              >
                <Cpu size={14} />
                <span>{model}</span>
                <ChevronDown size={12} className={cn("text-[#858a92] transition-transform", activeConfigPopup === "model" && "rotate-180")} />
              </button>
              {activeConfigPopup === "model" && (
                <FooterPopup className="w-[224px] p-2">
                  <p className="px-2 pb-1.5 text-[10px] font-bold text-[#9699a1]">生成模型</p>
                  {["Seedance 2.0"].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        onModel(option)
                        setActiveConfigPopup(null)
                      }}
                      className={cn(
                        "flex h-9 w-full items-center justify-between rounded-lg px-2.5 text-left text-[11.5px] font-bold text-[#3f434a] hover:bg-[#f3f4f5]",
                        model === option && "bg-[#f1f1f2] text-[#17181c]",
                      )}
                    >
                      <span>{option}</span>
                      {model === option && <Check size={13} />}
                    </button>
                  ))}
                  <button type="button" disabled className="mt-1 flex h-9 w-full items-center justify-between rounded-lg px-2.5 text-left text-[11.5px] font-bold text-[#bbbfc6]">
                    <span>Seedance 2.5</span>
                    <span className="rounded bg-[#f2f2f3] px-1.5 py-1 text-[8px] font-extrabold text-[#b2b5bb]">Coming Soon</span>
                  </button>
                </FooterPopup>
              )}
            </div>

            <div className="relative shrink-0">
              <button
                type="button"
                aria-label="选择字幕"
                aria-expanded={activeConfigPopup === "subtitles"}
                onClick={() => toggleConfigPopup("subtitles")}
                className={cn(
                  FOOTER_PICKER_CLASS,
                  activeConfigPopup === "subtitles" && "border-[#b6d44f] bg-[#efffb8]",
                )}
              >
                <Captions size={14} />
                <span>{subtitles}</span>
                <ChevronDown size={12} className={cn("text-[#858a92] transition-transform", activeConfigPopup === "subtitles" && "rotate-180")} />
              </button>
              {activeConfigPopup === "subtitles" && (
                <FooterPopup className="w-[176px] p-2">
                  <p className="px-2 pb-1.5 text-[10px] font-bold text-[#9699a1]">字幕</p>
                  {["跟随原视频", "不生成字幕"].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        onSubtitles(option)
                        setActiveConfigPopup(null)
                      }}
                      className={cn(
                        "flex h-9 w-full items-center justify-between rounded-lg px-2.5 text-left text-[11.5px] font-bold text-[#3f434a] hover:bg-[#f3f4f5]",
                        subtitles === option && "bg-[#f1f1f2] text-[#17181c]",
                      )}
                    >
                      <span>{option}</span>
                      {subtitles === option && <Check size={13} />}
                    </button>
                  ))}
                </FooterPopup>
              )}
            </div>

            <div className="relative shrink-0">
              <button
                type="button"
                aria-label="设置视频参数"
                aria-expanded={activeConfigPopup === "settings"}
                onClick={() => toggleConfigPopup("settings")}
                className={cn(
                  FOOTER_PICKER_CLASS,
                  activeConfigPopup === "settings" && "border-[#b6d44f] bg-[#efffb8]",
                )}
              >
                <SlidersHorizontal size={14} />
                <span>{resolution} · {ratio} · 预估{duration}s</span>
                <ChevronDown size={12} className={cn("text-[#858a92] transition-transform", activeConfigPopup === "settings" && "rotate-180")} />
              </button>
              {activeConfigPopup === "settings" && (
                <FooterPopup className="right-0 w-[306px] p-4">
                  <div>
                    <p className="mb-2 text-[11px] font-bold text-[#4f535b]">分辨率</p>
                    <div className="grid grid-cols-2 gap-2">
                      {["720P", "1080P"].map((option) => (
                        <button
                          key={option}
                          type="button"
                          aria-pressed={resolution === option}
                          onClick={() => onResolution(option)}
                          className={cn(
                            "h-9 rounded-xl border text-[11.5px] font-extrabold transition-colors",
                            resolution === option
                              ? "border-[#efeff0] bg-[#f0f0f1] text-[#272a30]"
                              : "border-[var(--line)] bg-white text-[#777b84] hover:border-[#b9bdc5]",
                          )}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="mb-2 text-[11px] font-bold text-[#4f535b]">宽高比</p>
                    <div className="grid grid-cols-4 gap-2">
                      {["9:16", "16:9", "1:1", "4:3", "3:4"].map((option) => (
                        <button
                          key={option}
                          type="button"
                          aria-pressed={ratio === option}
                          onClick={() => onRatio(option)}
                          className={cn(
                            "flex h-14 flex-col items-center justify-center gap-1 rounded-xl border text-[9px] font-bold transition-colors",
                            ratio === option
                              ? "border-[#efeff0] bg-[#f0f0f1] text-[#272a30]"
                              : "border-[var(--line)] bg-white text-[#777b84] hover:border-[#b9bdc5]",
                          )}
                        >
                          <FooterRatioIcon ratio={option} />
                          <span>{option}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mt-4 border-t border-[var(--line)] pt-4">
                    <p className="mb-2 text-[11px] font-bold text-[#4f535b]">时长</p>
                    <div className="flex items-center justify-between rounded-xl bg-[#f5f5f6] px-3 py-2.5">
                      <span className="text-[11.5px] font-extrabold text-[#30333a]">跟随原视频</span>
                      <span className="text-[10.5px] font-bold text-[#7a7e86]">预估时长 {duration} s</span>
                    </div>
                  </div>
                </FooterPopup>
              )}
            </div>

            <span
              title={`预估消耗 ${estimatedCost} 积分，当前余额 ${availableCredits} 积分`}
              className={cn(
                "inline-flex h-9 shrink-0 items-center gap-1 rounded-full px-3 text-[12px] font-extrabold",
                insufficientCredits ? "bg-[#fff0e6] text-[#b54708]" : "bg-[#efffb8] text-[#263000]",
              )}
            >
              <Zap size={13} fill="currentColor" />
              {estimatedCost}
            </span>
          </div>
        )}
        <button
          type="button"
          disabled={busy !== null || insufficientCredits}
          onClick={onNext}
          title={insufficientCredits ? `当前余额 ${availableCredits} 积分，本次预计消耗 ${estimatedCost} 积分` : undefined}
          className={cn(
            "inline-flex h-10 shrink-0 items-center gap-2 rounded-md bg-[#17181c] px-4 text-[12.5px] font-extrabold text-white hover:bg-[#303238] disabled:opacity-60",
            busy !== null ? "disabled:cursor-wait" : "disabled:cursor-not-allowed",
            step === 1 && !breakdownStarted && "ml-auto",
          )}
        >
          {busy ? <LoaderCircle size={14} className="animate-spin" /> : step === 3 ? <WandSparkles size={14} /> : <ArrowRight size={14} />}
          {busy === "analysis" ? "正在拆解视频" : busy === "script" ? "正在生成脚本" : insufficientCredits ? "积分不足" : labels[step]}
        </button>
      </div>
    </footer>
  )
}

const FOOTER_PICKER_CLASS = "inline-flex h-9 items-center gap-1.5 rounded-full border border-[#e2e3e6] bg-[#f6f6f7] px-3 text-[11px] font-extrabold text-[#3f434a] transition-colors hover:bg-[#efeff0]"

function FooterPopup({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn(
      "absolute bottom-[calc(100%+10px)] left-0 z-40 rounded-2xl border border-[var(--line)] bg-white shadow-[0_18px_42px_rgba(9,9,11,0.14)]",
      className,
    )}>
      {children}
    </div>
  )
}

function FooterRatioIcon({ ratio }: { ratio: string }) {
  const [widthPart, heightPart] = ratio.split(":").map(Number)
  const maxDimension = 14
  const width = widthPart >= heightPart ? maxDimension : Math.max(5, Math.round(maxDimension * widthPart / heightPart))
  const height = heightPart >= widthPart ? maxDimension : Math.max(5, Math.round(maxDimension * heightPart / widthPart))
  return <span style={{ width, height }} className="block shrink-0 rounded-[2px] border-[1.5px] border-current" />
}

function StepHeader({ title, description, centered = false }: { title: string; description: string; centered?: boolean }) {
  return (
    <div className={centered ? "text-center" : ""}>
      <h2 className="text-[20px] font-extrabold text-[#202229]">{title}</h2>
      <p className="mt-1 text-[12px] text-[#858992]">{description}</p>
    </div>
  )
}

function EmotionJourney({ items }: { items: string[] }) {
  return (
    <div>
      <p className="text-[10px] font-bold text-[#94a0b4]">情绪曲线</p>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {items.map((item) => <span key={item} className="rounded-full border border-[#ddd2ff] bg-[#f2edff] px-2.5 py-1 text-[10.5px] font-extrabold text-[#7436d9]">{item}</span>)}
      </div>
    </div>
  )
}


function InfoField({ label, value }: { label: string; value: string }) {
  return <div><p className="text-[10px] font-bold text-[#94a0b4]">{label}</p><p className="mt-1 text-[11.5px] leading-5 text-[#152238]">{value}</p></div>
}

function DetectedItem({
  name,
  description,
  primaryLabel,
}: {
  name: string
  description: string
  primaryLabel?: string
}) {
  return (
    <div
      className={cn(
        "rounded-md border px-3 py-2.5",
        primaryLabel
          ? "border-[#9fbd45] bg-[#f8fce9] shadow-[inset_3px_0_0_#9fbd45]"
          : "border-[var(--line)] bg-white",
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <p className={cn("text-[12px] font-extrabold", primaryLabel ? "text-[#27320d]" : "text-[#33363d]")}>{name}</p>
        {primaryLabel && (
          <span className="rounded bg-[#e6f6b9] px-1.5 py-0.5 text-[9px] font-extrabold text-[#526b12]">
            {primaryLabel}
          </span>
        )}
      </div>
      <p className="mt-1 text-[11px] leading-5 text-[#202229]">{description}</p>
    </div>
  )
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="text-[10.5px] font-bold text-[#777b84]">
      {label}
      <input value={value} onChange={(event) => onChange(event.target.value)} className="mt-1.5 h-10 w-full rounded-md border border-[var(--line)] px-3 text-[12px] text-[#34373d] outline-none focus:border-[#9aa36d]" />
    </label>
  )
}

function TextAreaField({ label, value, onChange, className }: { label: string; value: string; onChange: (value: string) => void; className?: string }) {
  return (
    <label className={cn("text-[10.5px] font-bold text-[#777b84]", className)}>
      {label}
      <textarea value={value} onChange={(event) => onChange(event.target.value)} className="mt-1.5 min-h-24 w-full resize-none rounded-md border border-[var(--line)] p-3 text-[12px] leading-5 text-[#34373d] outline-none focus:border-[#9aa36d]" />
    </label>
  )
}
