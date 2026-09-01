'use client';

import { useState } from 'react';
import axios from 'axios';

interface NicovideLoginFormProps {
  onLoginSuccess: () => void;
}

export function NicovideLoginForm({ onLoginSuccess }: NicovideLoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await axios.post(
        `${apiUrl}/api/nicovideo/auth/login`,
        { email, password },
        { withCredentials: true }
      );

      if (response.data.success) {
        setEmail('');
        setPassword('');
        onLoginSuccess();
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 
        err.response?.data?.error ||
        'ログインに失敗しました。';
      
      // セッションなしエラーの場合は具体的なメッセージを表示
      if (errorMsg.includes('ユーザーセッションなし')) {
        setError('先に Google アカウントでログインしてください');
      } else {
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-6">ニコ動ログイン</h2>

        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500 rounded text-red-200 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              メールアドレス
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              パスワード
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium rounded transition-colors"
          >
            {loading ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>

        <p className="text-gray-400 text-sm mt-4 text-center">
          ⚠️ ニコニコ動画のアカウント情報が必要です
        </p>
      </div>
    </div>
  );
}
