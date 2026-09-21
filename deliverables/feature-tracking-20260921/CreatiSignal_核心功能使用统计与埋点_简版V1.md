# CreatiSignal 核心功能使用统计与埋点 · 简版 V1

依据：2026-09-21 已登录线上页面及实际可见操作。本文为建议的埋点清单，不代表现有埋点已实现。

范围：用户侧首页、洞察、发现、创作、工具、资产、任务和设置。排除最后的“管理”模块。以当前线上导航名称为准。

## 1. 统一统计指标

| 指标 | 口径 |
|---|---|
| 页面 PV / UV | 页面访问次数 / 周期内访问该页面的去重用户数。页面切换或重新进入计一次；局部刷新、任务状态轮询不新增 PV。 |
| 功能使用人数 | 周期内触发该功能“主要使用口径”的去重用户数，口径见下一表。 |
| 功能使用次数 | 周期内满足该功能主要使用口径的次数。点击、提交、成功分别统计，不相加。 |
| 人均使用频次 | 同一周期内，功能使用次数 ÷ 功能使用人数；支持按日、周、月查看。无人使用时显示“—”。 |
| 使用天数 / 最近使用时间 | 按用户、功能统计周期内发生使用的自然日数，以及最后一次使用的时间。 |
| 成功人数 / 成功任务数 | 有生成、分析、报告等任务的功能，另外统计成功用户与成功任务；与提交指标分开。 |

默认按登录用户 ID 去重；组织 / 工作空间作为分组维度。内部测试账号需要能够筛除。支持查看“某个用户使用了哪些功能、每个功能用了几次”。

## 2. 核心功能与埋点清单

所有页面统一记录页面访问，表内不重复列出。新增“具体埋点名称”列，按“页面名称 + 功能名称 + 操作事件名称”使用小写英文和下划线命名，例如：点击创意生成 → `home_creative_feature_click`。同一个筛选或分类切换事件通过属性记录具体选项，不为每个选项重复命名。

