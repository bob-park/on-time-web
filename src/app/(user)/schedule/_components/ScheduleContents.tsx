'use client';

import { padStart } from 'lodash';

function padWorkingTime(value: number): string {
  return padStart(value + '', 2, '0');
}

const WorkingTimeHeaders = () => {
  return (
    <div className="flex flex-row items-center justify-center">
      <div className="flex flex-col items-center justify-center">
        <div className="">
          <span>AM</span>
        </div>
        <div className="flex flex-row gap-1">
          {new Array(12).fill(' ').map((item, index) => (
            <div key={`schedule-working-time-am-${index}`} className="w-8 text-center">
              <span>{padWorkingTime(index === 0 ? 12 : index)}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="justify-cente flex flex-col items-center">
        <div className="">
          <span>PM</span>
        </div>
        <div className="flex flex-row gap-1">
          {new Array(12).fill(' ').map((item, index) => (
            <div key={`schedule-working-time-am-${index}`} className="w-8 text-center">
              <span>{padWorkingTime(index === 0 ? 12 : index)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function ScheduleContents() {
  return (
    <div className="flex flex-col items-center justify-center">
      {/* headers */}
      <div className="flex flex-row">
        {/* working dates */}
        <div className="w-32 flex-none"></div>

        {/* working times */}
        <div className="">
          <WorkingTimeHeaders />
        </div>
      </div>
    </div>
  );
}
