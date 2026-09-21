import { notFound } from "next/navigation"
import { MaterialFlow } from "@/components/discovery/material-flow"
import { findMaterial } from "@/lib/discovery/data"

export default async function MaterialReplicationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!findMaterial(id)) notFound()
  return <MaterialFlow materialId={id} kind="replicate" />
}
