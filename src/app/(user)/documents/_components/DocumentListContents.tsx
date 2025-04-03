'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { useDocuments } from '@/domain/document/query/documents';

import _ from 'lodash';

interface DocumentListContentsProps {
  params: SearchDocumentRequest;
}

export default function DocumentListContents({ params }: DocumentListContentsProps) {
  // hooks
  const router = useRouter();

  // state
  const [searchParams, setSearchParams] = useState<SearchDocumentRequest>(() => params);

  // query
  const { page, isLoading } = useDocuments(params);

  // useEffect
  useEffect(() => {
    handleSubmit();
  }, [searchParams]);

  // handle
  const handleSubmit = () => {
    const urlSearchParams = new URLSearchParams();

    _.entries(searchParams).forEach(([key, value]) => {
      urlSearchParams.set(key, value !== undefined ? String(value) : '');
    });

    router.push(`/documents?${urlSearchParams}`);
  };

  return (
    <div className="flex size-full flex-col gap-3">
      {/* search form */}
      <div className="w-full max-w-[800px]">
        <div className="card bg-base-100 m-3 flex size-full flex-col items-center justify-center gap-10 p-3 shadow-sm">
          {/* body */}
          <div className="card-body w-full">
            {/* type */}
            <div className="flex flex-row items-center gap-3">
              <span className="w-32 flex-none text-right text-base font-semibold">구분 :</span>
              <div className="">
                <form className="filter">
                  <input
                    className="btn btn-square"
                    type="reset"
                    value="×"
                    onClick={() => setSearchParams({ ...searchParams, page: 0, type: undefined })}
                  />
                  <input
                    className="btn"
                    type="radio"
                    name="vacationTypes"
                    aria-label="휴가계"
                    defaultChecked={searchParams.type === 'VACATION'}
                    onClick={() => setSearchParams({ ...searchParams, page: 0, type: 'VACATION' })}
                  />
                  <input
                    className="btn"
                    type="radio"
                    name="vacationTypes"
                    aria-label="휴일 근무 보고서"
                    defaultChecked={searchParams.type === 'OVERTIME_WORK'}
                    onClick={() => setSearchParams({ ...searchParams, page: 0, type: 'OVERTIME_WORK' })}
                  />
                </form>
              </div>
            </div>

            {/* status */}
            <div className="flex flex-row items-center gap-3">
              <span className="w-32 flex-none text-right text-base font-semibold">상태 :</span>
              <div className="">
                <form className="filter">
                  <input
                    className="btn btn-square"
                    type="reset"
                    value="×"
                    onClick={() => setSearchParams({ ...searchParams, page: 0, status: undefined })}
                  />
                  <input
                    className="btn"
                    type="radio"
                    name="vacationTypes"
                    aria-label="진행"
                    defaultChecked={searchParams.status === 'WAITING'}
                    onClick={() => setSearchParams({ ...searchParams, page: 0, status: 'WAITING' })}
                  />
                  <input
                    className="btn"
                    type="radio"
                    name="vacationTypes"
                    aria-label="승인"
                    defaultChecked={searchParams.status === 'APPROVED'}
                    onClick={() => setSearchParams({ ...searchParams, page: 0, status: 'APPROVED' })}
                  />
                  <input
                    className="btn"
                    type="radio"
                    name="vacationTypes"
                    aria-label="반려"
                    defaultChecked={searchParams.status === 'REJECTED'}
                    onClick={() => setSearchParams({ ...searchParams, page: 0, status: 'REJECTED' })}
                  />
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* result */}
      <div className="h-[calc(100vh-420px)] min-h-[500px] w-full max-w-[800px]">
        <div className="card bg-base-100 m-3 flex size-full flex-col items-center justify-center gap-10 p-3 shadow-sm">
          {/* body */}
          <div className="card-body size-full-full overflow-auto">
            <div className="flex size-full flex-col items-center justify-center gap-3"></div>
          </div>

          {/* action button */}
          <div className="my-5 flex flex-row gap-4">
            <div className="join">
              <button
                className="join-item btn"
                disabled={!page || Math.ceil(page.total / page.pageable.pageSize) > searchParams.page + 1}
                onClick={() => setSearchParams({ ...searchParams, page: searchParams.page - 1 })}
              >
                «
              </button>
              <button className="join-item btn">
                <span>Page</span>
                <span>{searchParams.page + 1}</span>
              </button>
              <button
                className="join-item btn"
                disabled={!page || Math.ceil(page.total / page.pageable.pageSize) <= searchParams.page + 1}
                onClick={() => setSearchParams({ ...searchParams, page: searchParams.page + 1 })}
              >
                »
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
