import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/types/database';

export function createClient() {
  const cookieStore = cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
<<<<<<< HEAD
          } catch (error) { }
=======
          } catch (error) {}
>>>>>>> 216fc4495fa2672be9db4277c8591826e7bdd72b
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
<<<<<<< HEAD
          } catch (error) { }
=======
          } catch (error) {}
>>>>>>> 216fc4495fa2672be9db4277c8591826e7bdd72b
        },
      },
    }
  );
}
