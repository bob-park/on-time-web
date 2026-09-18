// 목록 테이블 공통 클래스 + 로딩 스켈레톤
export const thClass = 'text-3 border-base-300 border-b px-4 py-3 text-left text-xs font-semibold';
export const tdClass = 'border-soft border-b px-4 py-3.5';
export const rowClass = 'transition-colors duration-100 last:[&>td]:border-b-0';

export function TableSkeletonRows({ cols, rows = 5 }: { cols: number; rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }, (_, row) => (
        <tr key={row} className="last:[&>td]:border-b-0">
          {Array.from({ length: cols }, (_, col) => (
            <td key={col} className={tdClass}>
              <div className="bg-base-300 h-4 animate-pulse rounded" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
