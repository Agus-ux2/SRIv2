const { BaseCalculator } = require('./base.calculator');

class MaizCalculator extends BaseCalculator {
  constructor() {
    const standards = {
      name: 'Maíz Grado 1, 2, 3',
      base_humidity: 14.5,
      moisture_table: MAIZ_MOISTURE_TABLE
    };
    super('maiz', standards);
  }

  calculateDiscounts(analysis) {
    const discounts = [];
    
    // 1. Granos quebrados (hasta 5%)
    if (analysis.broken_grains && analysis.broken_grains > 2.0) {
      const discount = this.applyProportionalDiscount(
        analysis.broken_grains,
        2.0,
        5.0
      );
      discounts.push({
        parameter: 'broken_grains',
        value: discount,
        reason: `Granos quebrados: ${analysis.broken_grains}%`
      });
    }
    
    // 2. Materias extrañas (hasta 3%)
    if (analysis.foreign_matter > 1.0) {
      const discount = this.applyProportionalDiscount(
        analysis.foreign_matter,
        1.0,
        3.0
      );
      discounts.push({
        parameter: 'foreign_matter',
        value: discount,
        reason: `Materias extrañas: ${analysis.foreign_matter}%`
      });
    }
    
    // 3. Granos dañados (progresivo)
    if (analysis.damaged_grains > 2.0) {
      const ranges = [
        { min: 2.0, max: 5.0, discount: (analysis.damaged_grains - 2.0) * 1.0 },
        { min: 5.0, max: 8.0, discount: 3.0 + (analysis.damaged_grains - 5.0) * 0.5 },
        { min: 8.0, max: 999, discount: 4.5 }
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
    // Maíz generalmente no tiene bonificaciones estándar
    return bonuses;
  }

  determineGrade(analysis, factor) {
    if (factor >= 99) return 'G1';
    if (factor < 96) return 'G3';
    return 'G2';
  }
}

// Tabla de merma oficial
const MAIZ_MOISTURE_TABLE = [
  { humidity: 14.6, waste_percent: 0.60 },
  { humidity: 15.0, waste_percent: 1.73 },  // CORREGIDO de 0.73
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

module.exports = { MaizCalculator };
