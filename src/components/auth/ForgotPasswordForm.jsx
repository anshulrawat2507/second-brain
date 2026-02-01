'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button, Input, Card, CardContent } from '@/components/ui';
import { isValidEmail } from '@/lib/utils';
import toast from 'react-hot-toast';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setError('Email is required');
      return;
    }

    if (!isValidEmail(email)) {
      setError('Please enter a valid email');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const supabase = createClient();

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (resetError) {
        toast.error(resetError.message);
        return;
      }

      setIsSubmitted(true);
      toast.success('Password reset email sent!');
    } catch {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="text-center">
          <pre className="text-[var(--accent)] text-xs mb-4 font-mono inline-block">
{`╔══════════════════╗
║   EMAIL SENT!    ║
╚══════════════════╝`}
          </pre>
          
          <p className="text-[var(--text-secondary)] mb-4">
            We&apos;ve sent a password reset link to:
          </p>
          
          <p className="text-[var(--text-primary)] font-semibold mb-6">
            {email}
          </p>
          
          <p className="text-sm text-[var(--text-secondary)] mb-6">
            Please check your email and follow the instructions to reset your password.
          </p>
          
          <Link href="/login">
            <Button variant="secondary" className="w-full">
              Back to Login
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent>
        <div className="text-center mb-6">
          <pre className="text-[var(--accent)] text-xs mb-4 font-mono inline-block">
{`╔══════════════════╗
║  RESET PASSWORD  ║
╚══════════════════╝`}
          </pre>
          <p className="text-[var(--text-secondary)] text-sm">
            Enter your email to receive a reset link
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={error}
            autoComplete="email"
            disabled={isLoading}
          />

          <Button
            type="submit"
            className="w-full"
            isLoading={isLoading}
          >
            Send Reset Link
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-[var(--text-secondary)]">
            Remember your password?{' '}
          </span>
          <Link
            href="/login"
            className="text-[var(--accent)] hover:text-[var(--highlight)]"
          >
            Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
