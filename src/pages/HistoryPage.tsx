import { useState, useMemo } from 'react';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Sun, Moon, Syringe, History } from 'lucide-react';
import { useRoutines } from '../hooks/useRoutines';
import { useTreatments } from '../hooks/useTreatments';
import { useProducts } from '../hooks/useProducts';

type ViewMode = 'calendar' | 'list';

export function HistoryPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { routines, loading: routinesLoading } = useRoutines();
  const { treatments, loading: treatmentsLoading } = useTreatments();
  const { products } = useProducts();

  const loading = routinesLoading || treatmentsLoading;

  const getProductName = (id: string) => {
    return products.find((p) => p.id === id)?.product_name || 'Unknown Product';
  };

  const daysInMonth = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const getDayData = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayRoutines = routines.filter((r) => r.date === dateStr);
    const dayTreatments = treatments.filter((t) => t.date === dateStr);
    return { routines: dayRoutines, treatments: dayTreatments };
  };

  const sortedHistory = useMemo(() => {
    const combined = [
      ...routines.map((r) => ({ ...r, type: 'routine' as const })),
      ...treatments.map((t) => ({ ...t, type: 'treatment' as const })),
    ];
    return combined.sort((a, b) => {
      const dateCompare = b.date.localeCompare(a.date);
      if (dateCompare !== 0) return dateCompare;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [routines, treatments]);

  const filteredHistory = selectedDate
    ? sortedHistory.filter((item) => item.date === selectedDate)
    : sortedHistory;

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="glass rounded-3xl p-6 shadow-soft-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
              <History className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="section-header">Log History</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                View your skincare journey
              </p>
            </div>
          </div>
          <div className="flex glass rounded-xl p-1 shadow-soft">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                viewMode === 'list'
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-soft'
                  : 'text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400'
              }`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                viewMode === 'calendar'
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-soft'
                  : 'text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400'
              }`}
            >
              Calendar
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'calendar' && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setCurrentMonth((d) => new Date(d.getFullYear(), d.getMonth() - 1))}
              className="p-2 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-xl text-gray-600 dark:text-gray-400 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="font-bold text-lg text-gray-900 dark:text-white">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <button
              onClick={() => setCurrentMonth((d) => new Date(d.getFullYear(), d.getMonth() + 1))}
              className="p-2 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-xl text-gray-600 dark:text-gray-400 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
              <div key={i} className="text-center text-xs font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: daysInMonth[0].getDay() }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {daysInMonth.map((day) => {
              const { routines: dayRoutines, treatments: dayTreatments } = getDayData(day);
              const hasAM = dayRoutines.some((r) => r.time_of_day === 'AM');
              const hasPM = dayRoutines.some((r) => r.time_of_day === 'PM');
              const hasTreatment = dayTreatments.length > 0;
              const dateStr = format(day, 'yyyy-MM-dd');
              const isSelected = selectedDate === dateStr;

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                  className={`aspect-square p-1 rounded-xl text-sm flex flex-col items-center justify-center gap-0.5 transition-all ${
                    isSelected
                      ? 'bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900/30 dark:to-accent-900/30 ring-2 ring-primary-500 shadow-soft'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  } ${isSameDay(day, new Date()) ? 'font-bold' : ''}`}
                >
                  <span className={isSameDay(day, new Date()) ? 'text-primary-600 dark:text-primary-400 font-bold' : 'text-gray-700 dark:text-gray-300'}>
                    {format(day, 'd')}
                  </span>
                  <div className="flex gap-0.5">
                    {hasAM && <Sun className="w-3 h-3 text-yellow-500" />}
                    {hasPM && <Moon className="w-3 h-3 text-blue-500" />}
                    {hasTreatment && <Syringe className="w-3 h-3 text-accent-500" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {selectedDate && (
        <div className="flex items-center justify-between glass rounded-2xl px-5 py-3 shadow-soft">
          <span className="text-sm font-semibold text-primary-700 dark:text-primary-300">
            Showing: {format(parseISO(selectedDate), 'MMMM d, yyyy')}
          </span>
          <button
            onClick={() => setSelectedDate(null)}
            className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline"
          >
            Clear filter
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="card p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
            <History className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
            {selectedDate ? 'No Entries for This Date' : 'No History Yet'}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {selectedDate ? 'Try selecting a different date.' : 'Start logging your routines and treatments to build your history.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredHistory.map((item) => (
            <div key={item.id} className="card p-5">
              {item.type === 'routine' ? (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      item.time_of_day === 'AM'
                        ? 'bg-yellow-100 dark:bg-yellow-900/30'
                        : 'bg-blue-100 dark:bg-blue-900/30'
                    }`}>
                      {item.time_of_day === 'AM' ? (
                        <Sun className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                      ) : (
                        <Moon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      )}
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {item.time_of_day} Routine
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                      {format(parseISO(item.date), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {item.product_ids.map((id) => (
                      <span
                        key={id}
                        className="text-xs bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 px-3 py-1 rounded-full font-medium"
                      >
                        {getProductName(id)}
                      </span>
                    ))}
                  </div>
                  {item.notes && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                      {item.notes}
                    </p>
                  )}
                  {item.photo_url && (
                    <img
                      src={item.photo_url}
                      alt="Routine"
                      className="mt-3 w-full h-40 object-cover rounded-xl"
                    />
                  )}
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-xl bg-accent-100 dark:bg-accent-900/30 flex items-center justify-center">
                      <Syringe className="w-4 h-4 text-accent-600 dark:text-accent-400" />
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {item.treatment_type}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                      {format(parseISO(item.date), 'MMM d, yyyy')}
                    </span>
                  </div>
                  {item.notes && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                      {item.notes}
                    </p>
                  )}
                  {item.photo_url && (
                    <img
                      src={item.photo_url}
                      alt="Treatment"
                      className="mt-3 w-full h-40 object-cover rounded-xl"
                    />
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
