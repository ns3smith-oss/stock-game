// Study pages get their own full-screen layout — no sidebar, no nav chrome.
export default function StudyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#131722] text-white min-h-screen">
      {children}
    </div>
  )
}
