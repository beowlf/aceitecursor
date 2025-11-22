import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Rotas públicas que não precisam de autenticação
  const publicRoutes = ['/auth/login', '/auth/register', '/diagnostico'];
  const isPublicRoute = publicRoutes.some(route => request.nextUrl.pathname.startsWith(route));

  // Permitir acesso a rotas públicas
  if (isPublicRoute) {
    // Se o usuário já está autenticado e tenta acessar login/register, redirecionar para dashboard
    try {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return request.cookies.get(name)?.value;
            },
            set(name: string, value: string, options: any) {
              request.cookies.set(name, value);
              response = NextResponse.next({
                request,
              });
              response.cookies.set(name, value, options);
            },
            remove(name: string, options: any) {
              request.cookies.delete(name);
              response = NextResponse.next({
                request,
              });
              response.cookies.set(name, '', { ...options, maxAge: 0 });
            },
          },
        }
      );

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user && (request.nextUrl.pathname.startsWith('/auth/login') || request.nextUrl.pathname.startsWith('/auth/register'))) {
        const url = request.nextUrl.clone();
        url.pathname = '/dashboard';
        return NextResponse.redirect(url);
      }
    } catch (error) {
      // Ignorar erros em rotas públicas
    }
    return response;
  }

  // Verificar autenticação para rotas protegidas
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            request.cookies.set(name, value);
            response = NextResponse.next({
              request,
            });
            response.cookies.set(name, value, options);
          },
          remove(name: string, options: any) {
            request.cookies.delete(name);
            response = NextResponse.next({
              request,
            });
            response.cookies.set(name, '', { ...options, maxAge: 0 });
          },
        },
      }
    );

    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;

    // Se não há usuário autenticado, redirecionar para login
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/auth/login';
      url.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }

    // Usuário autenticado - permitir acesso
    return response;
  } catch (error) {
    console.error('Erro no middleware:', error);
    // Em caso de erro, redirecionar para login
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
