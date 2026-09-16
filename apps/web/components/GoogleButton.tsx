/**
 * Google Sign-In ボタンコンポーネント
 * 公式の Google Material Design スタイルを再現
 * React/Next.js版（RN版から移植）
 */

import React, { useState, CSSProperties } from 'react';

interface GoogleButtonProps {
  onPress: () => void | Promise<void>;
  disabled?: boolean;
  loading?: boolean;
  label?: string;
  className?: string;
}

export function GoogleButton({
  onPress,
  disabled = false,
  loading = false,
  label = 'Google でログイン',
  className = '',
}: GoogleButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const baseStyles: CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: '40px',
    borderRadius: '20px',
    backgroundColor: disabled ? 'rgba(255, 255, 255, 0.38)' : '#FFFFFF',
    border: `1px solid ${disabled ? 'rgba(31, 31, 31, 0.12)' : '#747775'}`,
    paddingLeft: '12px',
    paddingRight: '12px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    ...(isHovered && !disabled && {
      boxShadow: 'rgba(60, 64, 67, 0.30) 0px 1px 2px',
    }),
    ...(isPressed && !disabled && {
      boxShadow: 'rgba(60, 64, 67, 0.30) 0px 1px 3px',
    }),
  };

  return (
    <button
      onClick={onPress}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      disabled={disabled || loading}
      style={baseStyles}
      className={className}
    >
      {/* Google Logo SVG Icon */}
      {!loading && (
        <svg
          viewBox="0 0 48 48"
          width="20"
          height="20"
          style={{ marginRight: '10px', flexShrink: 0 }}
        >
          {/* Red Path */}
          <path
            d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
            fill="#EA4335"
          />
          {/* Blue Path */}
          <path
            d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
            fill="#4285F4"
          />
          {/* Yellow Path */}
          <path
            d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
            fill="#FBBC05"
          />
          {/* Green Path */}
          <path
            d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
            fill="#34A853"
          />
        </svg>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div
          style={{
            display: 'inline-block',
            width: '16px',
            height: '16px',
            marginRight: '10px',
            border: '2px solid #e0e0e0',
            borderTop: '2px solid #1f1f1f',
            borderRadius: '50%',
            animation: 'spin 0.6s linear infinite',
          }}
        >
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}

      {/* Text Label */}
      <span
        style={{
          fontSize: '14px',
          fontWeight: '500',
          color: disabled ? 'rgba(31, 31, 31, 0.38)' : '#1f1f1f',
          fontFamily: '"Roboto", "Arial", sans-serif',
          letterSpacing: '0.25px',
          opacity: disabled ? 0.38 : 1,
        }}
      >
        {label}
      </span>

      {/* Ripple Effect Background */}
      {isPressed && !disabled && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#303030',
            opacity: 0.12,
            borderRadius: '20px',
            pointerEvents: 'none',
          }}
        />
      )}
    </button>
  );
}
