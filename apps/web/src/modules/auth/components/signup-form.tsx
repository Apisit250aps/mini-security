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
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  InputField,
  PasswordField,
} from '@repo/ui/components/shared/form/input-field';
import z from 'zod';
import { useSession } from '../hooks/session-provider';
import { useCallback } from 'react';
import { toast } from '@repo/ui/components/sonner';
import { getCallbackUrl, getErrorMessage } from '@/shared/utils';

export default function SignUpForm({
  ...props
}: React.ComponentProps<typeof Card>) {
  const router = useRouter();
  const { signUp, signIn } = useSession();
  const methods = useForm({
    resolver: zodResolver(
      z
        .object({
          name: z.string().min(1, 'กรุณาระบุชื่อ-นามสกุล'),
          email: z.email('รูปแบบอีเมลไม่ถูกต้อง'),
          password: z
            .string()
            .min(8, 'รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร'),
          confirmPassword: z
            .string()
            .min(8, 'ยืนยันรหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร'),
        })
        .refine((data) => data.password === data.confirmPassword, {
          message: 'รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน',
          path: ['confirmPassword'],
        }),
    ),
  });

  const isSubmitting = methods.formState.isSubmitting;

  const handleSignUp = useCallback(
    async (data: { name: string; email: string; password: string }) => {
      const res = await signUp.email({
        name: data.name,
        email: data.email,
        password: data.password,
        callbackURL: getCallbackUrl('/admin/user'),
      });
      if (res?.error) {
        toast.error(getErrorMessage(res.error, 'ไม่สามารถสร้างบัญชีผู้ใช้ได้'));
        return;
      }
      toast.success('สร้างบัญชีผู้ใช้สำเร็จ');
      router.push('/admin/user');
    },
    [signUp, router],
  );

  const handleGoogleSignUp = useCallback(async () => {
    try {
      await signIn.social({
        provider: 'google',
        callbackURL: getCallbackUrl('/admin/user'),
      });
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'ไม่สามารถสมัครสมาชิกด้วย Google ได้'));
    }
  }, [signIn]);

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
                <Button type="submit" aria-disabled={isSubmitting}>
                  {isSubmitting ? 'Creating account...' : 'Create Account'}
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  onPress={handleGoogleSignUp}
                >
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
