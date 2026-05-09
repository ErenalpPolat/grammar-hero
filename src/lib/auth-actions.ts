"use server";

import { signOut } from "@/lib/auth";

/**
 * NOT: `redirectTo` kullanırsak signOut next/navigation `redirect()` çağırıyor,
 * o da NEXT_REDIRECT exception fırlatıyor — caller'da try/catch yutarsa
 * "çıkış yapılamadı" gibi yanlış hata gösteriliyor. Bu yüzden `redirect: false`
 * ile sadece cookie'yi temizleyip yönlendirmeyi client'ta `router.push` ile yapıyoruz.
 */
export async function logoutAction() {
  await signOut({ redirect: false });
}
