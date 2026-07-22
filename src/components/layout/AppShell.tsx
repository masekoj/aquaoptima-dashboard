import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Waves, LogIn, LogOut } from "lucide-react";
import type { ReactNode } from "react";
import { toast } from "sonner";

import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

const nav = [{ to: "/", label: "Dashboard", icon: LayoutDashboard }] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, loading } = useAuth();

  const onSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <aside className="hidden md:flex w-64 flex-col border-r border-border bg-sidebar">
        <div className="flex items-center gap-2 px-6 py-5 border-b border-sidebar-border">
          <div className="h-9 w-9 rounded-lg bg-primary text-primary-foreground grid place-items-center">
            <Waves className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-semibold leading-none">AquaOptima</div>
            <div className="text-xs text-muted-foreground mt-1">Harvest Intelligence</div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {nav.map(({ to, label, icon: Icon }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/60"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 text-xs text-muted-foreground border-t border-sidebar-border">
          VBGF Engine · v0.2
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-border flex items-center px-4 md:px-8 gap-3">
          <div className="md:hidden flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-primary text-primary-foreground grid place-items-center">
              <Waves className="h-4 w-4" />
            </div>
            <span className="font-semibold">AquaOptima</span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            {!loading && user ? (
              <>
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  {user.email}
                </span>
                <button
                  onClick={onSignOut}
                  className="inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-2.5 py-1.5 text-xs font-medium hover:bg-accent"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign out
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                className="inline-flex items-center gap-1.5 rounded-md bg-primary px-2.5 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
              >
                <LogIn className="h-3.5 w-3.5" />
                Sign in
              </Link>
            )}
          </div>
        </header>
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
