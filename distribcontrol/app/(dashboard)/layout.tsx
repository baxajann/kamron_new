import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Navbar from "@/components/layout/Navbar"
import DashboardClientWrapper from "@/components/layout/DashboardClientWrapper"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  return (
    <DashboardClientWrapper>
      <Navbar user={session.user} />
      <main className="page-content">
        {children}
      </main>
    </DashboardClientWrapper>
  )
}
