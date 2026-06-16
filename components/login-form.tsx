"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/Logo";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      // Redirect to the dashboard page upon successful login
      router.push("/dashboard");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Error al iniciar sesión");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("glass-panel w-full max-w-md rounded-3xl p-8 border border-white/10 relative overflow-hidden animate-fadeIn", className)} {...props}>
      {/* Glowing background details */}
      <div className="absolute -right-20 -top-20 w-45 h-45 bg-[#4edea3]/10 blur-[40px] pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 w-45 h-45 bg-[#2481cc]/10 blur-[40px] pointer-events-none" />
      
      <div className="mb-6 text-center z-10 relative">
        <div className="flex justify-center mb-3">
          <Link href="/" title="Volver al inicio" className="hover:opacity-85 transition-opacity">
            <Logo size={44} />
          </Link>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Iniciar Sesión</h2>
        <p className="text-xs text-[#bbcabf]/60 mt-1">Accede a tu cuenta centralizada de BilleterIA</p>
      </div>

      <form onSubmit={handleLogin} className="flex flex-col gap-4.5 z-10 relative">
        <div>
          <label className="block text-[10px] text-[#bbcabf] font-mono mb-1.5 uppercase tracking-wider">Email</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="correo@ejemplo.com"
            className="w-full bg-[#060e20]/60 border border-white/10 focus:border-[#4edea3] focus:ring-1 focus:ring-[#4edea3] rounded-xl py-2.5 px-4 text-sm text-[#dae2fd] placeholder:text-slate-600 outline-none transition-colors"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-[10px] text-[#bbcabf] font-mono uppercase tracking-wider">Contraseña</label>
            <Link href="/auth/forgot-password" className="text-[10px] text-[#4edea3] hover:underline font-mono">
              ¿La has olvidado?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full bg-[#060e20]/60 border border-white/10 focus:border-[#4edea3] focus:ring-1 focus:ring-[#4edea3] rounded-xl py-2.5 px-4 text-sm text-[#dae2fd] placeholder:text-slate-600 outline-none transition-colors"
          />
        </div>

        {error && (
          <p className="text-xs text-[#ffb4ab] bg-red-950/20 border border-[#ffb4ab]/20 rounded-xl p-3 animate-fadeIn">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full cta-gradient text-[#003824] font-extrabold text-sm py-3.5 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer mt-2 border-none outline-none disabled:opacity-50"
        >
          {isLoading ? "Iniciando sesión..." : "Ingresar"}
        </button>

        <p className="text-center text-xs text-[#bbcabf] mt-4">
          ¿No tienes una cuenta?{" "}
          <Link href="/auth/sign-up" className="text-[#4edea3] hover:underline font-semibold ml-1">
            Regístrate
          </Link>
        </p>
      </form>
    </div>
  );
}
