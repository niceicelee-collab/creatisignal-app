import { Topbar } from "@/components/layout/topbar"
import { ReplicateBetaHub } from "@/components/replicate/beta/replicate-beta-hub"
import { DiscoveryTasks } from "@/components/discovery/material-flow"

export default function ReplicateHubPage() {
  return (
    <>
      <Topbar title="高保真复刻" />
      <DiscoveryTasks kind="replicate" />
      <ReplicateBetaHub />
    </>
  )
}
