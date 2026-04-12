import TakmirSidebar from '@/components/takmir/Sidebar'

export default function TakmirLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh">
      <TakmirSidebar />
      <main className="flex-1 lg:ml-72 min-h-dvh overflow-auto">
        {children}
      </main>
    </div>
  )
}
