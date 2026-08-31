'use client';

import React, { useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
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

export default function SignUpForm({
  ...props
}: React.ComponentProps<typeof Card>) {
  const router = useRouter();
  const { signUp } = useSession();
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
      const redirectUrl = buildPageUrl('adminDashboard');
      const res = await signUp.email({
        name: data.name,
        email: data.email,
        password: data.password,
        callbackURL: getCallbackUrl(redirectUrl),
      });
      if (res?.error) {
        toast.error(getErrorMessage(res.error, 'ไม่สามารถสร้างบัญชีผู้ใช้ได้'));
        return;
      }
      toast.success('สร้างบัญชีผู้ใช้สำเร็จ');
      router.push(redirectUrl);
    },
    [signUp, router],
  );

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>สร้างบัญชีผู้ใช้</CardTitle>
        <CardDescription>
          กรอกข้อมูลของคุณด้านล่างเพื่อสร้างบัญชีผู้ใช้
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={methods.handleSubmit(handleSignUp)}>
          <FieldGroup>
            <InputField
              id="name"
              label="ชื่อ-นามสกุล"
              placeholder="สมชาย ใจดี"
              required
              name="name"
              control={methods.control}
            />
            <InputField
              id="email"
              label="อีเมล"
              type="email"
              placeholder="m@example.com"
              required
              name="email"
              control={methods.control}
            />
            <PasswordField
              id="password"
              label="รหัสผ่าน"
              required
              name="password"
              control={methods.control}
            />
            <PasswordField
              id="confirm-password"
              label="ยืนยันรหัสผ่าน"
              required
              name="confirmPassword"
              control={methods.control}
            />
            <div className="flex flex-col gap-3 pt-2">
              <ButtonLoading type="submit" isLoading={isSubmitting}>
                สร้างบัญชี
              </ButtonLoading>
              <FieldDescription className="px-6 text-center pt-1">
                มีบัญชีอยู่แล้ว?{' '}
                <Link
                  href={buildPageUrl('signIn')}
                  className="text-primary underline-offset-4 hover:underline"
                >
                  เข้าสู่ระบบ
                </Link>
              </FieldDescription>
            </div>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
