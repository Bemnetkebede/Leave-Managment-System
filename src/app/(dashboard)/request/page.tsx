'use client';

import { useState, useEffect } from 'react';
import { ArrowLeftRight, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { getWorkingDaysFromDB } from '@/lib/services/leave.service';
import { createClient } from '@/lib/supabase/client';
import { useLeaveBalance, useLeaveRequests } from '@/hooks/queries/leaveQueries';
import { useRouter } from 'next/navigation';

// Dynamic Interactive Calendar Component
function InteractiveCalendar({
  fromDate,
  toDate
}: {
  fromDate: string;
  toDate: string;
}) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const daysHeader = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => setCurrentDate(new Date());

  // Determine if a day is in range
  const isDateInRange = (day: number) => {
    if (!fromDate) return false;

    // Note: We need to properly parse dates respecting local time if possible
    // We'll use simple setHours to zero out time for comparison.
    const currentDayDate = new Date(year, month, day);
    currentDayDate.setHours(0, 0, 0, 0);

    // fromDate string is 'YYYY-MM-DD'
    // using new Date(str + 'T00:00:00') forces local timezone
    const fromDateObj = new Date(fromDate + 'T00:00:00');
    fromDateObj.setHours(0, 0, 0, 0);

    if (toDate) {
      const toDateObj = new Date(toDate + 'T00:00:00');
      toDateObj.setHours(0, 0, 0, 0);
      return currentDayDate >= fromDateObj && currentDayDate <= toDateObj;
    }

    return currentDayDate.getTime() === fromDateObj.getTime();
  };

  return (
    <div className="w-full h-full bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <button type="button" onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ChevronLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div className="flex flex-col items-center cursor-pointer" onClick={goToday}>
          <h2 className="text-xl font-black text-slate-800">
            {currentDate.toLocaleString('default', { month: 'long' })}
          </h2>
          <span className="text-xs font-bold text-slate-400">{year}</span>
        </div>
        <button type="button" onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ChevronRight className="w-5 h-5 text-slate-600" />
        </button>
      </div>

      {/* Days Header */}
      <div className="grid grid-cols-7 mb-4 text-center">
        {daysHeader.map(day => (
          <span key={day} className={`text-xs font-bold uppercase tracking-wider ${day === 'Sun' || day === 'Sat' ? 'text-rose-500' : 'text-slate-400'}`}>
            {day}
          </span>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-y-3 gap-x-1 text-center">
        {blanks.map(blank => (
          <div key={`blank-${blank}`} className="p-2"></div>
        ))}
        {days.map(day => {
          const dayDate = new Date(year, month, day);
          dayDate.setHours(0, 0, 0, 0);
          
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const isPast = dayDate < today;
          const isWeekend = dayDate.getDay() === 0 || dayDate.getDay() === 6;
          const selected = isDateInRange(day);
          const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

          return (
            <div key={day} className="flex items-center justify-center">
              <span className={`w-10 h-10 flex items-center justify-center rounded-full text-sm transition-all duration-300 ${
                  selected
                    ? 'bg-[#0D1A2C] text-white shadow-md font-bold scale-110'
                    : isPast
                      ? 'text-slate-200 cursor-not-allowed'
                      : isWeekend
                        ? 'text-rose-500 bg-rose-50/50 font-bold'
                        : isToday
                          ? 'text-indigo-600 bg-indigo-50 font-bold border border-indigo-200'
                          : 'text-slate-700 hover:bg-slate-100 font-medium cursor-default'
                }`}>
                {day}
              </span>
            </div>
          )
        })}
      </div>

      <div className="mt-auto pt-6 border-t border-slate-100 flex items-center gap-4 text-xs font-medium text-slate-500">
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-rose-100"></div> Weekend / Holiday</div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-[#0D1A2C] shadow-sm"></div> Selected Leave</div>
      </div>
    </div>
  )
}

export default function RequestPage() {
  const [isMultipleDays, setIsMultipleDays] = useState(true);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [category, setCategory] = useState('');
  const [reason, setReason] = useState('');
  const [workingDays, setWorkingDays] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const router = useRouter();
  const supabase = createClient();
  const { data: balances, isLoading: isBalancesLoading } = useLeaveBalance();
  const { data: allRequests } = useLeaveRequests();

  const firstBalance = balances?.[0] as any;
  const total = firstBalance?.total_days ?? 21;
  const availableBalance = firstBalance?.Balance ?? firstBalance?.balance ?? total;

  const hasNoBalance = !isBalancesLoading && availableBalance <= 0;
  const isOverBalance = !isBalancesLoading && workingDays > availableBalance;

  // Make sure to reset secondary date if toggling
  useEffect(() => {
    if (!isMultipleDays) setToDate('');
  }, [isMultipleDays]);

  useEffect(() => {
    if (fromDate) {
      try {
        const start = fromDate;
        const end = isMultipleDays ? (toDate || fromDate) : fromDate;

        // Parse dates timezone-safely
        const [sY, sM, sD] = start.split('-').map(Number);
        const [eY, eM, eD] = end.split('-').map(Number);
        const startDate = new Date(sY, sM - 1, sD, 0, 0, 0);
        const endDate = new Date(eY, eM - 1, eD, 0, 0, 0);

        if (endDate >= startDate) {
          let count = 0;
          const curDate = new Date(startDate);

          while (curDate <= endDate) {
            const dayOfWeek = curDate.getDay();
            // Skip weekends (0 = Sunday, 6 = Saturday)
            if (dayOfWeek !== 0 && dayOfWeek !== 6) {
              count++;
            }
            curDate.setDate(curDate.getDate() + 1);
          }
          setWorkingDays(count);
        } else {
          setWorkingDays(0);
        }
      } catch (err) {
        console.error("Error calculating working days:", err);
        setWorkingDays(0);
      }
    } else {
      setWorkingDays(0);
    }
  }, [fromDate, toDate, isMultipleDays]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    // Pre-submit validation: Past Dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedStart = new Date(fromDate + 'T00:00:00');
    if (selectedStart < today) {
      setError('Cannot request leave for past dates.');
      setSubmitting(false);
      return;
    }

    // 1. Client-side overlap check from cache
    const overlapping = allRequests?.some(req => {
      if (req.status === 'rejected') return false;
      const start = new Date(req.start_date);
      const end = new Date(req.end_date);
      const newStart = new Date(fromDate);
      const newEnd = isMultipleDays && toDate ? new Date(toDate) : newStart;
      
      // Range intersection logic
      return newStart <= end && newEnd >= start;
    });

    if (overlapping) {
      setError('You already have a pending or approved request for these dates.');
      setSubmitting(false);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not logged in');

      const payload: any = {
        user_id: user.id,
        leave_type: category,
        start_date: fromDate,
        end_date: isMultipleDays && toDate ? toDate : fromDate, // Strictly enforce same-day for single day mode
        reason: reason,
        status: 'pending'
      };

      const { error: submitError } = await (supabase.from('leave_requests') as any).insert(payload);

      if (submitError) throw submitError;

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to submit request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full pb-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight text-slate-900 mb-2">New Leave Request</h1>
        {/* <p className="text-slate-500 font-medium">Fill out the details below to submit a new leave request.</p> */}
      </div>

      <div className="flex flex-col lg:flex-row gap-4 items-stretch">
        {/* Left Side: Real Visual Calendar */}
        <div className="w-full lg:w-5/12 flex-shrink-0 flex">
          <InteractiveCalendar fromDate={fromDate} toDate={isMultipleDays ? toDate : fromDate} />
        </div>

        {/* Right Side: Request Form (Light Theme) */}
        <div className="w-full lg:w-7/12 bg-white rounded-[2.5rem] p-6 sm:p-10 border border-slate-200 shadow-xl flex flex-col">
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col">

            {/* Type Toggle - Using #0D1A2C for active instead of teal */}
            <div className="flex bg-slate-100 rounded-full p-1.5 mb-10 shadow-inner">
              <button
                type="button"
                onClick={() => setIsMultipleDays(true)}
                className={`flex-1 py-3 px-6 rounded-full text-sm font-bold transition-all duration-300 ${isMultipleDays
                    ? 'bg-[#0D1A2C] text-white shadow-md transform scale-[1.02]'
                    : 'text-slate-500 hover:text-slate-700'
                  }`}
              >
                Multiple Days
              </button>
              <button
                type="button"
                onClick={() => setIsMultipleDays(false)}
                className={`flex-1 py-3 px-6 rounded-full text-sm font-bold transition-all duration-300 ${!isMultipleDays
                    ? 'bg-[#0D1A2C] text-white shadow-md transform scale-[1.02]'
                    : 'text-slate-500 hover:text-slate-700'
                  }`}
              >
                One Day
              </button>
            </div>

            {/* Date Inputs */}
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
              <div className="w-full sm:flex-1">
                <label className="block text-sm font-bold text-slate-700 mb-2 pl-2">From date</label>
                <label className="block relative cursor-pointer group">
                  <input
                    type="date"
                    value={fromDate}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#0D1A2C] rounded-full px-6 py-4 text-slate-900 font-medium text-base focus:outline-none transition-all shadow-sm focus:bg-white focus:ring-4 focus:ring-[#0D1A2C]/10"
                  />
                </label>
              </div>

              {isMultipleDays && (
                <>
                  <div className="flex-shrink-0 mt-0 sm:mt-8 rotate-90 sm:rotate-0">
                    <div className="w-12 h-12 flex items-center justify-center rounded-full border border-slate-200 bg-slate-50 shadow-sm text-slate-400">
                      <ArrowLeftRight className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="w-full sm:flex-1">
                    <label className="block text-sm font-bold text-slate-700 mb-2 pl-2">To date</label>
                    <label className="block relative cursor-pointer group">
                      <input
                        type="date"
                        value={toDate}
                        required
                        min={fromDate || new Date().toISOString().split('T')[0]}
                        onChange={(e) => setToDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-[#0D1A2C] rounded-full px-6 py-4 text-slate-900 font-medium text-base focus:outline-none transition-all shadow-sm focus:bg-white focus:ring-4 focus:ring-[#0D1A2C]/10"
                      />
                    </label>
                  </div>
                </>
              )}
            </div>

            {/* Leave Category */}
            <div className="mb-8">
              <label className="block text-sm font-bold text-slate-700 mb-2 pl-2">Leave Category</label>
              <div className="relative group">
                <select
                  value={category}
                  required
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#0D1A2C] rounded-3xl px-6 py-4 text-slate-900 font-medium text-base appearance-none focus:outline-none transition-all shadow-sm focus:bg-white focus:ring-4 focus:ring-[#0D1A2C]/10 cursor-pointer"
                >
                  <option value="" disabled className="text-slate-400">Select leave category...</option>
                  <option value="Annual">Annual Leave</option>
                  <option value="Sick">Sick Leave</option>
                  <option value="Maternity">Maternity Leave</option>
                  <option value="Paternity">Paternity Leave</option>
                  <option value="Court Case">Court Case</option>
                  <option value="Exam">Exam</option>
                  <option value="Unpaid">Unpaid Leave</option>
                  <option value="Other">Other</option>
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within:text-[#0D1A2C] transition-colors">
                  <ChevronDown className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Reason / Notes */}
            <div className="mb-8">
              <label className="block text-sm font-bold text-slate-700 mb-2 pl-2">Reason / Notes</label>
              <textarea
                value={reason}
                required
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-[#0D1A2C] rounded-3xl px-6 py-5 text-slate-900 font-medium text-base focus:outline-none transition-all shadow-sm focus:bg-white focus:ring-4 focus:ring-[#0D1A2C]/10 min-h-[140px] resize-none"
                placeholder="Enter the reason for your leave request..."
              ></textarea>
            </div>

            {/* Calculated Result */}
            {workingDays > 0 && (
              <div className="mb-10 bg-indigo-50 border border-indigo-100/50 rounded-2xl p-5 text-indigo-700 flex items-center justify-center font-bold animate-in fade-in zoom-in duration-300 shadow-sm">
                You are requesting <strong className="mx-2 text-xl">{workingDays}</strong> working {workingDays === 1 ? 'day' : 'days'} of leave.
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-4 bg-red-50 border border-red-100 rounded-2xl p-4 text-red-600 text-sm font-bold flex items-center justify-center">
                {error}
              </div>
            )}

            {hasNoBalance && (
              <div className="mb-8 bg-amber-50 border border-amber-100 rounded-2xl p-4 text-amber-700 text-sm font-bold flex items-center justify-center text-center">
                You have no remaining leave balance for this year. You cannot submit new requests.
              </div>
            )}

            {!hasNoBalance && isOverBalance && workingDays > 0 && (
              <div className="mb-8 bg-rose-50 border border-rose-100 rounded-2xl p-4 text-rose-600 text-sm font-bold flex items-center justify-center text-center">
                Insufficient balance. You only have {availableBalance} days remaining.
              </div>
            )}

            {/* Submit Button */}
            <div className="mt-auto pt-4">
              <button
                type="submit"
                disabled={submitting || workingDays === 0 || !category || !reason || hasNoBalance || isOverBalance}
                className="w-full bg-[#0D1A2C] hover:bg-[#152744] text-white rounded-full py-5 text-lg font-black transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98] shadow-xl hover:shadow-[#0D1A2C]/20 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting Request...
                  </>
                ) : 'Submit Request'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
