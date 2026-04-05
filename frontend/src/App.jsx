import { Navigate, Route, Routes } from "react-router-dom";

import AppShell from "./components/layout/AppShell";
import ChatbotPage from "./pages/ChatbotPage";
import DashboardPage from "./pages/DashboardPage";
import ForecastPage from "./pages/ForecastPage";
import HistoryPage from "./pages/HistoryPage";
import HowItWorksPage from "./pages/HowItWorksPage";
import LandingPage from "./pages/LandingPagePremium";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/app" element={<AppShell />}>
        <Route index element={<Navigate to="/app/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="forecast" element={<ForecastPage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="how-it-works" element={<HowItWorksPage />} />
        <Route path="chatbot" element={<ChatbotPage />} />
      </Route>
    </Routes>
  );
}
