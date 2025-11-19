import { useState, useMemo } from 'react';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Sun, Moon, Syringe } from 'lucide-react';
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Log History
        </h1>
        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              viewMode === 'list'
                ? 'bg-white dark:bg-gray-600 text-primary-600 shadow-sm'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            List
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              viewMode === 'calendar'
                ? 'bg-white dark:bg-gray-600 text-primary-600 shadow-sm'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            Calendar
          </button>
        </div>
      </div>

      {viewMode === 'calendar' && (
        <div className="card p-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setCurrentMonth((d) => new Date(d.getFullYear(), d.getMonth() - 1))}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="font-semibold text-gray-900 dark:text-white">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <button
              onClick={() => setCurrentMonth((d) => new Date(d.getFullYear(), d.getMonth() + 1))}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
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
                  className={`aspect-square p-1 rounded-lg text-sm flex flex-col items-center justify-center gap-0.5 transition-colors ${
                    isSelected
                      ? 'bg-primary-100 dark:bg-primary-900/30 ring-2 ring-primary-500'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className={isSameDay(day, new Date()) ? 'font-bold text-primary-600' : ''}>
                    {format(day, 'd')}
                  </span>
                  <div className="flex gap-0.5">
                    {hasAM && <Sun className="w-2.5 h-2.5 text-yellow-500" />}
                    {hasPM && <Moon className="w-2.5 h-2.5 text-blue-500" />}
                    {hasTreatment && <Syringe className="w-2.5 h-2.5 text-primary-500" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {selectedDate && (
        <div className="flex items-center justify-between bg-primary-50 dark:bg-primary-900/20 rounded-lg px-4 py-2">
          <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
            Showing: {format(parseISO(selectedDate), 'MMMM d, yyyy')}
          </span>
          <button
            onClick={() => setSelectedDate(null)}
            className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
          >
            Clear filter
          </button>
        </div>
      )}

      {loading ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          Loading history...
        </p>
      ) : filteredHistory.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            {selectedDate ? 'No entries for this date' : 'No history yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredHistory.map((item) => (
            <div key={item.id} className="card p-4">
              {item.type === 'routine' ? (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    {item.time_of_day === 'AM' ? (
                      <Sun className="w-4 h-4 text-yellow-500" />
                    ) : (
                      <Moon className="w-4 h-4 text-blue-500" />
                    )}
                    <span className="font-medium text-gray-900 dark:text-white">
                      {item.time_of_day} Routine
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 ml-auto">
                      {format(parseISO(item.date), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {item.product_ids.map((id) => (
                      <span
                        key={id}
                        className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded"
                      >
                        {getProductName(id)}
                      </span>
                    ))}
                  </div>
                  {item.notes && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      {item.notes}
                    </p>
                  )}
                  {item.photo_url && (
                    <img
                      src={item.photo_url}
                      alt="Routine"
                      className="mt-3 w-full h-32 object-cover rounded-lg"
                    />
                  )}
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <Syringe className="w-4 h-4 text-primary-500" />
                    <span className="font-medium text-gray-900 dark:text-white">
                      {item.treatment_type}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 ml-auto">
                      {format(parseISO(item.date), 'MMM d, yyyy')}
                    </span>
                  </div>
                  {item.notes && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {item.notes}
                    </p>
                  )}
                  {item.photo_url && (
                    <img
                      src={item.photo_url}
                      alt="Treatment"
                      className="mt-3 w-full h-32 object-cover rounded-lg"
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
