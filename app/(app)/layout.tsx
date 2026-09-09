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
          boxSizing: "border-box",
          width: "calc(100% - 250px)",
          marginLeft: "250px",
        }}
      >
        {children}
      </main>
    </div>
  );
}
