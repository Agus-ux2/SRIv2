const { BaseCalculator } = require('./base.calculator');

class TrigoCalculator extends BaseCalculator {
  constructor() {
    const standards = {
      name: 'Trigo Pan Grado 1, 2, 3',
      base_humidity: 14.0,
      moisture_table: TRIGO_MOISTURE_TABLE
    };
    super('trigo', standards);
  }

  calculateDiscounts(analysis) {
    const discounts = [];
    
    // 1. Granos quebrados y chuzos (hasta 3%)
    if (analysis.broken_grains && analysis.broken_grains > 1.0) {
      const discount = this.applyProportionalDiscount(
        analysis.broken_grains,
        1.0,
        3.0
      );
      discounts.push({
        parameter: 'broken_grains',
        value: discount,
        reason: `Granos quebrados: ${analysis.broken_grains}%`
      });
    }
    
    // 2. Materias extrañas (hasta 2%)
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
    
    // 3. Granos dañados (progresivo)
    if (analysis.damaged_grains > 1.0) {
      const ranges = [
        { min: 1.0, max: 3.0, discount: (analysis.damaged_grains - 1.0) * 1.0 },
        { min: 3.0, max: 5.0, discount: 2.0 + (analysis.damaged_grains - 3.0) * 0.5 },
        { min: 5.0, max: 999, discount: 3.0 }
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
    const bonuses = [];
    
    // Bonificación por peso hectolítrico alto (> 78 kg/hl)
    if (analysis.test_weight && analysis.test_weight > 78) {
      bonuses.push({
        parameter: 'test_weight',
        value: 0.5,
        reason: `Peso hectolítrico alto: ${analysis.test_weight} kg/hl`
      });
    }
    
    return bonuses;
  }

  determineGrade(analysis, factor) {
    // Grado 1: factor >= 99
    if (factor >= 99) return 'G1';
    
    // Grado 3: factor < 97
    if (factor < 97) return 'G3';
    
    // Grado 2: intermedio
    return 'G2';
  }
}

// Tabla de merma oficial (valores clave)
const TRIGO_MOISTURE_TABLE = [
  { humidity: 14.1, waste_percent: 0.60 },
  { humidity: 14.5, waste_percent: 1.10 },
  { humidity: 15.0, waste_percent: 1.73 },
  { humidity: 15.5, waste_percent: 2.36 },
  { humidity: 16.0, waste_percent: 2.90 },
  { humidity: 16.5, waste_percent: 3.53 },
  { humidity: 17.0, waste_percent: 4.10 },
  { humidity: 17.5, waste_percent: 4.73 },
  { humidity: 18.0, waste_percent: 5.30 },
  { humidity: 18.5, waste_percent: 5.93 },
  { humidity: 19.0, waste_percent: 6.50 },
  { humidity: 19.5, waste_percent: 7.13 },
  { humidity: 20.0, waste_percent: 7.70 },
  { humidity: 21.0, waste_percent: 8.90 },
  { humidity: 22.0, waste_percent: 10.10 },
  { humidity: 23.0, waste_percent: 11.30 },
  { humidity: 24.0, waste_percent: 12.50 },
  { humidity: 25.0, waste_percent: 13.70 }
];

module.exports = { TrigoCalculator };