| 模块 / 功能 | 主要使用口径及补充统计 | 核心埋点事件 | 具体埋点名称 |
|---|---|---|---|
| 首页 · 创意生成 | 生成提交被受理的人数、次数；成功任务数、产出视频数、下载点击数 | 点击创意生成；提交视频生成；生成成功 / 失败；查看生成结果；点击下载；点击调整提示词再生成 | 点击创意生成：`home_creative_feature_click`<br>提交视频生成：`home_creative_video_submit`<br>生成成功：`home_creative_video_success`<br>生成失败：`home_creative_video_fail`<br>查看生成结果：`home_creative_result_view`<br>点击下载：`home_creative_download_click`<br>点击调整提示词再生成：`home_creative_regenerate_click` |
| 首页 · 创意报告 | 报告提交被受理的人数、次数；报告成功数、查看次数 | 点击创意报告；提交报告；报告成功 / 失败；查看报告 | 点击创意报告：`home_report_feature_click`<br>提交报告：`home_report_generate_submit`<br>报告成功：`home_report_generate_success`<br>报告失败：`home_report_generate_fail`<br>查看报告：`home_report_result_view` |
| 首页 · 创意分析 | 分析提交被受理的人数、次数；分析成功数、结果查看次数 | 点击创意分析；选择 / 上传素材成功；提交分析；分析成功 / 失败；查看分析结果 | 点击创意分析：`home_analysis_feature_click`<br>选择素材成功：`home_analysis_material_select_success`<br>上传素材成功：`home_analysis_material_upload_success`<br>提交分析：`home_analysis_analyze_submit`<br>分析成功：`home_analysis_analyze_success`<br>分析失败：`home_analysis_analyze_fail`<br>查看分析结果：`home_analysis_result_view` |
| 首页 · 创意脚本 | Brief 提交被受理的人数、次数；脚本成功数、查看次数 | 点击创意脚本；提交生成 Brief；脚本生成成功 / 失败；查看脚本 | 点击创意脚本：`home_script_feature_click`<br>提交生成 Brief：`home_script_brief_submit`<br>脚本生成成功：`home_script_generate_success`<br>脚本生成失败：`home_script_generate_fail`<br>查看脚本：`home_script_result_view` |
| 首页 · 最近任务 | 点击任务卡片的人数、次数；结果实际打开人数、次数 | 最近任务卡片点击；切换任务分类；点击查看全部；查看任务结果；点击下载；点击调整提示词再生成 | 最近任务卡片点击：`home_recent_tasks_card_click`<br>切换任务分类：`home_recent_tasks_type_change`<br>点击查看全部：`home_recent_tasks_view_all_click`<br>查看任务结果：`home_recent_tasks_result_view`<br>点击下载：`home_recent_tasks_download_click`<br>点击调整提示词再生成：`home_recent_tasks_regenerate_click` |
| 首页 · 爆款推荐 | 推荐素材详情查看人数、次数；进入后续创作的人数 | 切换市场 / 自有 / 竞对爆款；点击素材卡片；查看素材详情；点击查看更多；点击立即复刻 | 切换爆款类型：`home_hits_type_change`<br>点击素材卡片：`home_hits_card_click`<br>查看素材详情：`home_hits_detail_view`<br>点击查看更多：`home_hits_view_more_click`<br>点击立即复刻：`home_hits_replicate_click` |
| 洞察 · 素材洞察 / 素材增长诊断 | 已加载经营总览、素材诊断的人数、次数；按页签分别统计 | 查看经营总览；查看素材诊断；应用时间 / 广告主 / 店铺筛选；点击 GMV Max 诊断入口 | 查看经营总览：`materials_insight_overview_view`<br>查看素材诊断：`materials_insight_diagnosis_view`<br>应用筛选：`materials_insight_filter_apply`<br>点击 GMV Max 诊断入口：`materials_insight_gmv_diagnosis_click` |
| 发现 · 灵感发现 | 素材详情查看人数、次数；搜索人数、进入复刻人数 | 提交搜索；应用筛选；查看素材详情；点击立即复刻 | 提交搜索：`discover_inspiration_search_submit`<br>应用筛选：`discover_inspiration_filter_apply`<br>查看素材详情：`discover_inspiration_detail_view`<br>点击立即复刻：`discover_inspiration_replicate_click` |
| 发现 · AIGC 爆款 | 案例详情查看人数、次数；复制提示词人数、进入复刻人数 | 应用筛选；查看案例详情；复制提示词成功；点击立即复刻 | 应用筛选：`aigc_hits_case_filter_apply`<br>查看案例详情：`aigc_hits_case_detail_view`<br>复制提示词成功：`aigc_hits_case_prompt_copy_success`<br>点击立即复刻：`aigc_hits_case_replicate_click` |
| 发现 · Seedance 爆款 | 提示词详情查看人数、次数；点击生成同款人数、次数 | 切换分类；查看提示词详情；点击生成同款 | 切换分类：`seedance_prompts_prompt_category_change`<br>查看提示词详情：`seedance_prompts_prompt_detail_view`<br>点击生成同款：`seedance_prompts_prompt_generate_click` |
| 发现 · 品牌追踪 | 品牌详情查看人数、次数；另外统计新增追踪人数、品牌数 | 搜索品牌；提交添加品牌追踪；追踪添加成功 / 失败；查看品牌详情；查看品牌素材 | 搜索品牌：`discover_brand_tracking_search_submit`<br>提交添加品牌追踪：`discover_brand_tracking_add_submit`<br>追踪添加成功：`discover_brand_tracking_add_success`<br>追踪添加失败：`discover_brand_tracking_add_fail`<br>查看品牌详情：`discover_brand_tracking_detail_view`<br>查看品牌素材：`discover_brand_tracking_material_view` |
| 创作 · 高保真复刻 | 首次拆解提交被受理的用户数、项目数；各步骤使用人数及生成成功数 | 点击新建复刻项目；提交爆款拆解；拆解成功 / 失败；确认商品与人物；提交脚本转写；脚本转写成功 / 失败；提交视频生成；生成成功 / 失败；点击再次生成；点击下载 MP4；继续已有项目 | 点击新建复刻项目：`replicate_project_create_click`<br>提交爆款拆解：`replicate_analysis_submit`<br>拆解成功：`replicate_analysis_success`<br>拆解失败：`replicate_analysis_fail`<br>确认商品与人物：`replicate_product_character_confirm`<br>提交脚本转写：`replicate_script_rewrite_submit`<br>脚本转写成功：`replicate_script_rewrite_success`<br>脚本转写失败：`replicate_script_rewrite_fail`<br>提交视频生成：`replicate_video_generate_submit`<br>生成成功：`replicate_video_generate_success`<br>生成失败：`replicate_video_generate_fail`<br>点击再次生成：`replicate_video_regenerate_click`<br>点击下载 MP4：`replicate_video_download_click`<br>继续已有项目：`replicate_project_continue_click` |
| 创作 · 创意画布 | 发生新增节点或提交生成的去重用户数、画布数；打开画布人数单列 | 创建项目成功；创建画布成功；打开画布；添加节点成功；提交节点生成；节点生成成功 / 失败。节点类型区分文本、图片、视频、音频、主体、剪辑、导演台等 | 创建项目成功：`creative_canvas_project_create_success`<br>创建画布成功：`creative_canvas_canvas_create_success`<br>打开画布：`creative_canvas_canvas_view`<br>添加节点成功：`creative_canvas_node_add_success`<br>提交节点生成：`creative_canvas_node_generate_submit`<br>节点生成成功：`creative_canvas_node_generate_success`<br>节点生成失败：`creative_canvas_node_generate_fail` |
| 工具 · 报表制作 | 报表申请被受理的人数、次数；报告成功数、查看次数 | 切换报告类型；提交报表申请；报表成功 / 失败；查看历史报告 | 切换报告类型：`report_studio_report_type_change`<br>提交报表申请：`report_studio_report_apply_submit`<br>报表成功：`report_studio_report_generate_success`<br>报表失败：`report_studio_report_generate_fail`<br>查看历史报告：`report_studio_report_history_view` |
| 工具 · GMV Max 创编 | 当前先统计页面访问和新建入口点击人数、次数；正式使用口径待新建流程核对 | 点击新建 GMV MAX 广告。待确认后补充：提交创编、创编成功 / 失败 | 点击新建 GMV MAX 广告：`gmv_max_ad_create_click`<br>提交创编（待确认）：`gmv_max_ad_create_submit`<br>创编成功（待确认）：`gmv_max_ad_create_success`<br>创编失败（待确认）：`gmv_max_ad_create_fail` |
| 资产 · 商品库 | 商品创建 / 修改成功人数、次数；商品被创作流程选用的人数、次数 | 提交链接识别；识别成功 / 失败；创建商品成功；修改商品成功；从商品库确认选用商品 | 提交链接识别：`product_library_product_link_parse_submit`<br>识别成功：`product_library_product_link_parse_success`<br>识别失败：`product_library_product_link_parse_fail`<br>创建商品成功：`product_library_product_create_success`<br>修改商品成功：`product_library_product_update_success`<br>从商品库确认选用商品：`product_library_product_select_confirm` |
| 资产 · 我的创意（页面标题：资产库） | 资产详情查看人数、次数；下载点击数、再生成提交数 | 切换创意生成 / 创意报告 / 创意分析 / 创意脚本；查看资产详情；点击下载；点击调整提示词再生成 | 切换资产类型：`creative_library_asset_type_change`<br>查看资产详情：`creative_library_asset_detail_view`<br>点击下载：`creative_library_asset_download_click`<br>点击调整提示词再生成：`creative_library_asset_regenerate_click` |
| 任务 · 我的任务 | 任务卡片点击人数、次数；结果查看人数、次数 | 搜索 / 筛选任务；任务卡片点击；查看任务结果。已有任务的查看不计入新建任务 | 搜索任务：`my_tasks_task_search_submit`<br>筛选任务：`my_tasks_task_filter_apply`<br>任务卡片点击：`my_tasks_task_card_click`<br>查看任务结果：`my_tasks_task_result_view` |
| 设置 · 数据源 | 授权连接成功人数；手动同步提交人数、次数 | 点击连接 / 编辑授权；授权成功 / 失败；提交手动刷新数据；同步成功 / 失败 | 点击连接授权：`data_sources_account_connect_click`<br>点击编辑授权：`data_sources_account_edit_click`<br>授权成功：`data_sources_account_authorize_success`<br>授权失败：`data_sources_account_authorize_fail`<br>提交手动刷新数据：`data_sources_sync_manual_submit`<br>同步成功：`data_sources_sync_success`<br>同步失败：`data_sources_sync_fail` |

