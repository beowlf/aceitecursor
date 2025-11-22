import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // ============================================
  // MODO DESENVOLVIMENTO: PERMITIR ACESSO TOTAL
  // TODO: Reativar autenticação depois
  // ============================================
  
  // TEMPORARIAMENTE: Permitir acesso a todas as rotas sem verificar autenticação
  // Isso permite trabalhar sem bloqueios
  console.log(`[MIDDLEWARE] Permitindo acesso a: ${request.nextUrl.pathname}`);
  return response;

  /* CÓDIGO ORIGINAL COMENTADO - REATIVAR DEPOIS
  const publicRoutes = ['/auth/login', '/auth/register', '/diagnostico'];
  const isPublicRoute = publicRoutes.some(route => request.nextUrl.pathname.startsWith(route));

  if (isPublicRoute) {
    return response;
  }

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
            response = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    let user = null;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      user = session?.user;
    } catch (error) {
      console.warn('Erro ao verificar sessão:', error);
      return response;
    }

    if (user && isPublicRoute) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }

    if (user) {
      return response;
    }

    if (!user && !isPublicRoute) {
      const url = request.nextUrl.clone();
      url.pathname = '/auth/login';
      return NextResponse.redirect(url);
    }

    return response;
  } catch (error) {
    console.error('Erro no middleware:', error);
    return response;
  }
  */
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






