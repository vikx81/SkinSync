import type { Product, TimeOfDay, Treatment } from '../types/database';
import type { SkinProfile } from '../types/skinGoals';
import { parseISO, isWithinInterval, addDays } from 'date-fns';

export interface RecommendedRoutine {
  timeOfDay: TimeOfDay;
  products: Product[];
  reasoning: string;
  warnings: string[];
  tips: string[];
}

export interface DailyRecommendation {
  date: string;
  am: RecommendedRoutine;
  pm: RecommendedRoutine;
}

/**
 * AI-powered recommendation engine that suggests optimal routines
 * based on skin profile, available products, and treatments
 */
export class RoutineRecommendationEngine {
  private products: Product[];
  private skinProfile: SkinProfile | null;
  private treatments: Treatment[];

  constructor(products: Product[], skinProfile: SkinProfile | null, treatments: Treatment[]) {
    this.products = products.filter((p) => p.status === 'active');
    this.skinProfile = skinProfile;
    this.treatments = treatments;
  }

  /**
   * Generate a full daily recommendation (AM + PM)
   */
  generateDailyRecommendation(date: Date = new Date()): DailyRecommendation {
    return {
      date: date.toISOString().split('T')[0],
      am: this.generateRoutineRecommendation('AM', date),
      pm: this.generateRoutineRecommendation('PM', date),
    };
  }

  /**
   * Generate a routine recommendation for a specific time of day
   */
  private generateRoutineRecommendation(timeOfDay: TimeOfDay, date: Date): RecommendedRoutine {
    const warnings: string[] = [];
    const tips: string[] = [];
    const selectedProducts: Product[] = [];

    // Check for treatment restrictions
    const retinolBlocked = this.isRetinolBlocked(date);
    if (retinolBlocked.blocked) {
      warnings.push(retinolBlocked.message);
    }

    // 1. Cleanser (both AM and PM)
    const cleanser = this.selectProduct('cleanser');
    if (cleanser) selectedProducts.push(cleanser);

    if (timeOfDay === 'AM') {
      // Morning routine
      // 2. Toner (optional)
      const toner = this.selectProduct('toner');
      if (toner) selectedProducts.push(toner);

      // 3. Serum (vitamin C for brightening/antioxidants)
      const serum = this.selectBestSerum('AM');
      if (serum) {
        selectedProducts.push(serum);
        if (serum.product_name.toLowerCase().includes('vitamin c')) {
          tips.push('Apply Vitamin C in the morning for antioxidant protection');
        }
      }

      // 4. Eye cream
      const eyeCream = this.selectProduct('eye-cream');
      if (eyeCream) selectedProducts.push(eyeCream);

      // 5. Moisturizer
      const moisturizer = this.selectProduct('moisturizer');
      if (moisturizer) selectedProducts.push(moisturizer);

      // 6. Sunscreen (ESSENTIAL for AM)
      const sunscreen = this.selectProduct('sunscreen');
      if (sunscreen) {
        selectedProducts.push(sunscreen);
        tips.push('Sunscreen is essential - apply as the last step');
      } else {
        warnings.push('⚠️ No sunscreen found! Add one to your products for complete protection');
      }

    } else {
      // Evening routine
      // 2. Toner
      const toner = this.selectProduct('toner');
      if (toner) selectedProducts.push(toner);

      // 3. Treatment/Serum
      const treatment = this.selectBestTreatment(retinolBlocked.blocked);
      if (treatment) {
        selectedProducts.push(treatment);
        if (treatment.is_retinol) {
          tips.push('Use retinol only at night - it makes skin sun-sensitive');
          tips.push('Start with 2-3 times per week if you\'re new to retinol');
        }
      }

      // 4. Serum
      const serum = this.selectBestSerum('PM');
      if (serum) selectedProducts.push(serum);

      // 5. Eye cream
      const eyeCream = this.selectProduct('eye-cream');
      if (eyeCream) selectedProducts.push(eyeCream);

      // 6. Moisturizer
      const moisturizer = this.selectProduct('moisturizer');
      if (moisturizer) {
        selectedProducts.push(moisturizer);
        if (this.skinProfile?.skinType === 'dry') {
          tips.push('For dry skin, consider applying moisturizer while skin is still damp');
        }
      }

      // 7. Night treatment (if available and different from earlier treatments)
      const nightTreatment = this.selectProduct('treatment');
      if (nightTreatment && !selectedProducts.includes(nightTreatment)) {
        selectedProducts.push(nightTreatment);
      }
    }

    const reasoning = this.generateReasoning(selectedProducts, timeOfDay);

    return {
      timeOfDay,
      products: selectedProducts,
      reasoning,
      warnings,
      tips,
    };
  }

