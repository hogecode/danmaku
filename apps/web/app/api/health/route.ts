import { NextResponse } from 'next/server';

/**
 * ヘルスチェックエンドポイント
 * Docker の healthcheck で使用
 * 
 * @returns 200 OK
 */
export async function GET() {
  return NextResponse.json(
    { status: 'healthy' },
    { status: 200 }
  );
}
