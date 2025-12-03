"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Eye, EyeOff, ArrowRight, Globe, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Logo } from "@/components/logo"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent } from "@/components/ui/card"

type Language = "en" | "vn" | "jp"

const translations = {
  en: {
    welcome: "Sign in",
    subtitle: "Continue to TranslateSphere",
    emailLabel: "Email address",
    emailPlaceholder: "name@company.com",
    passwordLabel: "Password",
    passwordPlaceholder: "Enter your password",
    rememberMe: "Remember me",
    forgotPassword: "Forgot password?",
    signIn: "Sign in",
    requestAccess: "Request access",
    noAccount: "Don't have an account?",
    footer: "Developed by Fujinet RD Center",
  },
  vn: {
    welcome: "Đăng nhập",
    subtitle: "Tiếp tục đến TranslateSphere",
    emailLabel: "Địa chỉ email",
    emailPlaceholder: "ten@congty.com",
    passwordLabel: "Mật khẩu",
    passwordPlaceholder: "Nhập mật khẩu của bạn",
    rememberMe: "Ghi nhớ đăng nhập",
    forgotPassword: "Quên mật khẩu?",
    signIn: "Đăng nhập",
    requestAccess: "Yêu cầu quyền truy cập",
    noAccount: "Chưa có tài khoản?",
    footer: "Phát triển bởi Fujinet RD Center",
  },
  jp: {
    welcome: "サインイン",
    subtitle: "TranslateSphereへ続行",
    emailLabel: "メールアドレス",
    emailPlaceholder: "name@company.com",
    passwordLabel: "パスワード",
    passwordPlaceholder: "パスワードを入力",
    rememberMe: "ログイン状態を保持",
    forgotPassword: "パスワードをお忘れですか？",
    signIn: "サインイン",
    requestAccess: "アクセスをリクエスト",
    noAccount: "アカウントをお持ちでないですか？",
    footer: "Fujinet RD Centerによって開発されました",
  },
}

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [language, setLanguage] = useState<Language>("en")

  const t = translations[language]

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulate login
    await new Promise((resolve) => setTimeout(resolve, 1000))
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f2f6fc] p-4">
      <div className="w-full max-w-[400px] space-y-6">
        {/* Header Section */}
        <div className="text-center space-y-2">
          <div className="flex flex-col items-center justify-center mb-6">
            <Logo size="lg" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            {t.welcome}
          </h1>
          <p className="text-sm text-slate-500">
            {t.subtitle}
          </p>
        </div>

        {/* Login Card */}
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700">{t.emailLabel}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t.emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10 bg-white border-slate-300 focus-visible:ring-slate-400"
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-slate-700">{t.passwordLabel}</Label>
                  <button type="button" className="text-sm font-medium text-slate-600 hover:text-slate-900 hover:underline">
                    {t.forgotPassword}
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={t.passwordPlaceholder}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-10 pr-10 bg-white border-slate-300 focus-visible:ring-slate-400"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 bg-slate-900 hover:bg-slate-800 text-white transition-all"
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                  />
                ) : (
                  t.signIn
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer Actions */}
        <div className="flex flex-col items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2 font-normal text-slate-500 hover:text-slate-900">
                <Globe className="w-4 h-4" />
                <span className="uppercase">{language}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center">
              <DropdownMenuItem onClick={() => setLanguage("en")} className="gap-2">
                <span className="w-4">{language === "en" && <Check className="w-3 h-3" />}</span>
                English
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage("vn")} className="gap-2">
                <span className="w-4">{language === "vn" && <Check className="w-3 h-3" />}</span>
                Tiếng Việt
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage("jp")} className="gap-2">
                <span className="w-4">{language === "jp" && <Check className="w-3 h-3" />}</span>
                日本語
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <p className="text-center text-xs text-slate-400">
            {t.footer}
          </p>
        </div>
      </div>
    </div>
  )
}
