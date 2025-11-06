"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

// Simple debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { HeaderLogo } from "./logo";
import { DesktopMenu } from "./desktop-menu";
import { HEADER_MENU_ITEMS } from "./config";
import { HeaderAuthActions, type HeaderUserProfile } from "./auth-actions";
import { useToast } from "@/components/hooks/use-toast";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { getUserProfileOrNull } from "@/lib/cache/user-profile";

// Dynamic import MobileMenu dengan ssr: false untuk menghindari hydration mismatch
const MobileMenu = dynamic(() => import("./mobile-menu").then(mod => ({ default: mod.MobileMenu })), {
  ssr: false,
  loading: () => (
    <div className="lg:hidden h-11 w-11 animate-pulse rounded-lg bg-header-nav-text/10" />
  ),
});

export const Header = () => {
  const [profile, setProfile] = useState<HeaderUserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    let isActive = true;
    let timeoutId: NodeJS.Timeout;
    let authTimeoutId: NodeJS.Timeout;

    // Debounced profile resolution with Next.js 16 cached function
    const resolveProfileWithDebounce = async () => {
      // Clear any existing timeout
      clearTimeout(timeoutId);

      timeoutId = setTimeout(async () => {
        if (!isActive) return;

        try {
          setIsLoadingProfile(true);

          const { data: { session } } = await supabase.auth.getSession();

          if (!session) {
            setProfile(null);
            return;
          }

          // Use Next.js 16 cached function instead of direct fetch
          const profileData = await getUserProfileOrNull(session.user.id);

          if (!isActive) return;

          if (profileData) {
            setProfile({
              id: profileData.id,
              email: profileData.email,
              firstName: profileData.firstName,
              lastName: profileData.lastName,
              role: profileData.role,
            });
          } else {
            setProfile(null);
          }
        } catch (error) {
          if (isActive) {
            setProfile(null);
          }
        } finally {
          if (isActive) {
            setIsLoadingProfile(false);
          }
        }
      }, 1000); // 1 second debounce
    };

    // Debounced auth state change handler
    const handleAuthChange = debounce((_event: any, session: any) => {
      if (!isActive) return;

      clearTimeout(authTimeoutId);

      authTimeoutId = setTimeout(() => {
        if (!session) {
          setProfile(null);
          setIsLoadingProfile(false);
          return;
        }

        // Only resolve profile if we have a session
        resolveProfileWithDebounce();
      }, 2000); // 2 second debounce for auth changes
    }, 500);

    // Initial profile load
    resolveProfileWithDebounce();

    // Set up auth state listener with debouncing
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);

    return () => {
      isActive = false;
      clearTimeout(timeoutId);
      clearTimeout(authTimeoutId);
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleLogout = useCallback(async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        const message =
          typeof payload?.error === "string"
            ? payload.error
            : typeof payload?.error?.message === "string"
              ? payload.error.message
              : "Logout gagal. Coba lagi.";
        throw new Error(message);
      }

      setProfile(null);
      toast({
        title: "Logout sukses",
        description: "Gue arahin lo ke halaman login.",
      });
      router.replace("/auth/login");
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Logout gagal. Coba lagi.";
      toast({
        title: "Logout gagal",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoggingOut(false);
    }
  }, [isLoggingOut, router, toast]);

  return (
    <header className="relative bg-transparent">
      <div className="mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <HeaderLogo />
        <DesktopMenu items={HEADER_MENU_ITEMS} />
        <div className="hidden lg:flex items-center gap-4">
          <HeaderAuthActions
            profile={profile}
            loggingOut={isLoggingOut}
            loading={isLoadingProfile}
            onLogout={handleLogout}
          />
        </div>
        <div className="lg:hidden">
          <MobileMenu
            items={HEADER_MENU_ITEMS}
            profile={profile}
            loggingOut={isLoggingOut}
            loading={isLoadingProfile}
            onLogout={handleLogout}
          />
        </div>
      </div>
    </header>
  );
};
