"use client"

import { useRef, useState } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { Check, Upload, X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface DHItem {
  id: string
  thumb: string
  name: string
}

type AvatarItem = DHItem

const mockAvatars: AvatarItem[] = [
  { id: "dh-amy", name: "安然", thumb: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=420&h=560&q=85" },
  { id: "dh-chen", name: "陈墨", thumb: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=420&h=560&q=85" },
  { id: "dh-lin", name: "林夕", thumb: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=420&h=560&q=85" },
  { id: "dh-zhou", name: "周野", thumb: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=420&h=560&q=85" },
  { id: "dh-xia", name: "夏朵", thumb: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=420&h=560&q=85" },
  { id: "dh-yi", name: "一鸣", thumb: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=420&h=560&q=85" },
  { id: "dh-nuan", name: "暖暖", thumb: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=420&h=560&q=85" },
  { id: "dh-shen", name: "沈川", thumb: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=420&h=560&q=85" },
  { id: "dh-ke", name: "可可", thumb: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=420&h=560&q=85" },
  { id: "dh-rui", name: "瑞安", thumb: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&w=420&h=560&q=85" },
  { id: "dh-susu", name: "苏苏", thumb: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=420&h=560&q=85" },
  { id: "dh-luo", name: "洛川", thumb: "https://images.unsplash.com/photo-1521119989659-a83eee488004?auto=format&fit=crop&w=420&h=560&q=85" },
]

export function DigitalHumanModal({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm?: (item: DHItem) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploadedAvatar, setUploadedAvatar] = useState<AvatarItem | null>(null)
  const [selectedId, setSelectedId] = useState(mockAvatars[0].id)
  const avatars = uploadedAvatar ? [uploadedAvatar, ...mockAvatars] : mockAvatars
  const selectedAvatar = avatars.find((avatar) => avatar.id === selectedId)

  function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    const avatar = {
      id: `local-${Date.now()}`,
      name: file.name.replace(/\.[^/.]+$/, "") || "本地数字人",
      thumb: URL.createObjectURL(file),
    }
    setUploadedAvatar(avatar)
    setSelectedId(avatar.id)
    event.target.value = ""
  }

  function handleConfirm() {
    if (!selectedAvatar) return
    onConfirm?.({ id: selectedAvatar.id, thumb: selectedAvatar.thumb, name: selectedAvatar.name })
    onOpenChange(false)
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[80] bg-[#0f172a]/35 backdrop-blur-[8px] data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[81] flex h-[min(720px,calc(100vh-48px))] w-[min(1140px,calc(100vw-40px))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[18px] border border-white/80 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.24)] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95">
          <header className="flex items-center border-b border-[var(--line)] px-6 py-4">
            <div className="min-w-0 flex-1">
              <Dialog.Title className="text-[18px] font-bold text-[var(--text)]">选择数字人</Dialog.Title>
              <p className="mt-0.5 text-[12px] text-[var(--muted)]">选择一个数字人，用于本次视频生成</p>
            </div>
            <Dialog.Close aria-label="关闭" className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--muted)] transition-colors hover:bg-[var(--soft)] hover:text-[var(--text)]">
              <X size={18} />
            </Dialog.Close>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto p-5">
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="group flex min-h-[255px] flex-col items-center justify-center rounded-[12px] border border-dashed border-[var(--line-strong)] bg-[var(--soft-2)] px-4 text-center text-[var(--muted)] transition-colors hover:border-[var(--text)] hover:bg-white hover:text-[var(--text)]"
              >
                <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-white text-[var(--text)] shadow-sm transition-transform group-hover:scale-105">
                  <Upload size={19} />
                </span>
                <span className="text-[14px] font-semibold">本地上传</span>
                <span className="mt-1 text-[11px] text-[var(--muted)]">上传一张人物图片</span>
              </button>

              {avatars.map((avatar) => {
                const selected = selectedId === avatar.id
                return (
                  <button
                    key={avatar.id}
                    type="button"
                    onClick={() => setSelectedId(avatar.id)}
                    className={cn(
                      "group relative min-h-[255px] overflow-hidden rounded-[12px] border bg-[var(--soft)] text-left transition-all",
                      selected ? "border-[var(--text)] ring-2 ring-[#d9ff65]" : "border-transparent hover:border-[var(--line-strong)]"
                    )}
                  >
                    <img src={avatar.thumb} alt={avatar.name} className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
                    <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/70 to-transparent" />
                    {selected && (
                      <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#d9ff65] text-[#111] shadow-sm">
                        <Check size={15} strokeWidth={2.8} />
                      </span>
                    )}
                    <div className="absolute inset-x-0 bottom-0 p-3 text-white">
                      <p className="text-[15px] font-bold">{avatar.name}</p>
                    </div>
                  </button>
                )
              })}
            </div>

          </div>

          <footer className="flex items-center justify-between border-t border-[var(--line)] px-6 py-3.5">
            <p className="text-[12px] text-[var(--muted)]">
              {selectedAvatar ? `已选择：${selectedAvatar.name}` : "请选择一个数字人"}
            </p>
            <button
              type="button"
              disabled={!selectedAvatar}
              onClick={handleConfirm}
              className="h-9 rounded-full bg-[var(--near-black)] px-5 text-[13px] font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              确认选择
            </button>
          </footer>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}