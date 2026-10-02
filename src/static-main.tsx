import { useState } from "react";
import { createRoot } from "react-dom/client";
import { AppShell, type TabId } from "@/components/shell";
import { HomeView } from "@/components/home-view";
import "./styles.css";

function StaticApp() {
  const [tab, setTab] = useState<TabId>("home");
  const empty = { reagents: [], records: [], orders: [] } as const;
  return (
    <AppShell tab={tab} onTab={setTab} alertCount={0}>
      {tab === "home" ? (
        <HomeView
          {...empty}
          ordering={false}
          receivingId={null}
          onOrder={() => {}}
          onReceive={() => {}}
          onGoScan={() => setTab("scan")}
          onGoReagents={() => setTab("reagents")}
        />
      ) : (
        <section className="rounded-xl border border-border bg-surface p-8 text-center shadow-card">
          <h2 className="text-lg font-semibold">{tab === "scan" ? "扫码出入库" : tab === "reagents" ? "试剂档案" : "出入库记录"}</h2>
          <p className="mt-2 text-sm text-muted">这是 GitHub Pages 静态演示版，数据功能需要连接独立后端。</p>
        </section>
      )}
    </AppShell>
  );
}

createRoot(document.getElementById("root")!).render(<StaticApp />);
