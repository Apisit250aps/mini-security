'use client';

import React, { useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import { cn } from '@repo/ui/lib/utils';
import { Button } from '@repo/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';
import { FieldDescription, FieldGroup } from '@repo/ui/components/field';
import {
  InputField,
  PasswordField,
} from '@repo/ui/components/shared/form/input-field';
import { ButtonLoading } from '@repo/ui/components/shared/button/index';
import { useSession } from '../hooks/session-provider';
import { toast } from '@repo/ui/components/sonner';
import { getCallbackUrl, getErrorMessage, buildPageUrl } from '@/shared/utils';

export default function SignInForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const router = useRouter();
  const { signIn } = useSession();
  const methods = useForm({
    resolver: zodResolver(
      z.object({
        email: z.email('รูปแบบอีเมลไม่ถูกต้อง'),
        password: z
          .string()
          .min(8, 'รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร'),
      }),
    ),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const isSubmitting = methods.formState.isSubmitting;

  const handleSignIn = useCallback(
    async (data: { email: string; password: string }) => {
      const redirectUrl = buildPageUrl('adminDashboard');
      const res = await signIn.email({
        email: data.email,
        password: data.password,
        callbackURL: getCallbackUrl(redirectUrl),
      });
      if (res?.error) {
        toast.error(getErrorMessage(res.error, 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'));
        return;
      }
      toast.success('เข้าสู่ระบบสำเร็จ');
      router.push(redirectUrl);
    },
    [signIn, router],
  );

  const handleGoogleSignIn = useCallback(async () => {
    try {
      await signIn.social({
        provider: 'google',
        callbackURL: getCallbackUrl(buildPageUrl('adminDashboard')),
      });
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'ไม่สามารถเข้าสู่ระบบด้วย Google ได้'));
    }
  }, [signIn]);

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

              <div className="flex flex-col gap-3 pt-2">
                <ButtonLoading type="submit" isLoading={isSubmitting}>
                  Sign In
                </ButtonLoading>
                <Button
                  variant="outline"
                  type="button"
                  onPress={handleGoogleSignIn}
                >
                  Sign in with Google
                </Button>
                <FieldDescription className="text-center pt-1">
                  Don&apos;t have an account?{' '}
                  <Link
                    href={buildPageUrl('signUp')}
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    Sign up
                  </Link>
                </FieldDescription>
              </div>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
