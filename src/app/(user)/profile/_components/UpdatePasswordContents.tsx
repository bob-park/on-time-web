'use client';

import { useState } from 'react';

import { IoEye, IoEyeOff } from 'react-icons/io5';
import { TbArrowsExchange } from 'react-icons/tb';

import { useUpdateUserPassword } from '@/domain/user/query/user';

import useToast from '@/shared/hooks/useToast';

export default function UpdatePasswordContents() {
  // state
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');

  // hooks
  const { push } = useToast();

  // query
  const { updatePassword, isLoading } = useUpdateUserPassword(
    () => {
      push('패스워드가 변경되었습니다. 다음 로그인 시 적용됩니다.', 'success');
      setPassword('');
    },
    () => {
      push('먼가 많은 문제가 있는디?', 'error');
    },
  );

  // handle
  const handleUpdatePassword = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!password) {
      return;
    }

    updatePassword({ updatePassword: password });
  };

  return (
    <div className="bg-base-200 flex flex-row items-center justify-center gap-5 rounded-xl px-5 py-2">
      <div className="flex-1">
        <div className="flex flex-col gap-3 text-lg">
          <form className="" onSubmit={handleUpdatePassword}>
            <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-full border p-4">
              <legend className="fieldset-legend text-base">패스워드 변경</legend>

              <label className="fieldset-label">패스워드</label>

              <div className="join">
                <label className="input join-item w-full">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="grow"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <div className="cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <IoEyeOff className="size-6" /> : <IoEye className="size-6" />}
                  </div>
                </label>
                <button type="submit" className="btn btn-neutral join-item w-24" disabled={isLoading || !password}>
                  {isLoading ? (
                    <>
                      <span className="loading loading-spinner loading-xs" />
                      변경중
                    </>
                  ) : (
                    <>
                      <TbArrowsExchange className="size-6" />
                      변경
                    </>
                  )}
                </button>
              </div>
            </fieldset>
          </form>
        </div>
      </div>
    </div>
  );
}
