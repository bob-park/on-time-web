'use client';

export default function DayOffRequestContent() {
  return (
    <div className="flex size-full flex-col items-center justify-center gap-10">
      {/* card */}
      <div className="card bg-base-100 m-3 flex size-full flex-col items-center justify-center gap-3 p-3 shadow-sm">
        {/* body */}
        <div className="card-body"></div>

        {/* action button */}
        <div className="flex flex-row gap-4">
          <button type="button" className="btn w-36">
            취소
          </button>
          <button type="button" className="btn btn-neutral w-36">
            신청
          </button>
        </div>
      </div>
    </div>
  );
}
