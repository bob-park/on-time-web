import PersonalInfoContents from './_components/PersonalInfoContents';
import UpdatePasswordContents from './_components/UpdatePasswordContents';
import UpdateUserSignatureContents from './_components/UpdateUserSignatureContents';

export default function ProfilePage() {
  return (
    <div className="flex size-full flex-col gap-4">
      {/* title */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">프로필</h2>
      </div>

      {/* contents */}
      <div className="flex max-w-[900px] flex-col gap-4">
        <PersonalInfoContents />
        <UpdatePasswordContents />
        <UpdateUserSignatureContents />
      </div>
    </div>
  );
}
