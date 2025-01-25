import QRContents from './_components/QRContents';

export default function QRPage() {
  return (
    <div className="flex size-full flex-col gap-3">
      {/* title */}
      <div className="">
        <h2 className="text-2xl font-bold">QR 코드 생성</h2>
      </div>

      {/* contents */}
      <div className="mt-10 w-full">
        <QRContents />
      </div>
    </div>
  );
}
