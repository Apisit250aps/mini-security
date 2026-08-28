'use client';
import { createAuthClient } from 'better-auth/react';
// import config from '@repo/configs';
export const { signIn, signUp, useSession } = createAuthClient({
  baseURL: 'http://localhost:8000',
});
