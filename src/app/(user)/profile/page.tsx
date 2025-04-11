import UpdatePasswordContents from '@/app/(user)/profile/_components/UpdatePasswordContents';

import PersonalInfoContents from './_components/PersonalInfoContents';

export default function ProfilePage() {
  return (
    <div className="flex size-full flex-col gap-3">
      {/* title */}
      <div className="">
        <h2 className="text-2xl font-bold">프로필</h2>
      </div>

      {/* contents */}
      <div className="flex max-w-[900px] flex-col items-center justify-center gap-3 p-10">
        {/* personal info  */}
        <div className="w-full">
          <PersonalInfoContents />
        </div>

        {/* update password */}
        <div className="w-full">
          <UpdatePasswordContents />
        </div>

        {/* update avatar contents */}
        <div className="w-full"></div>
      </div>
    </div>
  );
}
