const { BaseCalculator } = require('./base.calculator');

class GirasolCalculator extends BaseCalculator {
  constructor() {
    const standards = {
      name: 'Girasol Confitero/Alto Oleico',
      base_humidity: 9.5,
      moisture_table: GIRASOL_MOISTURE_TABLE
    };
    super('girasol', standards);
  }

  calculateDiscounts(analysis) {
    const discounts = [];
    
    // 1. Materias extrañas (hasta 2%)
    if (analysis.foreign_matter > 1.0) {
      const discount = this.applyProportionalDiscount(
        analysis.foreign_matter,
        1.0,
        2.0
      );
      discounts.push({
        parameter: 'foreign_matter',
        value: discount,
        reason: `Materias extrañas: ${analysis.foreign_matter}%`
      });
    }
    
    // 2. Granos dañados
    if (analysis.damaged_grains > 2.0) {
      const ranges = [
        { min: 2.0, max: 5.0, discount: (analysis.damaged_grains - 2.0) * 1.2 },
        { min: 5.0, max: 8.0, discount: 3.6 + (analysis.damaged_grains - 5.0) * 0.6 },
        { min: 8.0, max: 999, discount: 5.4 }
      ];
      const discount = this.applyProgressiveDiscount(analysis.damaged_grains, ranges);
      discounts.push({
        parameter: 'damaged_grains',
        value: discount,
        reason: `Granos dañados: ${analysis.damaged_grains}%`
      });
    }
    
    // 3. Granos vanos (vacíos)
    if (analysis.empty_grains && analysis.empty_grains > 3.0) {
      const discount = this.applyProportionalDiscount(
        analysis.empty_grains,
        3.0,
        2.0
      );
      discounts.push({
        parameter: 'empty_grains',
        value: discount,
        reason: `Granos vanos: ${analysis.empty_grains}%`
      });
    }
    
    return discounts;
  }

  calculateBonuses(analysis) {
    const bonuses = [];
    
    // Bonificación por alto contenido oleico (> 42%)
    if (analysis.oil_content && analysis.oil_content > 42) {
      bonuses.push({
        parameter: 'oil_content',
        value: 1.0,
        reason: `Alto contenido oleico: ${analysis.oil_content}%`
      });
    }
    
    return bonuses;
  }

  determineGrade(analysis, factor) {
    if (factor >= 99) return 'G1';
    if (factor < 96) return 'G3';
    return 'G2';
  }
}

const GIRASOL_MOISTURE_TABLE = [
  { humidity: 11.1, waste_percent: 1.73 },
  { humidity: 11.5, waste_percent: 2.36 },
  { humidity: 12.0, waste_percent: 2.90 },
  { humidity: 12.5, waste_percent: 3.53 },
  { humidity: 13.0, waste_percent: 4.10 },
  { humidity: 13.5, waste_percent: 4.73 },
  { humidity: 14.0, waste_percent: 5.30 },
  { humidity: 14.5, waste_percent: 5.93 },
  { humidity: 15.0, waste_percent: 6.50 },  // CORREGIDO de 6.40
  { humidity: 15.5, waste_percent: 7.13 },
  { humidity: 16.0, waste_percent: 7.70 },
  { humidity: 17.0, waste_percent: 8.90 },
  { humidity: 18.0, waste_percent: 10.10 },
  { humidity: 19.0, waste_percent: 11.30 },
  { humidity: 20.0, waste_percent: 12.50 },
  { humidity: 21.0, waste_percent: 13.70 },
  { humidity: 22.0, waste_percent: 14.90 },
  { humidity: 23.0, waste_percent: 16.10 },
  { humidity: 24.0, waste_percent: 17.30 },
  { humidity: 25.0, waste_percent: 18.50 }
];

module.exports = { GirasolCalculator };
