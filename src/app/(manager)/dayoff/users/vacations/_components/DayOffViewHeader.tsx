export default function DayOffViewHeader() {
  return (
    <div className="relative flex h-12 w-max flex-row items-center gap-2 border-b border-gray-300 font-semibold select-none">
      <div className="sticky left-0 z-10 flex flex-row items-center gap-2 bg-white/90 backdrop-blur-xl">
        <div className="w-12 flex-none text-center">순번</div>
        <div className="w-20 flex-none text-center">성명</div>
      </div>
      <div className="w-28 flex-none text-center">입사일</div>
      <div className="w-24 flex-none text-center">발생연차</div>
      <div className="w-24 flex-none text-center">전년차감</div>
      <div className="w-24 flex-none text-center">사용가능일수</div>
      {/* months */}
      {new Array(12).fill('0').map((_, index) => (
        <div key={`month-item-${index}`} className="w-16 flex-none text-center">
          {index + 1}월
        </div>
      ))}
      {/* total */}
      <div className="w-24 flex-none text-center">합계</div>
      <div className="w-24 flex-none text-center">잔여일수</div>
    </div>
  );
}
