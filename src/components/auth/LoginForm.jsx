'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button, Input, Card, CardContent } from '@/components/ui';
import { isValidEmail } from '@/lib/utils';
import toast from 'react-hot-toast';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const message = searchParams.get('message');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const supabase = createClient();

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success('Welcome back!');
      router.push('/dashboard');
      router.refresh();
    } catch {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent>
        <div className="text-center mb-6">
          <pre className="text-[var(--accent)] text-xs mb-4 font-mono inline-block">
{`╔══════════════════╗
║   SECOND BRAIN   ║
║   ─── LOGIN ───  ║
╚══════════════════╝`}
          </pre>
          <p className="text-[var(--text-secondary)] text-sm">
            Access your personal knowledge base
          </p>
        </div>

        {message && (
          <div className="mb-4 p-3 rounded border border-[var(--accent)] bg-[var(--bg-secondary)] text-sm text-[var(--text-secondary)]">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            autoComplete="email"
            disabled={isLoading}
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            autoComplete="current-password"
            disabled={isLoading}
          />

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-[var(--border)] bg-[var(--bg-secondary)] 
                  text-[var(--accent)] focus:ring-[var(--accent)]"
              />
              <span className="text-sm text-[var(--text-secondary)]">
                Remember me
              </span>
            </label>

            <Link
              href="/forgot-password"
              className="text-sm text-[var(--accent)] hover:text-[var(--highlight)]"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full"
            isLoading={isLoading}
          >
            Sign In
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-[var(--text-secondary)]">
            Don&apos;t have an account?{' '}
          </span>
          <Link
            href="/register"
            className="text-[var(--accent)] hover:text-[var(--highlight)]"
          >
            Create one
          </Link>
        </div>

        <div className="mt-8 pt-4 border-t border-[var(--border)]">
          <p className="text-xs text-center text-[var(--text-secondary)] opacity-60">
            Your personal knowledge base. Retro style. Forever free.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
