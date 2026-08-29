'use client';
import { Button } from '@repo/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';
import { Field, FieldDescription, FieldGroup } from '@repo/ui/components/field';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { InputField, PasswordField } from '@repo/ui/form/input-field';
import z from 'zod';
import { useSession } from '../hooks/session-provider';
import { useCallback } from 'react';

export default function SignUpForm({
  ...props
}: React.ComponentProps<typeof Card>) {
  const { signUp } = useSession();
  const methods = useForm({
    resolver: zodResolver(
      z.object({
        name: z.string().min(1, 'Full Name is required'),
        email: z.string().email('Invalid email address'),
        password: z
          .string()
          .min(8, 'Password must be at least 8 characters long'),
        confirmPassword: z
          .string()
          .min(8, 'Confirm Password must be at least 8 characters long'),
      }),
    ),
  });

  const handleSignUp = useCallback(
    async (data: { name: string; email: string; password: string }) => {
      const res = await signUp.email({
        name: data.name,
        email: data.email,
        password: data.password,
        callbackURL: window.location.origin,
      });
      if (res?.error) {
        console.error(res.error);
      }
    },
    [signUp],
  );

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Enter your information below to create your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={methods.handleSubmit(handleSignUp)}>
          <FieldGroup>
            <InputField
              id="name"
              label="Full Name"
              placeholder="John Doe"
              required
              name="name"
              control={methods.control}
            />
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
            <PasswordField
              id="confirm-password"
              label="Confirm Password"
              required
              name="confirmPassword"
              control={methods.control}
            />
            <FieldGroup>
              <Field>
                <Button type="submit">Create Account</Button>
                <Button variant="outline" type="button">
                  Sign up with Google
                </Button>
                <FieldDescription className="px-6 text-center">
                  Already have an account? <Link href="/signin">Sign in</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
