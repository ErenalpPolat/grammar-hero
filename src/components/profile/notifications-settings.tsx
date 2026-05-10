"use client";

import { Bell, BellOff, Send } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  sendTestPushAction,
  subscribeToPushAction,
  unsubscribeFromPushAction,
} from "@/lib/push";

const STORAGE_KEY = "grammar-hero-notifications";
const VAPID_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

interface NotificationsState {
  dailyReminder: boolean;
  reminderTime: string;
  streakAlert: boolean;
}

const DEFAULT: NotificationsState = {
  dailyReminder: true,
  reminderTime: "19:00",
  streakAlert: true,
};

function readStateFromStorage(): NotificationsState {
  if (typeof window === "undefined") return DEFAULT;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT;
    return { ...DEFAULT, ...JSON.parse(raw) };
  } catch {
    return DEFAULT;
  }
}

/** Convert VAPID public key (base64url) to Uint8Array for pushManager.subscribe. */
function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

type PushStatus =
  | { kind: "unsupported" }
  | { kind: "denied" }
  | { kind: "unsubscribed" }
  | { kind: "subscribed"; endpoint: string }
  | { kind: "loading" };

export function NotificationsSettings() {
  // SSR'da DEFAULT, mount sonrası localStorage'dan okuyup hydrate ederiz.
  // Bu pattern useSyncExternalStore'un her render'da yeni obje döndürüp
  // sonsuz re-render'a girmesi sorununu (React error #185) çözer.
  const [state, setState] = useState<NotificationsState>(DEFAULT);
  const [push, setPush] = useState<PushStatus>({ kind: "loading" });
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setState(readStateFromStorage());
  }, []);

  useEffect(() => {
    async function refreshPushStatus() {
      if (
        typeof window === "undefined" ||
        !("serviceWorker" in navigator) ||
        !("PushManager" in window)
      ) {
        setPush({ kind: "unsupported" });
        return;
      }
      if (Notification.permission === "denied") {
        setPush({ kind: "denied" });
        return;
      }
      try {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        setPush(sub ? { kind: "subscribed", endpoint: sub.endpoint } : { kind: "unsubscribed" });
      } catch {
        setPush({ kind: "unsubscribed" });
      }
    }
    void refreshPushStatus();
  }, []);

  async function refreshPushStatus() {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      !("PushManager" in window)
    ) {
      setPush({ kind: "unsupported" });
      return;
    }
    if (Notification.permission === "denied") {
      setPush({ kind: "denied" });
      return;
    }
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      setPush(sub ? { kind: "subscribed", endpoint: sub.endpoint } : { kind: "unsubscribed" });
    } catch {
      setPush({ kind: "unsubscribed" });
    }
  }

  const update = (next: Partial<NotificationsState>) => {
    setState((prev) => {
      const merged = { ...prev, ...next };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      } catch {
        // ignore storage errors
      }
      return merged;
    });
  };

  const enablePush = () => {
    if (!VAPID_KEY) {
      toast.error("VAPID anahtarı ayarlı değil (NEXT_PUBLIC_VAPID_PUBLIC_KEY).");
      return;
    }
    startTransition(async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          toast.error("Bildirim izni reddedildi");
          await refreshPushStatus();
          return;
        }
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_KEY),
        });
        const json = sub.toJSON() as {
          endpoint: string;
          keys: { p256dh: string; auth: string };
        };
        const result = await subscribeToPushAction(json);
        if (result.error) {
          toast.error(result.error);
          await sub.unsubscribe().catch(() => {});
          await refreshPushStatus();
          return;
        }
        toast.success("Bildirimler açıldı");
        setPush({ kind: "subscribed", endpoint: json.endpoint });
      } catch (err) {
        console.warn("[push] enable failed:", err);
        toast.error("Bildirim açılamadı");
      }
    });
  };

  const disablePush = () => {
    startTransition(async () => {
      try {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          await unsubscribeFromPushAction(sub.endpoint);
          await sub.unsubscribe().catch(() => {});
        }
        toast.success("Bildirimler kapatıldı");
        setPush({ kind: "unsubscribed" });
      } catch (err) {
        console.warn("[push] disable failed:", err);
        toast.error("Bildirim kapatılamadı");
      }
    });
  };

  const testPush = () => {
    startTransition(async () => {
      const result = await sendTestPushAction();
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Test bildirimi gönderildi");
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <Label htmlFor="daily-reminder" className="text-sm font-medium">
            Günlük hatırlatıcı
          </Label>
          <p className="text-xs text-muted-foreground">
            Belirlediğin saatte ders yapmazsan bildirim al
          </p>
        </div>
        <Switch
          id="daily-reminder"
          checked={state.dailyReminder}
          onCheckedChange={(v) => {
            update({ dailyReminder: v });
            toast.success(v ? "Hatırlatıcı açık" : "Hatırlatıcı kapalı");
          }}
        />
      </div>

      {state.dailyReminder && (
        <div className="flex items-center justify-between gap-4">
          <Label htmlFor="reminder-time" className="text-sm font-medium">
            Saat
          </Label>
          <input
            id="reminder-time"
            type="time"
            value={state.reminderTime}
            onChange={(e) => update({ reminderTime: e.target.value })}
            className="rounded-md border border-border bg-background px-3 py-1.5 text-sm tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      )}

      <div className="flex items-center justify-between gap-4 border-t border-border pt-4">
        <div className="min-w-0">
          <Label htmlFor="streak-alert" className="text-sm font-medium">
            Streak uyarısı
          </Label>
          <p className="text-xs text-muted-foreground">
            Streak&apos;ini kaybetmek üzereysen uyar
          </p>
        </div>
        <Switch
          id="streak-alert"
          checked={state.streakAlert}
          onCheckedChange={(v) => update({ streakAlert: v })}
        />
      </div>

      <div className="space-y-3 border-t border-border pt-4">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <Label className="text-sm font-medium">Tarayıcı bildirimleri</Label>
            <p className="text-xs text-muted-foreground">
              {pushStatusText(push)}
            </p>
          </div>
          <PushActionButton push={push} pending={pending} onEnable={enablePush} onDisable={disablePush} />
        </div>

        {push.kind === "subscribed" && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={testPush}
            disabled={pending}
            className="w-full"
          >
            <Send className="size-4" /> Test bildirimi gönder
          </Button>
        )}
      </div>
    </div>
  );
}

function pushStatusText(push: PushStatus): string {
  switch (push.kind) {
    case "loading":
      return "Kontrol ediliyor…";
    case "unsupported":
      return "Bu tarayıcı web push'u desteklemiyor.";
    case "denied":
      return "Bildirim izni reddedildi. Tarayıcı ayarlarından tekrar izin ver.";
    case "unsubscribed":
      return "Kapalı — aç ve istediğin zaman test et.";
    case "subscribed":
      return "Açık — hatırlatıcılar gelebilir.";
  }
}

function PushActionButton({
  push,
  pending,
  onEnable,
  onDisable,
}: {
  push: PushStatus;
  pending: boolean;
  onEnable: () => void;
  onDisable: () => void;
}) {
  if (push.kind === "loading" || push.kind === "unsupported" || push.kind === "denied") {
    return (
      <Button type="button" variant="outline" size="sm" disabled>
        <Bell className="size-4" /> Aç
      </Button>
    );
  }
  if (push.kind === "subscribed") {
    return (
      <Button type="button" variant="outline" size="sm" onClick={onDisable} disabled={pending}>
        <BellOff className="size-4" /> Kapat
      </Button>
    );
  }
  return (
    <Button type="button" size="sm" onClick={onEnable} disabled={pending}>
      <Bell className="size-4" /> Aç
    </Button>
  );
}
