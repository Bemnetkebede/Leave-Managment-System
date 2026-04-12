import { Calendar } from "lucide-react";

export interface Holiday {
  id: string;
  name: string;
  date: string;
}

export function UpcomingHolidays({ holidays }: { holidays: Holiday[] }) {
  if (!holidays || holidays.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center h-full min-h-[300px]">
        <div className="bg-slate-50 p-4 rounded-full mb-4">
          <Calendar className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="font-semibold text-slate-800">No Upcoming Holidays</h3>
        <p className="text-sm text-slate-500 mt-1 max-w-[200px]">No holidays are currently scheduled.</p>
      </div>
    );
  }

  // Helper to format date without date-fns to avoid dependency issues just for this
  const formatMonth = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('default', { month: 'short' }).toUpperCase();
  };
  
  const formatDateIndex = (dateStr: string) => {
    return new Date(dateStr).getDate().toString().padStart(2, '0');
  };
  
  const formatDayName = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('default', { weekday: 'long' });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden h-full flex flex-col">
      <div className="px-8 py-4 border-b border-slate-100/80 bg-slate-50/30">
        <div className="flex items-center gap-2">
          <div className=" bg-indigo-50 rounded-md">
            <Calendar className="h-5 w-5 text-indigo-600" />
          </div>
          <h3 className="font-bold text-slate-800">Upcoming Holidays</h3>
        </div>
      </div>
      <div className="p-2 flex-1 overflow-y-auto">
        {holidays.map((holiday) => (
          <div key={holiday.id} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-xl transition-colors group">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-indigo-50/80 text-indigo-700 flex flex-col items-center justify-center font-bold relative overflow-hidden group-hover:bg-indigo-100 transition-colors">
                <span className="text-[10px] tracking-wider font-semibold uppercase opacity-80">{formatMonth(holiday.date)}</span>
                <span className="text-lg leading-tight">{formatDateIndex(holiday.date)}</span>
                <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500" />
              </div>
              <div>
                <span className="font-semibold text-slate-800 block">{holiday.name}</span>
                <span className="text-xs text-slate-500 mt-0.5 block">
                  {formatDayName(holiday.date)}
                </span>
              </div>
            </div>
            <div className="h-8 w-8 rounded-full border border-slate-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
               <Calendar className="h-3.5 w-3.5 text-slate-400" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
