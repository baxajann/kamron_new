"use client"

import { createContext, useContext, useState, ReactNode } from "react"

interface BranchContextType {
  selectedBranch: string
  setSelectedBranch: (branch: string) => void
}

const BranchContext = createContext<BranchContextType>({
  selectedBranch: "Все филиалы",
  setSelectedBranch: () => {},
})

export function BranchProvider({ children }: { children: ReactNode }) {
  const [selectedBranch, setSelectedBranch] = useState("Все филиалы")
  return (
    <BranchContext.Provider value={{ selectedBranch, setSelectedBranch }}>
      {children}
    </BranchContext.Provider>
  )
}

export function useBranch() {
  return useContext(BranchContext)
}
