import ChatUserContents from './_components/ChatUsersContents';

export default function ChatUsersPage() {
  return (
    <div className="flex size-full flex-col gap-3">
      {/* title */}
      <div className="">
        <h2 className="text-2xl font-bold">임직원들과의 소통</h2>
      </div>

      {/* contents */}
      <div className="mt-10 max-w-max">
        <ChatUserContents />
      </div>
    </div>
  );
}
