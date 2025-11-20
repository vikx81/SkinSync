import { useMemo } from 'react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isWithinInterval, parseISO } from 'date-fns';
import { BarChart3, TrendingUp, Calendar, Sparkles, CheckCircle2, Target, Package, Droplet } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { useRoutines } from '../hooks/useRoutines';
import { useTreatments } from '../hooks/useTreatments';
import { useSettingsStore } from '../store/settingsStore';
import type { SkinProfile } from '../types/skinGoals';

export function DashboardPage() {
  const { products } = useProducts();
  const { routines } = useRoutines();
  const { treatments } = useTreatments();
  const { settings } = useSettingsStore();

  const skinProfile: SkinProfile | null = useMemo(() => {
    if (!settings?.skin_profile) return null;
    try {
      return JSON.parse(settings.skin_profile);
    } catch {
      return null;
    }
  }, [settings?.skin_profile]);

  // Calculate weekly stats
  const weeklyStats = useMemo(() => {
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
    const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

    const routinesThisWeek = routines.filter((r) => {
      const routineDate = parseISO(r.date);
      return isWithinInterval(routineDate, { start: weekStart, end: weekEnd });
    });

    const daysWithRoutines = new Set(routinesThisWeek.map((r) => r.date)).size;
    const adherenceRate = Math.round((daysWithRoutines / 7) * 100);

    // Count AM/PM completion
    const amRoutines = routinesThisWeek.filter((r) => r.time_of_day === 'AM').length;
    const pmRoutines = routinesThisWeek.filter((r) => r.time_of_day === 'PM').length;

    return {
      totalRoutines: routinesThisWeek.length,
      daysWithRoutines,
      adherenceRate,
      amRoutines,
      pmRoutines,
      daysInWeek: daysInWeek.length,
    };
  }, [routines]);

  // Calculate monthly stats
  const monthlyStats = useMemo(() => {
    const today = new Date();
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);

    const routinesThisMonth = routines.filter((r) => {
      const routineDate = parseISO(r.date);
      return isWithinInterval(routineDate, { start: monthStart, end: monthEnd });
    });

    const treatmentsThisMonth = treatments.filter((t) => {
      const treatmentDate = parseISO(t.date);
      return isWithinInterval(treatmentDate, { start: monthStart, end: monthEnd });
    });

    return {
      totalRoutines: routinesThisMonth.length,
      totalTreatments: treatmentsThisMonth.length,
    };
  }, [routines, treatments]);

  // Calculate product usage frequency
  const productUsage = useMemo(() => {
    const usageMap = new Map<string, number>();

    routines.forEach((routine) => {
      routine.product_ids.forEach((productId) => {
        usageMap.set(productId, (usageMap.get(productId) || 0) + 1);
      });
    });

    const topProducts = Array.from(usageMap.entries())
      .map(([productId, count]) => {
        const product = products.find((p) => p.id === productId);
        return product ? { product, count } : null;
      })
      .filter((item): item is { product: typeof products[0]; count: number } => item !== null)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return topProducts;
  }, [routines, products]);

  // Calculate streak
  const currentStreak = useMemo(() => {
    const today = new Date();
    let streak = 0;
    let currentDate = today;

    while (true) {
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      const hasRoutine = routines.some((r) => r.date === dateStr);

      if (!hasRoutine) break;

      streak++;
      currentDate = new Date(currentDate);
      currentDate.setDate(currentDate.getDate() - 1);
    }

    return streak;
  }, [routines]);

  const activeProducts = products.filter((p) => p.status === 'active');

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="glass rounded-3xl p-6 shadow-soft-lg">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="section-header">Dashboard</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Your skincare journey at a glance
            </p>
          </div>
        </div>
      </div>

      {/* Skin Profile Summary */}
      {skinProfile && (
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-5 h-5 text-primary-600" />
            <h2 className="font-bold text-lg text-gray-900 dark:text-white">
              Your Skin Profile
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 rounded-xl">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Skin Type</p>
              <p className="font-semibold text-gray-900 dark:text-white capitalize">
                {skinProfile.skinType}
              </p>
            </div>
            <div className="p-4 bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 rounded-xl">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Goals</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {skinProfile.goals.length} Active
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {currentStreak}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Day Streak</p>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {weeklyStats.adherenceRate}%
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Weekly Adherence</p>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {monthlyStats.totalRoutines}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Routines This Month</p>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
              <Package className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {activeProducts.length}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Active Products</p>
        </div>
      </div>

      {/* Weekly Overview */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="w-5 h-5 text-primary-600" />
          <h2 className="font-bold text-lg text-gray-900 dark:text-white">
            This Week
          </h2>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Routine Completion
              </span>
              <span className="text-sm font-semibold text-primary-600">
                {weeklyStats.daysWithRoutines}/{weeklyStats.daysInWeek} days
              </span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-500"
                style={{ width: `${weeklyStats.adherenceRate}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
              <p className="text-xs text-yellow-700 dark:text-yellow-300 mb-1">AM Routines</p>
              <p className="text-xl font-bold text-yellow-900 dark:text-yellow-100">
                {weeklyStats.amRoutines}
              </p>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <p className="text-xs text-blue-700 dark:text-blue-300 mb-1">PM Routines</p>
              <p className="text-xl font-bold text-blue-900 dark:text-blue-100">
                {weeklyStats.pmRoutines}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Products */}
      {productUsage.length > 0 && (
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <Droplet className="w-5 h-5 text-primary-600" />
            <h2 className="font-bold text-lg text-gray-900 dark:text-white">
              Most Used Products
            </h2>
          </div>

          <div className="space-y-3">
            {productUsage.map(({ product, count }, index) => (
              <div
                key={product.id}
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl"
              >
                <span className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-sm font-bold text-primary-700 dark:text-primary-300">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                    {product.product_name}
                  </p>
                  <p className="text-xs text-gray-500">{product.brand}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-primary-600">{count}</p>
                  <p className="text-xs text-gray-500">uses</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Treatments */}
      {monthlyStats.totalTreatments > 0 && (
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-5 h-5 text-primary-600" />
            <h2 className="font-bold text-lg text-gray-900 dark:text-white">
              This Month
            </h2>
          </div>

          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-accent-50 to-primary-50 dark:from-accent-900/20 dark:to-primary-900/20 rounded-xl">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                Professional Treatments
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {monthlyStats.totalTreatments}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-accent-600" />
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {routines.length === 0 && (
        <div className="card p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
            Start Tracking Your Journey
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Log your first routine to see your personalized insights and statistics.
          </p>
        </div>
      )}
    </div>
  );
}
