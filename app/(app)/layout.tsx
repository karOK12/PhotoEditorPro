import AppTopNav from "@/app/components/AppTopNav";
import BottomNav from "@/app/components/BottomNav";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="app-shell">
      <AppTopNav />

      <main
        className="app-content"
        style={{
          minHeight: "100dvh",
          paddingTop: "125px",
          paddingBottom: "calc(82px + env(safe-area-inset-bottom))",
        }}
      >
        {children}
      </main>

      <BottomNav />
    </div>
  );
}
