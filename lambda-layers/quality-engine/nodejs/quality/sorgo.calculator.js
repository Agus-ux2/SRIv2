const { BaseCalculator } = require('./base.calculator');

class SorgoCalculator extends BaseCalculator {
  constructor() {
    const standards = {
      name: 'Sorgo Granífero Grado 1, 2, 3',
      base_humidity: 14.0,
      moisture_table: SORGO_MOISTURE_TABLE
    };
    super('sorgo', standards);
  }

  calculateDiscounts(analysis) {
    const discounts = [];
    
    // 1. Granos quebrados (hasta 4%)
    if (analysis.broken_grains && analysis.broken_grains > 2.0) {
      const discount = this.applyProportionalDiscount(
        analysis.broken_grains,
        2.0,
        4.0
      );
      discounts.push({
        parameter: 'broken_grains',
        value: discount,
        reason: `Granos quebrados: ${analysis.broken_grains}%`
      });
    }
    
    // 2. Materias extrañas (hasta 3%)
    if (analysis.foreign_matter > 2.0) {
      const discount = this.applyProportionalDiscount(
        analysis.foreign_matter,
        2.0,
        3.0
      );
      discounts.push({
        parameter: 'foreign_matter',
        value: discount,
        reason: `Materias extrañas: ${analysis.foreign_matter}%`
      });
    }
    
    // 3. Granos dañados
    if (analysis.damaged_grains > 3.0) {
      const ranges = [
        { min: 3.0, max: 6.0, discount: (analysis.damaged_grains - 3.0) * 0.8 },
        { min: 6.0, max: 10.0, discount: 2.4 + (analysis.damaged_grains - 6.0) * 0.4 },
        { min: 10.0, max: 999, discount: 4.0 }
      ];
      const discount = this.applyProgressiveDiscount(analysis.damaged_grains, ranges);
      discounts.push({
        parameter: 'damaged_grains',
        value: discount,
        reason: `Granos dañados: ${analysis.damaged_grains}%`
      });
    }
    
    return discounts;
  }

  calculateBonuses(analysis) {
    return [];
  }

  determineGrade(analysis, factor) {
    if (factor >= 98) return 'G1';
    if (factor < 95) return 'G3';
    return 'G2';
  }
}

const SORGO_MOISTURE_TABLE = [
  { humidity: 15.1, waste_percent: 0.60 },
  { humidity: 15.5, waste_percent: 1.10 },
  { humidity: 16.0, waste_percent: 1.73 },
  { humidity: 16.5, waste_percent: 2.36 },
  { humidity: 17.0, waste_percent: 2.90 },
  { humidity: 17.5, waste_percent: 3.53 },
  { humidity: 18.0, waste_percent: 4.10 },
  { humidity: 18.5, waste_percent: 4.73 },
  { humidity: 19.0, waste_percent: 5.30 },
  { humidity: 19.5, waste_percent: 5.93 },
  { humidity: 20.0, waste_percent: 6.50 },
  { humidity: 21.0, waste_percent: 7.70 },
  { humidity: 22.0, waste_percent: 8.90 },
  { humidity: 23.0, waste_percent: 10.10 },
  { humidity: 24.0, waste_percent: 11.30 },
  { humidity: 25.0, waste_percent: 12.50 }
];

module.exports = { SorgoCalculator };
