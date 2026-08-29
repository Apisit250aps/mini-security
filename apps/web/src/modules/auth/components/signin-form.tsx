'use client';
import { cn } from '@repo/ui/lib/utils';
import { Button } from '@repo/ui/components/button';
import { useForm } from 'react-hook-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';
import { Field, FieldDescription, FieldGroup } from '@repo/ui/components/field';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import { InputField, PasswordField } from '@repo/ui/form/input-field';
import { useCallback } from 'react';
import { useSession } from '../hooks/session-provider';

export default function SignInForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const { signIn } = useSession();
  const methods = useForm({
    resolver: zodResolver(
      z.object({
        email: z.email('Invalid email address'),
        password: z
          .string()
          .min(8, 'Password must be at least 8 characters long'),
      }),
    ),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  const handleSignIn = useCallback(
    async (data: { email: string; password: string }) => {
      const res = await signIn.email({
        email: data.email,
        password: data.password,
        callbackURL: window.location.origin,
      });
      if (res) {
        console.error(res);
      }
    },
    [signIn],
  );
  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Sign in to your account</CardTitle>
          <CardDescription>
            Enter your email below to sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={methods.handleSubmit(handleSignIn)}>
            <FieldGroup>
              <InputField
                id="email"
                label="Email"
                type="email"
                placeholder="m@example.com"
                required
                name="email"
                control={methods.control}
              />

              <PasswordField
                id="password"
                label="Password"
                required
                name="password"
                control={methods.control}
              />

              <Field>
                <Button type="submit">Sign In</Button>
                <Button variant="outline" type="button">
                  Sign in with Google
                </Button>
                <FieldDescription className="text-center">
                  Don&apos;t have an account?{' '}
                  <Link href="/signup">Sign up</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
