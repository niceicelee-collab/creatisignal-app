import { AigcHitsContent } from "@/components/aigc-hits/aigc-hits-content"
import { Topbar } from "@/components/layout/topbar"

export default function AigcHitsPage() {
  return (
    <>
      <Topbar title="AIGC爆款" />
      <main className="flex-1 overflow-y-auto">
        <AigcHitsContent />
      </main>
    </>
  )
}