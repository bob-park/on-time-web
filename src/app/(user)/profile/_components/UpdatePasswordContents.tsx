'use client';

import { useState } from 'react';

import { IoEye, IoEyeOff } from 'react-icons/io5';

import { useUpdateUserPassword } from '@/domain/users/queries/user';
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
    <div className="animate-fade-up bg-base-100 border-base-300 rounded-box shadow-whisper w-full border p-5">
      <div className="border-soft mb-5 border-b pb-4">
        <h3 className="text-lg font-semibold">{t('title')}</h3>
      </div>

      <form onSubmit={handleUpdatePassword}>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-2 text-[11px] font-semibold tracking-[1.4px] uppercase">{t('newLabel')}</label>
            <div className="bg-base-100 border-base-300 focus-within:border-primary flex items-center gap-2 rounded-[10px] border px-4 py-2.5 transition">
              <input
                type={showPassword ? 'text' : 'password'}
                className="placeholder:text-3 flex-1 bg-transparent text-sm outline-none"
                placeholder={t('newPlaceholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="text-3 hover:text-2 transition-colors"
                aria-label={t('toggleAria')}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <IoEyeOff className="size-5" /> : <IoEye className="size-5" />}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-2 text-[11px] font-semibold tracking-[1.4px] uppercase">{t('confirmLabel')}</label>
            <div
              className={cx(
                'bg-base-100 flex items-center gap-2 rounded-[10px] border px-4 py-2.5 transition',
                isMismatch ? 'border-error' : 'border-base-300 focus-within:border-primary',
              )}
            >
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                className="placeholder:text-3 flex-1 bg-transparent text-sm outline-none"
                placeholder={t('confirmPlaceholder')}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                className="text-3 hover:text-2 transition-colors"
                aria-label={t('toggleAria')}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <IoEyeOff className="size-5" /> : <IoEye className="size-5" />}
              </button>
            </div>
            {isMismatch && <p className="text-error mt-1 text-sm">{t('mismatch')}</p>}
          </div>

          <div className="mt-2 flex items-center justify-between gap-4">
            <span className="text-2 text-xs">{t('hint')}</span>
            <button type="submit" className="btn btn-primary px-6" disabled={!canSubmit}>
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
