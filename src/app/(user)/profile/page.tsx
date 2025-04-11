import PersonalInfoContents from './_components/PersonalInfoContents';
import UpdatePasswordContents from './_components/UpdatePasswordContents';
import UpdateUserSignatureContents from './_components/UpdateUserSignatureContents';

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

        {/* update user signature */}
        <div className="w-full">
          <UpdateUserSignatureContents />
        </div>
      </div>
    </div>
  );
}
