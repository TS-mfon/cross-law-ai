import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WalletProvider } from "@/lib/genlayer/WalletProvider";
import { Navbar } from "@/components/cross-border/Navbar";
import LandingPage from "@/pages/LandingPage";
import DisputeDashboard from "@/pages/DisputeDashboard";
import RegisterDisputePage from "@/pages/RegisterDisputePage";
import DisputeDetailPage from "@/pages/DisputeDetailPage";
import RespondPage from "@/pages/RespondPage";
import AppealPage from "@/pages/AppealPage";
import RulingDetailPage from "@/pages/RulingDetailPage";
import JurisdictionsPage from "@/pages/JurisdictionsPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 5000, refetchOnWindowFocus: false } },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <WalletProvider>
        <Sonner position="top-right" richColors closeButton />
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/disputes" element={<DisputeDashboard />} />
            <Route path="/disputes/new" element={<RegisterDisputePage />} />
            <Route path="/disputes/:id" element={<DisputeDetailPage />} />
            <Route path="/disputes/:id/respond" element={<RespondPage />} />
            <Route path="/disputes/:id/appeal" element={<AppealPage />} />
            <Route path="/disputes/:id/ruling" element={<RulingDetailPage />} />
            <Route path="/jurisdictions" element={<JurisdictionsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </WalletProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
