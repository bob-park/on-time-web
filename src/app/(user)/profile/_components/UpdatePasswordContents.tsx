'use client';

import { useState } from 'react';

import { IoEye, IoEyeOff } from 'react-icons/io5';

import { useUpdateUserPassword } from '@/domain/user/query/user';
import useToast from '@/shared/hooks/useToast';

import cx from 'classnames';
import { useTranslations } from 'next-intl';

export default function UpdatePasswordContents() {
  // i18n
  const t = useTranslations('profile.password');

  // state
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  // hooks
  const { push } = useToast();

  // query
  const { updatePassword, isLoading } = useUpdateUserPassword(
    () => {
      push(t('successToast'), 'success');
      setPassword('');
      setConfirmPassword('');
    },
    () => {
      push(t('errorToast'), 'error');
    },
  );

  // derived
  const isMismatch = confirmPassword.length > 0 && password !== confirmPassword;
  const canSubmit = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword && !isLoading;

  // handle
  const handleUpdatePassword = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!canSubmit) {
      return;
    }

    updatePassword({ updatePassword: password });
  };

  return (
    <div className="animate-fade-up bg-base-300 w-full rounded-lg p-5">
      <div className="mb-5 border-b border-white/10 pb-4">
        <h3 className="text-lg font-semibold">{t('title')}</h3>
      </div>

      <form onSubmit={handleUpdatePassword}>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-base-content/60 text-[11px] font-semibold tracking-[1.4px] uppercase">
              {t('newLabel')}
            </label>
            <div className="bg-base-200 focus-within:ring-primary flex items-center gap-2 rounded-full px-4 py-2.5 ring-1 ring-white/10 transition focus-within:ring-1">
              <input
                type={showPassword ? 'text' : 'password'}
                className="placeholder:text-base-content/40 flex-1 bg-transparent text-sm outline-none"
                placeholder={t('newPlaceholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="text-base-content/40 hover:text-base-content/70 transition-colors"
                aria-label={t('toggleAria')}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <IoEyeOff className="size-5" /> : <IoEye className="size-5" />}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-base-content/60 text-[11px] font-semibold tracking-[1.4px] uppercase">
              {t('confirmLabel')}
            </label>
            <div
              className={cx(
                'bg-base-200 flex items-center gap-2 rounded-full px-4 py-2.5 ring-1 transition',
                isMismatch ? 'ring-error' : 'focus-within:ring-primary ring-white/10 focus-within:ring-1',
              )}
            >
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                className="placeholder:text-base-content/40 flex-1 bg-transparent text-sm outline-none"
                placeholder={t('confirmPlaceholder')}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                className="text-base-content/40 hover:text-base-content/70 transition-colors"
                aria-label={t('toggleAria')}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <IoEyeOff className="size-5" /> : <IoEye className="size-5" />}
              </button>
            </div>
            {isMismatch && <p className="text-error mt-1 text-sm">{t('mismatch')}</p>}
          </div>

          <div className="mt-2 flex items-center justify-between gap-4">
            <span className="text-base-content/60 text-xs">{t('hint')}</span>
            <button type="submit" className="btn btn-primary rounded-full px-6" disabled={!canSubmit}>
              {isLoading ? (
                <>
                  <span className="loading loading-spinner loading-xs" />
                  {t('submitting')}
                </>
              ) : (
                t('submit')
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