账户设置、我的积分、我的反馈，本版先保留页面 PV / UV；充值、认证和反馈流程不展开。

## 3. 事件命名规则

事件名采用 `页面名称_功能名称_操作事件名称`，具体以上表为准。页面和功能名称可由多个英文单词组成，统一使用小写下划线格式。例：`home`（首页）+`creative`（创意生成）+`feature_click`（功能入口点击）=`home_creative_feature_click`。

`home` 对应当前首页 `/chat`；其余页面名称沿用路由含义，例如 `replicate`、`creative_canvas`、`product_library`。同一页面的不同功能分别命名，例如首页的 `creative`、`report`、`analysis`、`script`、`recent_tasks`、`hits`。复刻流程按 `project`、`analysis`、`product`、`script`、`video` 区分功能。

| 操作事件命名 | 触发时机 | 具体示例 |
|---|---|---|
| `feature_click` / `对象_click` | 用户点击对应功能入口、按钮或卡片 | `home_creative_feature_click`、`home_recent_tasks_card_click` |
| `操作_submit` | 业务操作的有效提交被系统受理；搜索提交仅表示用户确认搜索，不算生成任务使用 | `home_creative_video_submit`、`discover_inspiration_search_submit` |
| `操作_success` / `操作_fail` | 对应操作出现确定结果；成功与失败各使用一个独立事件名 | `home_creative_video_success`、`home_creative_video_fail` |
| `内容_view` | 对应内容成功打开并展示 | `home_recent_tasks_result_view`、`discover_inspiration_detail_view` |
| `对象_change` / `filter_apply` | 分类发生切换，或用户应用筛选条件 | `home_recent_tasks_type_change`、`materials_insight_filter_apply` |
| `操作_confirm` | 用户确认该步骤，确认结果生效 | `replicate_product_character_confirm`、`product_library_product_select_confirm` |
| `prompt_copy_success` | 提示词复制成功 | `aigc_hits_case_prompt_copy_success` |
| `download_click` | 用户点击下载，不等同于文件已下载完成 | `home_creative_download_click` |

