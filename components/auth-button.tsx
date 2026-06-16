import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";

export async function AuthButton() {
  const supabase = await createClient();

  // You can also use getUser() which will be slower.
  const { data } = await supabase.auth.getClaims();

  const user = data?.claims;

  return user ? (
    <div className="flex items-center gap-4">
      <span className="text-xs text-[#bbcabf] font-mono">¡Hola, {user.email}!</span>
      <LogoutButton />
    </div>
  ) : (
    <div className="flex gap-2.5">
      <Button asChild size="sm" variant={"outline"} className="border-white/10 text-[#bbcabf] hover:text-white rounded-xl text-xs">
        <Link href="/auth/login">Iniciar Sesión</Link>
      </Button>
      <Button asChild size="sm" variant={"default"} className="bg-[#4edea3] hover:bg-[#3ec48e] text-[#002113] rounded-xl text-xs font-bold">
        <Link href="/auth/sign-up">Registrarse</Link>
      </Button>
    </div>
  );
}
