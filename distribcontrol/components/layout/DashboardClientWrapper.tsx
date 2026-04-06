"use client"
import { BranchProvider } from "@/lib/branch-context"

export default function DashboardClientWrapper({ children }: { children: React.ReactNode }) {
  return <BranchProvider>{children}</BranchProvider>
}
