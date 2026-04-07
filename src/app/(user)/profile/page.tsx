import PersonalInfoContents from './_components/PersonalInfoContents';
import UpdatePasswordContents from './_components/UpdatePasswordContents';
import UpdateUserSignatureContents from './_components/UpdateUserSignatureContents';

export default function ProfilePage() {
  return (
    <div className="flex size-full flex-col gap-4">
      {/* title */}
      <div>
        <p className="text-xs font-semibold tracking-widest text-slate-400 uppercase">Profile</p>
        <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">프로필</h2>
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