  /**
   * Select the best product from a category
   */
  private selectProduct(category: Product['category']): Product | undefined {
    const candidates = this.products.filter((p) => p.category === category);
    if (candidates.length === 0) return undefined;

    // If multiple, prefer products started more recently (likely more effective)
    return candidates.sort((a, b) => b.date_started.localeCompare(a.date_started))[0];
  }

  /**
   * Select the best serum based on time of day and skin goals
   */
  private selectBestSerum(timeOfDay: TimeOfDay): Product | undefined {
    const serums = this.products.filter((p) => p.category === 'serum');
    if (serums.length === 0) return undefined;

    // Filter out retinol serums for AM
    const filtered = timeOfDay === 'AM'
      ? serums.filter((s) => !s.is_retinol)
      : serums;

    if (filtered.length === 0) return undefined;

    // Prioritize based on skin goals
    if (this.skinProfile?.goals) {
      // Vitamin C for brightening in AM
      if (timeOfDay === 'AM' && this.skinProfile.goals.includes('brightening')) {
        const vitaminC = filtered.find((s) =>
          s.product_name.toLowerCase().includes('vitamin c') ||
          s.product_name.toLowerCase().includes('vit c')
        );
        if (vitaminC) return vitaminC;
      }

      // Hydrating serums for hydration goals
      if (this.skinProfile.goals.includes('hydration')) {
        const hydrating = filtered.find((s) =>
          s.product_name.toLowerCase().includes('hyaluronic') ||
          s.product_name.toLowerCase().includes('hydrat')
        );
        if (hydrating) return hydrating;
      }
    }

    return filtered[0];
  }

  /**
   * Select the best treatment product (including retinol)
   */
  private selectBestTreatment(retinolBlocked: boolean): Product | undefined {
    const treatments = this.products.filter((p) =>
      p.category === 'treatment' || p.category === 'retinol' || p.is_retinol
    );

    if (treatments.length === 0) return undefined;

    // Filter out retinol if blocked
    const filtered = retinolBlocked
      ? treatments.filter((t) => !t.is_retinol)
      : treatments;

    if (filtered.length === 0) return undefined;

    // Prefer retinol for anti-aging goals if not blocked
    if (!retinolBlocked && this.skinProfile?.goals.includes('anti-aging')) {
      const retinol = filtered.find((t) => t.is_retinol);
      if (retinol) return retinol;
    }

    return filtered[0];
  }

  /**
   * Check if retinol is blocked due to treatment
   */
  private isRetinolBlocked(date: Date): { blocked: boolean; message: string } {
    for (const treatment of this.treatments) {
      const treatmentDate = parseISO(treatment.date);
      const bufferDays = treatment.buffer_days || 7;

      const bufferStart = addDays(treatmentDate, -bufferDays);
      const bufferEnd = addDays(treatmentDate, bufferDays);

      if (isWithinInterval(date, { start: bufferStart, end: bufferEnd })) {
        const daysUntilSafe = Math.ceil((bufferEnd.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
        return {
          blocked: true,
          message: `Retinol blocked due to ${treatment.treatment_type} on ${treatment.date}. Safe in ${daysUntilSafe} days.`,
        };
      }
    }

    return { blocked: false, message: '' };
  }

  /**
   * Generate reasoning for the recommended routine
   */
  private generateReasoning(products: Product[], timeOfDay: TimeOfDay): string {
    if (!this.skinProfile) {
      return `This ${timeOfDay} routine follows the recommended order: cleanse, treat, moisturize${timeOfDay === 'AM' ? ', protect' : ''}.`;
    }

    const { skinType, goals, concerns } = this.skinProfile;

    let reasoning = `Customized for your ${skinType} skin`;

    if (goals.length > 0) {
      const goalText = goals.slice(0, 2).map((g) => g.replace(/-/g, ' ')).join(' and ');
      reasoning += `, focusing on ${goalText}`;
    }

    if (concerns.length > 0 && timeOfDay === 'PM') {
      const concernText = concerns.slice(0, 2).map((c) => c.replace(/-/g, ' ')).join(' and ');
      reasoning += `. Evening treatments target ${concernText}`;
    }

    return reasoning + '.';
  }
}

/**
 * Helper function to generate AI recommendations
 */
export function generateAIRecommendation(
  products: Product[],
  skinProfile: SkinProfile | null,
  treatments: Treatment[],
  date: Date = new Date()
): DailyRecommendation {
  const engine = new RoutineRecommendationEngine(products, skinProfile, treatments);
  return engine.generateDailyRecommendation(date);
}