页面 PV 使用 `页面名称_page_view`，例如 `home_page_view`、`discover_page_view`、`replicate_page_view`；页面访问属于页面级事件，不附加功能名称。同一路由内的页签与弹窗按表中的功能事件统计，不重复增加页面 PV。通用动作名只用于命名说明，不再额外上报一条同义通用事件。

每条记录至少带 `event_name`（具体埋点名称）、`event_id`、`event_time`、`user_id`、`organization_id`、`workspace_id`、`page`、`feature`、`action`。组织与工作空间按产品实际标识填写。

按需补充：

- 来源：`entry_source`，例如首页最近任务、我的任务、我的创意、灵感发现、AIGC 爆款、Seedance 爆款、复刻、画布。
- 业务对象：`project_id`、`canvas_id`、`task_id`、`content_id`、`product_id`、`brand_id`，适用时填写。
- 类型：`task_type`、`report_type`、`content_type`、`node_type`；生成任务补充模型、时长、比例、数量等已选参数。
- 结果：`result`、`error_code`；任务卡片点击补充点击时的 `task_status`。不需要上传用户完整提示词、商品描述等正文。

最近任务示例：`home_recent_tasks_card_click` + `entry_source=home_recent_tasks` + `task_type=creative_generation` + `task_id`；详情成功打开后再记录 `home_recent_tasks_result_view`。分类切换补充目标 `task_type`，其他分类 / 筛选事件同样用属性记录目标选项。

## 4. 必须统一的计数规则

