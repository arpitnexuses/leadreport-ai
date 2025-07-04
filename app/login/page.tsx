"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Loader2, Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        router.push('/'); // Redirect to dashboard
      } else {
        const data = await res.json();
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-cyan p-4 md:p-8">
      <div className="w-full max-w-6xl overflow-hidden rounded-3xl flex flex-col md:flex-row shadow-2xl" style={{ minHeight: '700px' }}>
        {/* Left side - Background image */}
        <div className="relative w-full md:w-1/2 bg-black text-white">
          <Image
            src="https://22527425.fs1.hubspotusercontent-na1.net/hubfs/22527425/ChatGPT%20Image%20Jul%204%2c%202025%2c%2002_39_47%20PM.png"
            alt="Audit background"
            fill
            priority
            className="object-cover object-center"
          />
          <div className="relative z-10 p-8 md:p-12 flex flex-col h-full">
            <div className="mb-auto">
              <p className="text-sm uppercase tracking-wider opacity-80">Nexuses.</p>
            </div>
            <div className="mt-auto">
              <h1 className="text-5xl md:text-6xl font-playfair font-bold leading-tight mb-4">
                Welcome To
                <br />
                AI
                <br />
                Lead Report Portal
              </h1>
              <p className="opacity-80 max-w-md">
                Unlock the power of AI-driven lead generation. Discover, engage, and convert your best prospects with intelligent insights and comprehensive reporting.
              </p>
            </div>
          </div>
        </div>

        {/* Right side - Login form */}
        <div className="w-full md:w-1/2 bg-white p-8 md:p-12 flex flex-col">
          <div className="flex justify-end mb-12">
            <div className="flex items-center">
              <span className="font-medium text-lg">Lead Report System</span>
            </div>
          </div>

          <div className="max-w-md mx-auto w-full">
            <h2 className="text-4xl font-playfair font-bold mb-2">Welcome Back</h2>
            <p className="text-gray-500 mb-8">Enter your email and password to access your account</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-black focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-black focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded relative text-sm">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                  />
                  <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>
                <a href="#" className="text-sm font-medium text-black hover:underline">
                  Forgot Password?
                </a>
              </div>

              <button
                type="submit"
                className="w-full h-12 bg-black text-white rounded-lg font-medium hover:bg-gray-900 transition-colors"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    <span>Signing In...</span>
                  </div>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
} 