import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { nativeSensorManager } from "@/lib/nativeSensors";
import EnhancedIndex from "./pages/EnhancedIndex";
import NotFound from "./pages/NotFound";
import { toast } from "@/components/ui/use-toast";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    const request = async () => {
      try {
        const granted = await nativeSensorManager.requestMotionPermissions();
        if (granted) {
          toast({
            title: "Motion Access Enabled",
            description: "Sensors ready for step tracking.",
          });
        } else {
          toast({
            title: "Motion Access Needed",
            description:
              "Enable motion/physical activity permission for accurate step tracking.",
            variant: "destructive" as any,
          });
        }
      } catch (e) {
        toast({
          title: "Permission Error",
          description: "Could not request motion permission.",
          variant: "destructive" as any,
        });
        console.error("Motion permission request failed", e);
      }
    };
    request();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<EnhancedIndex />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
