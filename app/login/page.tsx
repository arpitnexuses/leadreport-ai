'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f3fa]">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl flex overflow-hidden" style={{ minHeight: 600 }}>
        {/* Left: Login Form (Blue) with right curve */}
        <div className="flex-1 p-16 flex flex-col justify-center items-center bg-[#1D3FAD]" style={{ borderTopRightRadius: 120, borderBottomRightRadius: 120 }}>
          {/* Nexuses Logo */}
          <div className="flex justify-center mb-10 w-full">
            <img src="https://22527425.fs1.hubspotusercontent-na1.net/hubfs/22527425/Nexuses%20logo%20white.svg" alt="Nexuses Logo" className="h-16" style={{ maxWidth: 220 }} />
          </div>
          <h2 className="text-4xl font-bold text-white mb-8 text-center w-full">Log In</h2>
          <div className="text-center text-blue-100 mb-6 text-lg w-full">or use your email & password</div>
          <form className="space-y-6 w-full max-w-md" onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Email"
              className="w-full px-5 py-4 rounded-lg bg-white/20 text-white placeholder-blue-100 focus:outline-none focus:ring-2 focus:ring-white text-lg"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full px-5 py-4 rounded-lg bg-white/20 text-white placeholder-blue-100 focus:outline-none focus:ring-2 focus:ring-white text-lg"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded relative text-sm">{error}</div>
            )}
            <button
              type="submit"
              className="w-full py-4 mt-2 rounded-lg bg-white text-[#1D3FAD] font-semibold text-xl transition hover:bg-blue-100"
            >
              SIGN IN
            </button>
          </form>
        </div>
        {/* Right: Welcome Panel (White) with left curve */}
        <div className="flex-1 flex flex-col items-center justify-center text-[#1D3FAD] px-16 py-20 relative bg-white" style={{ borderTopLeftRadius: 120, borderBottomLeftRadius: 120 }}>
          <h2 className="text-4xl font-bold mb-6 text-center">Hello Users!</h2>
          <p className="mb-10 text-center text-2xl font-medium opacity-90">
            Unlock the power of AI-driven lead generation. Discover, engage, and convert your best prospects with Nexuses.
          </p>
          {/* <Link href="/signup">
            <button className="border-2 border-[#1D3FAD] rounded-lg px-10 py-3 text-xl font-semibold hover:bg-[#1D3FAD] hover:text-white transition">SIGN UP</button>
          </Link> */}
        </div>
      </div>
    </div>
  );
} 