import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { validatePassword } from '../../utils/crypto';

interface AuthScreenProps {
  onAuthenticated: () => void;
}

export function AuthScreen({ onAuthenticated }: AuthScreenProps) {
  const { state, login, setupUser, isSetupRequired } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSetup, setIsSetup] = useState(false);
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState<{
    isValid: boolean;
    errors: string[];
  }>({ isValid: false, errors: [] });

  useEffect(() => {
    checkSetupRequired();
  }, []);

  useEffect(() => {
    if (state.isAuthenticated) {
      onAuthenticated();
    }
  }, [state.isAuthenticated, onAuthenticated]);

  useEffect(() => {
    if (isSetup && password) {
      setPasswordStrength(validatePassword(password));
    }
  }, [password, isSetup]);

  const checkSetupRequired = async () => {
    try {
      const setupRequired = await isSetupRequired();
      setIsSetup(setupRequired);
    } catch (error) {
      setError('Failed to check setup status');
    }
  };

  const handleSubmit = async () => {
    setError('');

    if (!password) {
      setError('パスワードを入力してください');
      return;
    }

    if (isSetup) {
      if (!passwordStrength.isValid) {
        setError('パスワードが要件を満たしていません');
        return;
      }

      if (password !== confirmPassword) {
        setError('パスワードが一致しません');
        return;
      }

      try {
        console.log('Setting up user with password:', password);
        await setupUser(password);
        setPassword('');
        setConfirmPassword('');
        console.log('Setup successful');
      } catch (error) {
        console.error('Setup error:', error);
        setError(error instanceof Error ? error.message : 'セットアップに失敗しました');
      }
    } else {
      try {
        console.log('Attempting login with password:', password);
        await login(password);
        setPassword('');
        console.log('Login successful');
      } catch (error) {
        console.error('Login error:', error);
        setError(error instanceof Error ? error.message : 'ログインに失敗しました');
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f9fafb',
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        padding: '2rem',
        maxWidth: '28rem',
        width: '100%'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            margin: '0 auto 1rem',
            height: '3rem',
            width: '3rem',
            backgroundColor: '#3b82f6',
            borderRadius: '0.375rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '1.5rem'
          }}>
            🔒
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            セキュアメモ
          </h2>
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
            {isSetup ? 'マスターパスワードを設定してください' : 'パスワードを入力してください'}
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fee2e2',
            border: '1px solid #fecaca',
            borderRadius: '0.375rem',
            padding: '0.75rem',
            marginBottom: '1rem',
            color: '#dc2626',
            fontSize: '0.875rem'
          }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
            {isSetup ? 'マスターパスワード' : 'パスワード'}
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              style={{
                width: '100%',
                padding: '0.5rem 2.5rem 0.5rem 0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
              placeholder={isSetup ? '強力なパスワードを入力' : 'パスワードを入力'}
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.25rem',
                fontSize: '1.2rem'
              }}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
        </div>

        {isSetup && (
          <>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                パスワード確認
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
                placeholder="パスワードを再入力"
              />
            </div>

            {password && (
              <div style={{
                marginBottom: '1.5rem',
                padding: '0.75rem',
                backgroundColor: '#f3f4f6',
                borderRadius: '0.375rem',
                fontSize: '0.75rem'
              }}>
                <p style={{ fontWeight: '500', marginBottom: '0.5rem' }}>パスワード要件：</p>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  <li style={{ color: password.length >= 8 ? '#10b981' : '#6b7280' }}>
                    {password.length >= 8 ? '✓' : '○'} 8文字以上
                  </li>
                  <li style={{ color: /[A-Z]/.test(password) ? '#10b981' : '#6b7280' }}>
                    {/[A-Z]/.test(password) ? '✓' : '○'} 大文字を含む
                  </li>
                  <li style={{ color: /[a-z]/.test(password) ? '#10b981' : '#6b7280' }}>
                    {/[a-z]/.test(password) ? '✓' : '○'} 小文字を含む
                  </li>
                  <li style={{ color: /[0-9]/.test(password) ? '#10b981' : '#6b7280' }}>
                    {/[0-9]/.test(password) ? '✓' : '○'} 数字を含む
                  </li>
                  <li style={{ color: /[^A-Za-z0-9]/.test(password) ? '#10b981' : '#6b7280' }}>
                    {/[^A-Za-z0-9]/.test(password) ? '✓' : '○'} 特殊文字を含む
                  </li>
                </ul>
              </div>
            )}
          </>
        )}

        <button
          onClick={handleSubmit}
          disabled={state.isLoading}
          style={{
            width: '100%',
            padding: '0.5rem 1rem',
            backgroundColor: state.isLoading ? '#9ca3af' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            cursor: state.isLoading ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => !state.isLoading && (e.currentTarget.style.backgroundColor = '#2563eb')}
          onMouseOut={(e) => !state.isLoading && (e.currentTarget.style.backgroundColor = '#3b82f6')}
        >
          {state.isLoading ? '処理中...' : (isSetup ? 'アカウント作成' : 'ログイン')}
        </button>

        {isSetup && (
          <div style={{
            marginTop: '1.5rem',
            padding: '0.75rem',
            backgroundColor: '#fef3c7',
            border: '1px solid #fcd34d',
            borderRadius: '0.375rem',
            fontSize: '0.75rem',
            color: '#92400e'
          }}>
            <strong>⚠️ 重要：</strong>マスターパスワードは忘れると復元できません。必ず安全な場所に保管してください。
          </div>
        )}
      </div>
    </div>
  );
}