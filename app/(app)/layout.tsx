import AppTopNav from "@/app/components/AppTopNav";
import Sidebar from "@/app/components/Sidebar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="app-shell">
      <AppTopNav />
      <Sidebar />

      <main
        className="app-content"
        style={{
          minHeight: "100dvh",
          paddingTop: "76px",
          paddingBottom: "24px",
          paddingLeft: "250px",
          boxSizing: "border-box",
        }}
      >
        {children}
      </main>

      <style jsx global>{`
        @media (max-width: 800px) {
          .app-content {
            padding-left: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
