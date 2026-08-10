import { CreditPurchasePanel } from "@/components/settings/credit-purchase-panel"
import { Topbar } from "@/components/layout/topbar"
import { SettingsShell } from "@/components/settings/settings-shell"

export default function CreditPurchasePage() {
  return (
    <>
      <Topbar title="积分充值" />
      <SettingsShell title="购买积分" wide>
        <CreditPurchasePanel />
      </SettingsShell>
    </>
  )
}
