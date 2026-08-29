import { PKCEUtil } from './pkce.util';

describe('PKCEUtil', () => {
  describe('generatePKCE', () => {
    it('verifier は 43-128 文字である', () => {
      const { verifier } = PKCEUtil.generatePKCE();
      expect(verifier.length).toBeGreaterThanOrEqual(43);
      expect(verifier.length).toBeLessThanOrEqual(128);
    });

    it('challenge は Base64URL エンコードされている', () => {
      const { challenge } = PKCEUtil.generatePKCE();
      // Base64URL エンコード: a-z, A-Z, 0-9, -, _ のみ
      expect(/^[A-Za-z0-9_-]+$/.test(challenge)).toBe(true);
    });

    it('verifier と challenge は異なる', () => {
      const { verifier, challenge } = PKCEUtil.generatePKCE();
      expect(verifier).not.toBe(challenge);
    });

    it('複数回呼び出すと異なる値が生成される', () => {
      const pkce1 = PKCEUtil.generatePKCE();
      const pkce2 = PKCEUtil.generatePKCE();
      expect(pkce1.verifier).not.toBe(pkce2.verifier);
      expect(pkce1.challenge).not.toBe(pkce2.challenge);
    });
  });

  describe('generateState', () => {
    it('state は 32 文字である', () => {
      const state = PKCEUtil.generateState();
      expect(state.length).toBe(32);
    });

    it('state は英数字のみ', () => {
      const state = PKCEUtil.generateState();
      expect(/^[A-Za-z0-9]+$/.test(state)).toBe(true);
    });

    it('複数回呼び出すと異なる値が生成される', () => {
      const state1 = PKCEUtil.generateState();
      const state2 = PKCEUtil.generateState();
      expect(state1).not.toBe(state2);
    });
  });

  describe('validateState', () => {
    it('同じ state は検証に成功', () => {
      const state = 'test-state-123';
      expect(() =>
        PKCEUtil.validateState(state, state),
      ).not.toThrow();
    });

    it('異なる state は検証に失敗', () => {
      expect(() =>
        PKCEUtil.validateState('state1', 'state2'),
      ).toThrow('CSRF validation failed: state mismatch');
    });

    it('空の state は失敗', () => {
      expect(() =>
        PKCEUtil.validateState('', 'state'),
      ).toThrow();
    });
  });

  describe('validateVerifier', () => {
    it('有効な長さの verifier は検証に成功', () => {
      const verifier = 'a'.repeat(50);
      expect(() => PKCEUtil.validateVerifier(verifier)).not.toThrow();
    });

    it('短すぎる verifier は失敗', () => {
      const verifier = 'a'.repeat(42);
      expect(() => PKCEUtil.validateVerifier(verifier)).toThrow();
    });

    it('長すぎる verifier は失敗', () => {
      const verifier = 'a'.repeat(129);
      expect(() => PKCEUtil.validateVerifier(verifier)).toThrow();
    });

    it('最小長 43 文字は成功', () => {
      const verifier = 'a'.repeat(43);
      expect(() => PKCEUtil.validateVerifier(verifier)).not.toThrow();
    });

    it('最大長 128 文字は成功', () => {
      const verifier = 'a'.repeat(128);
      expect(() => PKCEUtil.validateVerifier(verifier)).not.toThrow();
    });
  });
});
