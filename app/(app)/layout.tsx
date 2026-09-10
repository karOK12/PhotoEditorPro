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
          marginLeft: "250px",
          boxSizing: "border-box",
        }}
      >
        {children}
      </main>
    </div>
  );
}
