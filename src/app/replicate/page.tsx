import { Topbar } from "@/components/layout/topbar"
import { ReplicateBetaHub } from "@/components/replicate/beta/replicate-beta-hub"

export default function ReplicateHubPage() {
  return (
    <>
      <Topbar title="高保真复刻" />
      <ReplicateBetaHub />
    </>
  )
}
