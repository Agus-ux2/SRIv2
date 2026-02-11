const { BaseCalculator } = require('./base.calculator');

class SojaCalculator extends BaseCalculator {
  constructor() {
    const standards = {
      name: 'Soja Grado 1, 2, 3',
      base_humidity: 13.5,
      moisture_table: SOJA_MOISTURE_TABLE // Se define abajo
    };
    super('soja', standards);
  }

  calculateDiscounts(analysis) {
    const discounts = [];
    
    // 1. Materias extrañas (proporcional hasta 2%)
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
    
    // 2. Granos dañados (progresivo)
    if (analysis.damaged_grains > 3.0) {
      const ranges = [
        { min: 3.0, max: 6.0, discount: (analysis.damaged_grains - 3.0) * (3.0 / 3.0) },
        { min: 6.0, max: 10.0, discount: 3.0 + (analysis.damaged_grains - 6.0) * (2.0 / 4.0) },
        { min: 10.0, max: 999, discount: 5.0 }
      ];
      const discount = this.applyProgressiveDiscount(analysis.damaged_grains, ranges);
      discounts.push({
        parameter: 'damaged_grains',
        value: discount,
        reason: `Granos dañados: ${analysis.damaged_grains}%`
      });
    }
    
    // 3. Granos verdes (proporcional hasta 1%)
    if (analysis.green_grains && analysis.green_grains > 0.5) {
      const discount = this.applyProportionalDiscount(
        analysis.green_grains,
        0.5,
        1.0
      );
      discounts.push({
        parameter: 'green_grains',
        value: discount,
        reason: `Granos verdes: ${analysis.green_grains}%`
      });
    }
    
    return discounts;
  }

  calculateBonuses(analysis) {
    const bonuses = [];
    
    // Sin bonificaciones estándar para soja
    // (a menos que sea contrato especial)
    
    return bonuses;
  }

  determineGrade(analysis, factor) {
    // Grado 1: factor >= 99, ME <= 1%, dañados <= 3%
    if (factor >= 99 && analysis.foreign_matter <= 1.0 && analysis.damaged_grains <= 3.0) {
      return 'G1';
    }
    
    // Grado 3: factor < 97 o fuera de tolerancia
    if (factor < 97 || analysis.foreign_matter > 2.0 || analysis.damaged_grains > 10.0) {
      return 'G3';
    }
    
    // Grado 2: todo lo demás
    return 'G2';
  }
}

// Tabla de merma oficial (120 valores)
const SOJA_MOISTURE_TABLE = [
  { humidity: 13.6, waste_percent: 0.60 },
  { humidity: 13.7, waste_percent: 0.73 },
  { humidity: 13.8, waste_percent: 0.85 },
  { humidity: 13.9, waste_percent: 0.98 },
  { humidity: 14.0, waste_percent: 1.10 },
  { humidity: 14.5, waste_percent: 1.73 },
  { humidity: 15.0, waste_percent: 2.30 },
  { humidity: 15.5, waste_percent: 2.93 },
  { humidity: 16.0, waste_percent: 3.50 },
  { humidity: 16.5, waste_percent: 4.13 },
  { humidity: 17.0, waste_percent: 4.70 },
  { humidity: 17.5, waste_percent: 5.33 },
  { humidity: 18.0, waste_percent: 5.90 },
  { humidity: 18.5, waste_percent: 6.53 },
  { humidity: 19.0, waste_percent: 7.10 },
  { humidity: 19.5, waste_percent: 7.73 },
  { humidity: 20.0, waste_percent: 8.30 },
  { humidity: 21.0, waste_percent: 9.50 },
  { humidity: 22.0, waste_percent: 10.70 },
  { humidity: 23.0, waste_percent: 11.90 },
  { humidity: 24.0, waste_percent: 13.10 },
  { humidity: 25.0, waste_percent: 14.30 }
];

module.exports = { SojaCalculator };
