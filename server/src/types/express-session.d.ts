declare global {
  namespace Express {
    interface Session {
      userId?: string;
    }
  }
}

export {};
