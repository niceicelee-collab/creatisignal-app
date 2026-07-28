import { Topbar } from "@/components/layout/topbar"
import { ReplicateBetaWorkspace } from "@/components/replicate/beta/replicate-beta-workspace"
import { ReplicateWorkspace } from "@/components/replicate/replicate-workspace"
import { MATERIALS } from "@/lib/insights/mock"

// Next.js 16: params + searchParams are Promises — must await
export default async function ReplicatePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ asset?: string; product?: string; source?: string; step?: string; title?: string; upload?: string }>
}) {
  const { id } = await params
  const { asset, product, source, step: stepRaw, title, upload } = await searchParams

  if (id.startsWith("beta-")) {
    return (
      <div className="flex h-screen min-h-0 flex-col overflow-hidden">
        <Topbar title="高保真复刻" />
        <ReplicateBetaWorkspace
          projectId={id}
          title={title}
          sourceAssetId={asset}
          sourceType={source}
          uploadedSourceName={upload}
        />
      </div>
    )
  }

  const material = MATERIALS.find((m) => m.fingerprint === id) ?? null
  // step 显式优先；否则交给 workspace 按 source 推断
  const stepNum = stepRaw ? Number(stepRaw) : NaN
  const initialStep = (stepNum >= 1 && stepNum <= 4 ? stepNum : undefined) as 1 | 2 | 3 | 4 | undefined

  return (
    <>
      <Topbar title="高保真复刻" />
      <ReplicateWorkspace
        material={material}
        materialId={id}
        productSkuFromQuery={product}
        sourceFromQuery={source}
        initialStep={initialStep}
        projectTitle={title}
      />
    </>
  )
}