1. **点击、提交、完成分开。** 点击“生成同款”“再次生成”“调整提示词再生成”只代表发起意图；新任务真正被受理后，才增加生成使用次数。
2. **任务结果只记录一次。** 后台生成完成时记录成功 / 失败；用户未打开结果也应计入。随后从首页、任务页或资产库打开结果，只增加查看事件。
3. **保留同一业务任务标识。** 对事件重发按 `event_id` 去重；同一任务同一最终结果按 `task_id + result` 去重。重试产生新的执行标识，区分原任务与新尝试。
4. **批量提交与产出数量分开。** 一次被受理的批量提交计一次操作，任务数和产出视频数单列；不把生成 4 条视频直接当成点击了 4 次生成。
5. **完整流程与步骤分开。** 一个复刻项目首次进入拆解算一个使用项目；商品确认、脚本转写、视频生成分别统计步骤，不相加作为复刻项目数。画布使用数按周期内有实际动作的画布去重，不以节点数量代替画布数。
6. **同一能力跨入口汇总统计。** 具体事件名区分页面和功能，通过统一的 `task_type` 汇总视频生成、分析、报告、脚本，再按 `entry_source` 分组。一个任务只记录实际提交入口对应的一组提交 / 结果事件；异步结果沿用该任务提交时的入口，不因用户后来打开其他页面而换名或重复上报。
7. **自动同步不算用户主动使用。** 数据源自动同步与用户点击“刷新数据”分开；功能使用次数只取手动触发。

## 5. 当前页面的边界

- “管理”模块完全排除。
- 投放中心、浏览器插件、Skills Hub 显示“即将上线”，Facebook Ads 显示“即将支持”：只统计可见入口访问，不计入功能使用排行榜。
- GMV Max 创编的新建入口、素材洞察中的 GMV Max 诊断入口可见；本次点击后未展开后续流程，提交与成功事件需要补充核对，不能以入口点击代替成功使用。
- 创意画布确认了已有画布、节点类型与入口；各类节点的具体生成完成状态仍需按实际任务能力接入。
- 本次核对页面和已有结果，未新建付费生成或投放任务；表中的成功 / 失败事件是埋点需求，需接入真实业务结果。

建议最终提供两张统计表：① 功能使用总览（功能、访问人数、使用人数、次数、人均频次、成功数）；② 用户功能明细（用户、功能、使用次数、使用天数、最近使用时间）。

## 6. 带货精选、我的收藏与源视频下载环节补充

依据：2026-09-21《带货精选·修订说明》及当前本地页面实现。以下为建议埋点，不代表已在生产环境上线。

本节“下载视频”指从素材详情点击“分析”或“复刻”后，系统为任务获取源视频的环节。源视频下载由系统自动触发，开始事件不依赖用户点击“下载”按钮。原有 `replicate_video_download_click` 继续表示生成结果的 MP4 下载点击，与本节分别统计。

页面名称约定：`curated`＝带货精选（`/discover/curated`）；`favorites`＝我的收藏（`/assets/favorites`）；`video_analysis`＝视频分析（`/reports/material/:id`）；`replicate`＝高保真复刻（`/replicate/material/:id`）。

沿用页面访问规则：`curated_page_view`、`favorites_page_view`、`video_analysis_page_view`、`replicate_page_view`。后者复用原有页面事件，通过页面属性区分源视频准备页与其他复刻步骤，不另起同义事件。

