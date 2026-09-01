'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthContext } from './AuthProvider';

export function Navigation() {
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuthContext();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-gray-900 border-b border-gray-700 sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold text-white">
            🎬 Danmaku
          </Link>

          <div className="flex items-center gap-6">
            {isAuthenticated && (
              <>
                <Link
                  href="/home"
                  className={`px-3 py-2 rounded ${
                    isActive('/home')
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  ホーム
                </Link>

                <Link
                  href="/watch"
                  className={`px-3 py-2 rounded ${
                    isActive('/watch')
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  ビデオ
                </Link>

                <Link
                  href="/drive"
                  className={`px-3 py-2 rounded ${
                    isActive('/drive')
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  Drive
                </Link>

                <Link
                  href="/nicovideo"
                  className={`px-3 py-2 rounded ${
                    isActive('/nicovideo')
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  ニコ動
                </Link>

                <div className="text-gray-400 text-sm">
                  {user?.email}
                </div>
              </>
            )}

            {!isAuthenticated && (
              <Link
                href="/auth/login"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
              >
                ログイン
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
