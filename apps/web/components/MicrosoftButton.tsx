/**
 * Microsoft Sign-In ボタンコンポーネント
 * 公式の Microsoft Design スタイルを再現
 * React/Next.js版（RN版から移植）
 */

import React, { useState, CSSProperties } from 'react';

interface MicrosoftButtonProps {
  onPress: () => void | Promise<void>;
  disabled?: boolean;
  loading?: boolean;
  label?: string;
  className?: string;
}

export function MicrosoftButton({
  onPress,
  disabled = false,
  loading = false,
  label = 'Microsoft OneDrive でログイン',
  className = '',
}: MicrosoftButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const baseStyles: CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: '40px',
    borderRadius: '20px',
    backgroundColor: disabled ? 'rgba(0, 120, 212, 0.38)' : '#0078D4',
    border: `1px solid ${disabled ? 'rgba(0, 120, 212, 0.38)' : '#0078D4'}`,
    paddingLeft: '12px',
    paddingRight: '12px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    ...(isHovered && !disabled && {
      boxShadow: 'rgba(0, 120, 212, 0.3) 0px 1px 2px',
    }),
    ...(isPressed && !disabled && {
      boxShadow: 'rgba(0, 120, 212, 0.3) 0px 1px 3px',
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
      {/* Microsoft Logo Icon */}
      {!loading && (
        <svg
          viewBox="0 0 48 48"
          width="20"
          height="20"
          style={{ marginRight: '10px', flexShrink: 0 }}
        >
          {/* Top Left - Red */}
          <path d="M0 0h20v20H0z" fill="#F25022" />
          {/* Top Right - Green */}
          <path d="M28 0h20v20H28z" fill="#7FBA00" />
          {/* Bottom Left - Blue */}
          <path d="M0 28h20v20H0z" fill="#00A4EF" />
          {/* Bottom Right - Yellow */}
          <path d="M28 28h20v20H28z" fill="#FFB900" />
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
            border: '2px solid rgba(255, 255, 255, 0.3)',
            borderTop: '2px solid #FFFFFF',
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
          color: disabled ? 'rgba(255, 255, 255, 0.38)' : '#FFFFFF',
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
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            opacity: 0.12,
            borderRadius: '20px',
            pointerEvents: 'none',
          }}
        />
      )}
    </button>
  );
}
