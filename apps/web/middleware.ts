import { NextRequest, NextResponse } from 'next/server';

/**
 * Next.js ミドルウェア
 * 認証状態を確認し、すべてのページのリダイレクトを一元管理
 * 
 * 注意：
 * - このファイルはサーバーサイド（Edge Runtime）で実行されます
 * - useAuth() などのクライアントサイド React Hook は使用不可
 * - セッションクッキーで認証状態を確認します
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ✅ セッションクッキーから認証状態を確認
  // サーバーサイドで直接クッキーをチェック（useAuth に依存しない）
  const sessionId = request.cookies.get('danmaku.session.id')?.value;
  const isAuthenticated = !!sessionId;

  // ✅ 認証不要（公開）ページ
  const publicPages = ['/about', '/auth/login'];

  // ✅ 認証必須ページ（ルートを含む）
  const protectedPages = [
    '/',
    '/home',
    '/drive',
    '/watch',
    '/network',
    '/nicovideo',
    '/playlist',
    '/screenshot',
    '/settings',
    '/watched-history',
  ];

  // 公開ページはそのまま通す
  if (publicPages.includes(pathname)) {
    return NextResponse.next();
  }

  // ✅ 認証が必要なページ（ルート'/'も含む）
  if (protectedPages.includes(pathname) || pathname.startsWith('/')) {
    if (!isAuthenticated) {
      // 未認証の場合は /about にリダイレクト
      return NextResponse.redirect(new URL('/about', request.url));
    }
  }

  return NextResponse.next();
}

/**
 * ミドルウェアが適用されるパスの設定
 */
export const config = {
  // 画像や _next フォルダ、ファビコン、ヘルスチェックなどを除外
  matcher: [
    '/((?!api|_next/static|_next/image|photos|favicon.ico|health).*)' 
  ],
};
