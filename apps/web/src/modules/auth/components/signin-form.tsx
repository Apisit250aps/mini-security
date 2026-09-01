'use client';

import React, { useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import { cn } from '@repo/ui/lib/utils';
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
import { getErrorMessage, buildPageUrl } from '@/shared/utils';

const signInSchema = z.object({
  email: z.email('รูปแบบอีเมลไม่ถูกต้อง'),
  password: z.string().min(8, 'รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร'),
});

type SignInFormProps = z.infer<typeof signInSchema>;

export default function SignInForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const router = useRouter();
  const { signIn } = useSession();
  const methods = useForm<SignInFormProps>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const isSubmitting = methods.formState.isSubmitting;

  const handleSignIn = useCallback(
    async (data: SignInFormProps) => {
      const res = await signIn.email({
        email: data.email,
        password: data.password,
      });
      if (res?.error) {
        toast.error(getErrorMessage(res.error, 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'));
        return;
      }
      toast.success('เข้าสู่ระบบสำเร็จ');
      router.refresh();
    },
    [signIn, router],
  );

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>เข้าสู่ระบบบัญชีของคุณ</CardTitle>
          <CardDescription>
            กรอกอีเมลด้านล่างเพื่อเข้าสู่ระบบบัญชีของคุณ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={methods.handleSubmit(handleSignIn)}>
            <FieldGroup>
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

              <div className="flex flex-col gap-3 pt-2">
                <ButtonLoading type="submit" isLoading={isSubmitting}>
                  เข้าสู่ระบบ
                </ButtonLoading>
                <FieldDescription className="text-center pt-1">
                  ยังไม่มีบัญชี?{' '}
                  <Link
                    href={buildPageUrl('signUp')}
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    สมัครสมาชิก
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
