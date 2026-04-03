# Supabase Authentication Setup Guide

## 1. Enable Email & Password Sign Up
1. Go to your Supabase Project Dashboard
2. Navigate to **Authentication** > **Providers**
3. Ensure the **Email** provider is enabled
4. Toggle "Confirm email" OFF for development (optional but recommended for faster testing)

## 2. Configure Site URL
1. Go to **Authentication** > **URL Configuration**
2. Important: Set your **Site URL** to your local dev environment (e.g., `http://localhost:3000`)
3. Add any additional redirect URLs required (like `http://localhost:3000/auth/callback` if using magic links)

## 3. Database Triggers
The provided `setup.sql` file creates a trigger (`on_auth_user_created`) that listens for new users registered via Auth. It will successfully auto-generate a row in your `public.profiles` table with the default `employee` role immediately upon successful signup.

## 4. Retrieve Credentials
1. Go to **Project Settings** > **API**
2. Copy your `Project URL` and paste it into `.env.local` as `NEXT_PUBLIC_SUPABASE_URL`
3. Copy your `anon` `public` key and paste it as `NEXT_PUBLIC_SUPABASE_ANON_KEY`
