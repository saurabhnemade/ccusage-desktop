import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/Sidebar";
import { OverviewView } from "@/components/views/OverviewView";
import { DailyView } from "@/components/views/DailyView";
import { WeeklyView } from "@/components/views/WeeklyView";
import { MonthlyView } from "@/components/views/MonthlyView";
import { SessionsView } from "@/components/views/SessionsView";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: true,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="flex h-screen overflow-hidden bg-background">
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-6">
            <Routes>
              <Route path="/" element={<OverviewView />} />
              <Route path="/daily" element={<DailyView />} />
              <Route path="/weekly" element={<WeeklyView />} />
              <Route path="/monthly" element={<MonthlyView />} />
              <Route path="/sessions" element={<SessionsView />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
