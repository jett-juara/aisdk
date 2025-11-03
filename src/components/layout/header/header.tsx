"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

import { useToast } from "@/components/hooks/use-toast";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

import { HeaderLogo } from "./logo";
import { DesktopMenu } from "./desktop-menu";
import { HEADER_MENU_ITEMS } from "./config";
import { HeaderAuthActions, type HeaderUserProfile } from "./auth-actions";

// Dynamic import MobileMenu dengan ssr: false untuk menghindari hydration mismatch
const MobileMenu = dynamic(() => import("./mobile-menu").then(mod => ({ default: mod.MobileMenu })), {
  ssr: false,
  loading: () => (
    <div className="md:hidden h-11 w-11 animate-pulse rounded-lg bg-header-nav-text/10" />
  ),
});

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [profile, setProfile] = useState<HeaderUserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    let isActive = true;

    const resolveProfile = async () => {
      try {
        if (isActive) {
          setIsLoadingProfile(true);
        }
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          if (isActive) {
            setProfile(null);
          }
          return;
        }

        const response = await fetch("/api/user/profile", {
          cache: "no-store",
        });

        if (!response.ok) {
          if (isActive) {
            setProfile(null);
          }
          return;
        }

        const data = await response.json();
        if (!isActive) return;

        setProfile({
          id: data.id,
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          role: data.role,
        });
      } catch (error) {
        if (isActive) {
          setProfile(null);
        }
      } finally {
        if (isActive) {
          setIsLoadingProfile(false);
        }
      }
    };

    resolveProfile();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setProfile(null);
        setIsLoadingProfile(false);
        return;
      }
      resolveProfile();
    });

    return () => {
      isActive = false;
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
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        isScrolled ? "border-b border-header-border/60 bg-header-bg" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <HeaderLogo />
        <DesktopMenu items={HEADER_MENU_ITEMS} />
        <div className="hidden md:flex items-center gap-4">
          <HeaderAuthActions
            profile={profile}
            loggingOut={isLoggingOut}
            loading={isLoadingProfile}
            onLogout={handleLogout}
          />
        </div>
        <div className="md:hidden">
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
