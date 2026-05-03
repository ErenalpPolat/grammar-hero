import { expect, test } from "@playwright/test";
import { login, uniqueUserName } from "./helpers";

/**
 * Auth flow — DB gerektirir.
 * Mock magic link: ad yaz → "Giriş Yap" → yeni kullanıcı onboarding'e gider.
 */
test.describe("auth flow", () => {
  test("new user login redirects to onboarding", async ({ page }) => {
    const name = uniqueUserName("new");
    await login(page, name);
    await expect(page).toHaveURL(/\/onboarding\/level/);
  });

  test("short name rejected (client-side)", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Adın").fill("a"); // 1 char — 2 char minimum
    const submit = page.getByRole("button", { name: /Magic Link/i });
    await expect(submit).toBeDisabled();
  });

  test("logged-in user hitting /login is redirected to /learn", async ({ page }) => {
    // Önce bir kullanıcıyla login ol
    const name = uniqueUserName("returning");
    await login(page, name);

    // Şimdi doğrudan /login'e git → /learn'e redirect beklenir
    // (onboarding completed olmalı — ama bu yeni kullanıcı için geçerli değil)
    // Onboarding'i bitirmeden /login'e gitsek bile, proxy sadece auth state'ine bakar.
    await page.goto("/login");
    await page.waitForURL(/\/learn/, { timeout: 5_000 });
  });
});
