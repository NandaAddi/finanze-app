"use client";

import { useTheme } from "next-themes";
import { useUser } from "@/components/user-provider";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import { updateProfile } from "@/app/actions/finance";
import { toast } from "sonner";
import { Check, User, Palette, Shield, Loader2, Code2, Globe, Instagram, Scale } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { AvatarPicker } from "@/components/profile/avatar-picker";
import { useMounted } from "@/hooks/use-mounted";
import { SignOutButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";

const settingsSchema = z.object({
  full_name: z.string().max(100, "Nama tidak boleh lebih dari 100 karakter").optional(),
  avatar_url: z.string().url("Invalid URL").or(z.literal("")).optional(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user, refreshUser } = useUser();
  const [saving, setSaving] = useState(false);
  const mounted = useMounted();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      full_name: user?.full_name || "",
      avatar_url: user?.avatar_url || "",
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        full_name: user.full_name || "",
        avatar_url: user.avatar_url || "",
      });
    }
  }, [user, form]);

  async function onSubmit(values: SettingsFormValues) {
    if (!user?.id) return;
    setSaving(true);
    
    try {
      const result = await updateProfile({
        full_name: values.full_name,
        avatar_url: values.avatar_url,
      });

      if (!result.success) throw new Error(result.error);
      
      await refreshUser();
      toast.success("Pengaturan berhasil disimpan!");
    } catch (err: any) {
      toast.error("Gagal menyimpan: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  const handleAvatarChange = (url: string) => {
    form.setValue("avatar_url", url, { shouldDirty: true });
    const currentValues = form.getValues();
    onSubmit({ ...currentValues, avatar_url: url });
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-12 animate-fade-in pb-20">
      <div>
        <h1 className="text-4xl font-semibold tracking-tight" style={{ fontFamily: 'var(--font-lora), serif' }}>
          Pengaturan
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">Kelola preferensi akun dan tampilan aplikasi Anda.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <User className="h-4 w-4 text-emerald-500" />
              </div>
              <h2 className="text-xl font-medium">Kustomisasi Profil</h2>
            </div>
            
            <div className="p-8 border border-border/50 rounded-3xl bg-card space-y-10 shadow-sm">
              <div className="space-y-4">
                <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground opacity-60">Foto Profil</label>
                <div className="flex items-center gap-8">
                  <AvatarPicker 
                    currentAvatar={form.watch("avatar_url")} 
                    onAvatarChange={handleAvatarChange}
                    userName={user?.full_name}
                  />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">Avatar</p>
                    <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
                      Gunakan foto profil yang merepresentasikan Anda. Disimpan secara aman di sistem cloud.
                    </p>
                  </div>
                </div>
              </div>

              <Separator className="bg-border/10" />

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6">
                    <FormItem>
                      <FormLabel className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground opacity-60">Nama Lengkap</FormLabel>
                      <FormControl>
                        <Input
                          {...form.register("full_name")}
                          placeholder="Masukkan nama Anda"
                          disabled={saving}
                          className="bg-transparent border-border/50 h-12 rounded-xl focus:border-emerald-500/50"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  </div>

                  <div className="pt-2">
                    <Button type="submit" disabled={saving || !form.formState.isDirty} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-8 h-12 shadow-lg shadow-emerald-600/20 transition-all active:scale-95">
                      {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                      Simpan Perubahan
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Palette className="h-4 w-4 text-blue-500" />
              </div>
              <h2 className="text-xl font-medium">Tampilan</h2>
            </div>
            
            <div className="p-8 border border-border/50 rounded-3xl bg-card space-y-8 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Mode Gelap</label>
                  <p className="text-xs text-muted-foreground">Beralih antara tema terang dan gelap.</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-40">Mati</span>
                  {mounted ? (
                    <Switch
                      checked={theme === "dark"}
                      onCheckedChange={() => setTheme(theme === "dark" ? "light" : "dark")}
                    />
                  ) : (
                    <div className="w-11 h-6 bg-muted animate-pulse rounded-full" />
                  )}
                  <span className="text-[10px] text-emerald-500 uppercase tracking-widest font-bold">Nyala</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center">
                <Shield className="h-4 w-4 text-rose-500" />
              </div>
              <h2 className="text-lg font-medium">Akun</h2>
            </div>
            <div className="p-8 border border-border/50 rounded-3xl bg-card space-y-6 shadow-sm">
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground opacity-50">Email</p>
                <p className="text-sm font-medium text-foreground truncate">
                  {mounted ? (user?.email || "...") : "..."}
                </p>
              </div>
              <SignOutButton>
                <Button variant="outline" className="w-full text-xs border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white h-12 rounded-2xl transition-all font-bold">
                  Keluar dari Akun
                </Button>
              </SignOutButton>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-500/10 flex items-center justify-center">
                <Shield className="h-4 w-4 text-slate-500" />
              </div>
              <h2 className="text-lg font-medium">Legal & Kebijakan</h2>
            </div>
            <div className="p-8 border border-border/50 rounded-3xl bg-card space-y-4 shadow-sm">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Tinjau dokumen kebijakan hukum dan perlindungan data pribadi Anda di Finanze.
              </p>
              <div className="grid grid-cols-1 gap-2.5 pt-2">
                <Button variant="outline" className="w-full text-xs h-12 rounded-2xl transition-all font-bold justify-start px-4 gap-3 border-border/50 hover:bg-emerald-500/5 hover:text-emerald-600 dark:hover:text-emerald-500" asChild>
                  <Link href="/privacy-policy">
                    <Shield className="w-4 h-4 text-emerald-500" /> Kebijakan Privasi
                  </Link>
                </Button>
                <Button variant="outline" className="w-full text-xs h-12 rounded-2xl transition-all font-bold justify-start px-4 gap-3 border-border/50 hover:bg-blue-500/5 hover:text-blue-600 dark:hover:text-blue-500" asChild>
                  <Link href="/terms-of-service">
                    <Scale className="w-4 h-4 text-blue-500" /> Syarat & Ketentuan
                  </Link>
                </Button>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Code2 className="h-4 w-4 text-primary" />
              </div>
              <h2 className="text-lg font-medium">Pengembang</h2>
            </div>
            <div className="p-8 border border-border/50 rounded-3xl bg-emerald-500/5 space-y-6 shadow-sm relative overflow-hidden">
               <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-4">
                     <div className="relative w-16 h-16 shrink-0">
                        <Image 
                           src="/profil%20pengembang/profile-pengembang.webp" 
                           alt="Muhammad Naufal Igall" 
                           fill
                           className="object-cover rounded-full border-2 border-white dark:border-white/10 shadow-md"
                        />
                     </div>
                     <div>
                        <p className="text-sm font-bold text-foreground leading-tight">Muhammad Naufal Igall</p>
                        <p className="text-[10px] text-emerald-600 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full inline-block mt-1 tracking-tighter">S1 Teknologi Pendidikan</p>
                     </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed italic opacity-80">
                     "Mahasiswa S1 Teknologi Pendidikan yang berfokus pada pengembangan solusi digital."
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                     <Button variant="ghost" size="sm" className="h-10 text-[11px] gap-3 bg-white/50 dark:bg-black/20 justify-start px-4 hover:bg-emerald-500 hover:text-white transition-all rounded-xl" asChild>
                        <a href="https://masgall.weebly.com/" target="_blank" rel="noreferrer">
                           <Globe className="w-4 h-4" /> Portfolio Website
                        </a>
                     </Button>
                     <Button variant="ghost" size="sm" className="h-10 text-[11px] gap-3 bg-white/50 dark:bg-black/20 justify-start px-4 hover:bg-pink-500 hover:text-white transition-all rounded-xl" asChild>
                        <a href="https://www.instagram.com/naufal.igall" target="_blank" rel="noreferrer">
                           <Instagram className="w-4 h-4" /> @naufal.igall
                        </a>
                     </Button>
                  </div>
               </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
