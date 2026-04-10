export default function PrintLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        div.flex.h-screen, aside, header { display: none !important; }
        body { background: white !important; overflow: auto !important; height: auto !important; }
        main { overflow: visible !important; }
      `}} />
      {children}
    </>
  )
}
