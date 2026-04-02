'use client';

import { useState } from 'react';

import { IoEye, IoEyeOff } from 'react-icons/io5';

import { useUpdateUserPassword } from '@/domain/user/query/user';

import useToast from '@/shared/hooks/useToast';

export default function UpdatePasswordContents() {
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
      push('패스워드가 변경되었습니다. 다음 로그인 시 적용됩니다.', 'success');
      setPassword('');
      setConfirmPassword('');
    },
    () => {
      push('패스워드 변경에 실패했습니다. 다시 시도해 주세요.', 'error');
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
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="mb-5 border-b border-slate-100 pb-3 text-lg font-semibold text-gray-900">패스워드 변경</h3>

      <form onSubmit={handleUpdatePassword}>
        <div className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-500">새 패스워드</label>
            <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
              <input
                type={showPassword ? 'text' : 'password'}
                className="flex-1 bg-transparent text-[15px] text-gray-900 outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="text-slate-400 transition-colors hover:text-slate-600"
                aria-label="패스워드 표시 전환"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <IoEyeOff className="size-5" /> : <IoEye className="size-5" />}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-500">
              패스워드 확인
            </label>
            <div
              className={`flex items-center rounded-lg border bg-slate-50 px-3 py-2.5 ${isMismatch ? 'border-red-300' : 'border-slate-200'}`}
            >
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                className="flex-1 bg-transparent text-[15px] text-gray-900 outline-none"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                className="text-slate-400 transition-colors hover:text-slate-600"
                aria-label="패스워드 표시 전환"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <IoEyeOff className="size-5" /> : <IoEye className="size-5" />}
              </button>
            </div>
            {isMismatch && <p className="mt-1 text-sm text-red-500">패스워드가 일치하지 않습니다</p>}
          </div>

          <div className="mt-2 flex justify-end">
            <button
              type="submit"
              className="rounded-lg bg-slate-800 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={!canSubmit}
            >
              {isLoading ? (
                <>
                  <span className="loading loading-spinner loading-xs" />
                  변경중
                </>
              ) : (
                '변경'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
