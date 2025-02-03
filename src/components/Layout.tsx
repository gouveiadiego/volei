import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <SidebarTrigger />
            <img 
              src="/lovable-uploads/1c044492-f4f2-404f-bff0-43cdbe9078fa.png" 
              alt="Logo Vôlei de Quarta" 
              className="h-12" 
            />
          </div>
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}