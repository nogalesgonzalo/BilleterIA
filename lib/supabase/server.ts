import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Especially important if using Fluid compute: Don't put this client in a
 * global variable. Always create a new client within each function when using
 * it.
 */
export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    const cookieStore = await cookies();
    const fakeUserCookie = cookieStore.get("billeteria_fake_user")?.value;

    return {
      auth: {
        getUser: async () => {
          if (fakeUserCookie) {
            try {
              return { data: { user: JSON.parse(decodeURIComponent(fakeUserCookie)) }, error: null };
            } catch {}
          }
          return { data: { user: null }, error: null };
        },
        getClaims: async () => {
          if (fakeUserCookie) {
            try {
              const parsed = JSON.parse(decodeURIComponent(fakeUserCookie));
              return { data: { claims: parsed }, error: null };
            } catch {}
          }
          return { data: { claims: null }, error: null };
        }
      }
    } as any;
  }

  const cookieStore = await cookies();

  return createServerClient(
    url,
    key,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have proxy refreshing
            // user sessions.
          }
        },
      },
    },
  );
}
