import AppTopNav from "@/app/components/AppTopNav";
import Sidebar from "@/app/components/Sidebar";
import BottomNav from "@/app/components/BottomNav";

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
          paddingBottom: "92px",
          marginLeft: "250px",
          boxSizing: "border-box",
        }}
      >
        {children}
      </main>

      <BottomNav />
    </div>
  );
}