| 模块 / 功能 | 主要使用口径及补充统计 | 核心埋点事件 | 具体埋点名称 |
|---|---|---|---|
| 带货精选 | 页面 PV / UV；素材详情查看人数、次数；收藏人数、次数；进入分析 / 复刻人数 | 应用或清除筛选；切换排序；查看素材详情；收藏成功；取消收藏成功；点击打开原视频；复制链接成功；点击查看商品；点击复刻；点击分析 | 应用或清除筛选：`curated_material_filter_apply`<br>切换排序：`curated_material_sort_change`<br>查看素材详情：`curated_material_detail_view`<br>收藏成功：`curated_material_favorite_add_success`<br>取消收藏成功：`curated_material_favorite_remove_success`<br>点击打开原视频：`curated_material_original_video_click`<br>复制链接成功：`curated_material_link_copy_success`<br>点击查看商品：`curated_material_product_click`<br>点击复刻：`curated_material_replicate_click`<br>点击分析：`curated_material_analysis_click` |
| 我的收藏 | 页面 PV / UV；收藏素材详情查看人数、次数；取消收藏人数、次数；进入分析 / 复刻人数 | 查看收藏素材详情；取消收藏成功；点击打开原视频；复制链接成功；点击查看商品；点击复刻；点击分析 | 查看收藏素材详情：`favorites_material_detail_view`<br>取消收藏成功：`favorites_material_favorite_remove_success`<br>点击打开原视频：`favorites_material_original_video_click`<br>复制链接成功：`favorites_material_link_copy_success`<br>点击查看商品：`favorites_material_product_click`<br>点击复刻：`favorites_material_replicate_click`<br>点击分析：`favorites_material_analysis_click` |
| 视频分析 · 源视频下载环节 | 进入下载环节人数；实际下载尝试次数；成功 / 失败次数；下载耗时；进入分析次数 | 展示源视频下载环节；源视频实际开始下载；源视频下载成功；源视频下载失败；下载后实际开始分析 | 展示源视频下载环节：`video_analysis_source_video_download_view`<br>源视频实际开始下载：`video_analysis_source_video_download_start`<br>源视频下载成功：`video_analysis_source_video_download_success`<br>源视频下载失败：`video_analysis_source_video_download_fail`<br>下载后实际开始分析：`video_analysis_video_analyze_start` |
| 高保真复刻 · 源视频下载环节 | 进入下载环节人数；实际下载尝试次数；成功 / 失败次数；下载耗时；进入爆款拆解次数 | 展示源视频下载环节；源视频实际开始下载；源视频下载成功；源视频下载失败；下载后实际开始爆款拆解 | 展示源视频下载环节：`replicate_source_video_download_view`<br>源视频实际开始下载：`replicate_source_video_download_start`<br>源视频下载成功：`replicate_source_video_download_success`<br>源视频下载失败：`replicate_source_video_download_fail`<br>下载后实际开始爆款拆解：`replicate_analysis_start` |

统计口径：

- 带货精选、我的收藏的主要使用人数按详情成功打开的去重用户数计算；收藏、复制链接、分析入口和复刻入口的使用人数分别统计，不相加。
- 筛选事件在条件实际生效时上报，涵盖地区、达人、商品、粉丝量和视频条件；携带 `filter_key`、`filter_value`、`filter_action=set/remove/clear`。搜索国家后选中地区也归为地区筛选；不记录已删除的素材关键词搜索。我的收藏当前无筛选与可切换排序，不新增对应事件。
- 点击封面、标题或商品缩略图打开的是同一素材详情，统一记录详情查看，并用 `click_target=cover/title/product_thumbnail` 区分来源；详情中的“查看商品”外链按钮使用 `product_click`。
- 收藏 / 取消收藏仅在保存成功、状态实际改变时计一次。跨页面同步展示不重复上报，重复收藏同一素材不新增成功次数。复制链接同样以复制成功为准。
- “打开原视频”“查看商品”“复刻”“分析”记录点击，不代表站外页面已经加载或后续任务已经成功；禁用按钮不记录成功使用。
- 下载环节的 `view` 记录该环节成功展示；`start` 记录实际下载尝试开始；`success` 记录源视频文件获取完成且可供后续处理；`fail` 记录确定的下载失败。下载进度更新、状态轮询不重复计数。
- 使用 `task_id + download_attempt_id` 标识一次实际下载尝试，一次尝试只记一次开始和一个终态。真正重试时产生新的尝试标识；重新打开页面不重复记下载。下载耗时按同一次尝试的开始到终态计算。
- 下载后进入分析 / 拆解的事件以对应处理任务实际开始为准。若复用已有视频或分析结果，使用 `is_reused=true` 标记实际发生的后续处理事件，不虚报一次下载开始或成功；已有结果直接打开也不记处理开始。
- 来源保留 `entry_source=curated/favorites`；一次从带货精选发起的任务，不能因收藏页同步或后续查看而重复统计。

沿用第 3 节公共属性，补充 `material_id`、`task_id`、`entry_source`；下载事件补充 `download_attempt_id`、`duration_ms`、`error_code`，按事件实际情况填写。分类和排序值采用属性，不拆成大量不同事件名。

当前本地下载 / 分析状态按演示计时切换，尚不能据此上报真实下载成功或分析开始。上述任务事件需在真实下载与处理能力接入后，根据实际任务结果触发。
