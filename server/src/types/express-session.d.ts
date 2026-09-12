declare global {
  namespace Express {
    interface Session {
      userId?: string;
      id?: string;
    }
  }
}

export {};
