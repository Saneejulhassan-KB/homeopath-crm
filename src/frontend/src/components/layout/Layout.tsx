import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useAppStore } from "@/store";
import { motion } from "motion/react";
import { ThemeProvider } from "next-themes";
import { useState } from "react";
import type { ReactNode } from "react";
import { Toaster } from "sonner";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

interface LayoutProps {
  children: ReactNode;
}

function LayoutInner({ children }: LayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col h-full shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Sheet */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          className="p-0 w-60 glass border-r border-white/10 bg-card/95 backdrop-blur-xl"
        >
          <Sidebar mobile onClose={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar onMobileMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto" data-ocid="main-content">
          <motion.div
            key="page-content"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="p-4 md:p-6 max-w-[1600px] mx-auto w-full"
          >
            {children}
          </motion.div>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/8 bg-card/30 backdrop-blur-sm px-6 py-3 text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} HomeoPath CRM. Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

export function Layout({ children }: LayoutProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <LayoutInner>{children}</LayoutInner>
      <Toaster
        richColors
        position="top-right"
        toastOptions={{
          className: "glass border border-white/10",
        }}
      />
    </ThemeProvider>
  );
}
