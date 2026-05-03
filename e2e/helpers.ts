import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

/**
 * Benzersiz test kullanıcı adı — tests arası izolasyon için.
 * Ad deterministik olduğu için aynı adı tekrar kullanırsan aynı hesaba girersin.
 */
export function uniqueUserName(prefix = "e2e"): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

/**
 * /login akışını baştan sona gerçekleştirir ve callback'i tamamlar.
 * Ad girilir → "Magic Link" → 1.2sn bekleme → "Giriş Yap" → redirect.
 */
export async function login(page: Page, name: string): Promise<void> {
  await page.goto("/login");

  await page.getByLabel("Adın").fill(name);
  await page.getByRole("button", { name: /Magic Link/i }).click();

  // Step 2: "Giriş Yap" button görünür (step 1 → step 2 geçişi ~1.2sn)
  const signInButton = page.getByRole("button", { name: "Giriş yap" });
  await expect(signInButton).toBeVisible({ timeout: 5_000 });
  await signInButton.click();

  // İlk login → /onboarding, repeat → /learn
  await page.waitForURL(/\/(onboarding|learn)/, { timeout: 10_000 });
}

/**
 * 2 adımlı onboarding'i tamamlar: seviye → günlük hedef.
 * Kullanıcı onboarding'de başlıyor olmalı (login yeni kullanıcı ile).
 */
export async function completeOnboarding(page: Page): Promise<void> {
  await page.waitForURL(/\/onboarding\/level/);
  await page.getByText(/Yeni Başlıyorum|Başlangıç/i).first().click();
  await page.getByRole("button", { name: /Devam|İleri|Sonraki/i }).click();

  await page.waitForURL(/\/onboarding\/goal/);
  await page.getByText(/10 dakika/i).first().click();
  await page.getByRole("button", { name: /Başla|Bitir|Tamamla/i }).click();

  await page.waitForURL(/\/learn/, { timeout: 10_000 });
}
