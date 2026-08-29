import { AuthGuard } from './auth.guard';
import { UnauthorizedException } from '@nestjs/common';
import { ExecutionContext } from '@nestjs/common';

describe('AuthGuard', () => {
  let guard: AuthGuard;

  beforeEach(() => {
    guard = new AuthGuard();
  });

  describe('canActivate', () => {
    it('session.userId が存在する場合、true を返す', () => {
      const mockExecutionContext: any = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            session: {
              userId: 1n,
            },
          }),
        }),
      };

      const result = guard.canActivate(mockExecutionContext);
      expect(result).toBe(true);
    });

    it('session.userId がない場合、UnauthorizedException を投げる', () => {
      const mockExecutionContext: any = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            session: {},
          }),
        }),
      };

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        UnauthorizedException,
      );
    });

    it('session がない場合、UnauthorizedException を投げる', () => {
      const mockExecutionContext: any = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({}),
        }),
      };

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        UnauthorizedException,
      );
    });
  });
});
