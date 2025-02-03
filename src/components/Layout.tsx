import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { useIsMobile } from "@/hooks/use-mobile";

export function Layout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 p-4 md:p-6 w-full">
          <div className="flex items-center justify-between mb-6">
            <SidebarTrigger className="z-50" />
            <img 
              src="/lovable-uploads/1c044492-f4f2-404f-bff0-43cdbe9078fa.png" 
              alt="Logo Vôlei de Quarta" 
              className="h-8 md:h-12" 
            />
          </div>
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}