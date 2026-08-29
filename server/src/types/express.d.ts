import 'express-session';

declare global {
  namespace Express {
    interface Session {
      // string に変換した userId を追加
      userId?: string;
    }
  }
}
