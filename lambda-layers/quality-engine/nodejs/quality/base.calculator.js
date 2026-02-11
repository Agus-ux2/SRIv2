/**
 * Base Calculator - Clase base para todos los calculadores de calidad
 */

class BaseCalculator {
  constructor(grainType, standards) {
    this.grainType = grainType;
    this.standards = standards;
  }

  /**
   * Calcula el factor de calidad completo
   */
  calculateQuality(analysis, grossQuantity, basePrice) {
    const result = {
      grain_type: this.grainType,
      base_factor: 100.000,
      final_factor: 100.000,
      grade: null,
      bonuses: [],
      discounts: [],
      total_bonus: 0,
      total_discount: 0,
      warnings: [],
      out_of_standard: false,
      out_of_tolerance: false
    };
  // 1. Calcular descuentos por parámetros
    const discounts = this.calculateDiscounts(analysis);
    result.discounts = discounts;
    result.total_discount = discounts.reduce((sum, d) => sum + d.value, 0);

    // 2. Calcular bonificaciones
    const bonuses = this.calculateBonuses(analysis);
    result.bonuses = bonuses;
    result.total_bonus = bonuses.reduce((sum, b) => sum + b.value, 0);

    // 3. Factor final
    result.final_factor = result.base_factor - result.total_discount + result.total_bonus;

    // 4. Determinar grado (si aplica)
    result.grade = this.determineGrade(analysis, result.final_factor);

    // 5. Aplicar ajuste de grado
    if (result.grade === 'G1') {
      result.final_factor += 1.0;
    } else if (result.grade === 'G3') {
      result.final_factor -= 1.5;
    }

    // 6. Calcular merma por humedad
    result.humidity_waste = this.calculateHumidityWaste(analysis.humidity, grossQuantity);

    // 7. Calcular ajuste de precio
    result.price_adjustment = this.calculatePriceAdjustment(
      result.final_factor,
      result.humidity_waste,
      grossQuantity,
      basePrice
    );

    return result;
  }

  /**
   * Calcular descuentos (override en cada calculador)
   */
  calculateDiscounts(analysis) {
    return [];
  }

  /**
   * Calcular bonificaciones (override en cada calculador)
   */
  calculateBonuses(analysis) {
    return [];
  }

  /**
   * Determinar grado (override si aplica)
   */
  determineGrade(analysis, factor) {
    return null;
  }

  /**
   * Calcular merma por humedad
   */
  calculateHumidityWaste(humidity, grossKg) {
    const baseHumidity = this.standards.base_humidity;
    
    if (humidity <= baseHumidity) {
      return {
        base_humidity: baseHumidity,
        actual_humidity: humidity,
        requires_drying: false,
        drying_waste_percent: 0,
        handling_waste_percent: 0.5,
        waste_percent: 0.5,
        waste_kg: grossKg * 0.005,
        net_quantity_kg: grossKg * 0.995
      };
    }

    // Buscar en tabla de merma
    const wastePercent = this.getMoistureWaste(humidity);
    const wasteKg = grossKg * (wastePercent / 100);

    return {
      base_humidity: baseHumidity,
      actual_humidity: humidity,
      requires_drying: true,
      drying_waste_percent: wastePercent - 0.5,
      handling_waste_percent: 0.5,
      waste_percent: wastePercent,
      waste_kg: wasteKg,
      net_quantity_kg: grossKg - wasteKg
    };
  }

  /**
   * Obtener % de merma para una humedad específica
   */
  getMoistureWaste(humidity) {
    const rounded = Math.round(humidity * 10) / 10;
    const entry = this.standards.moisture_table.find(e => e.humidity === rounded);
    return entry ? entry.waste_percent : 0;
  }

  /**
   * Calcular ajuste de precio
   */
  calculatePriceAdjustment(factor, humidityWaste, grossKg, basePricePerTon) {
    const adjustmentPercent = factor - 100;
    const adjustedPrice = basePricePerTon * (1 + adjustmentPercent / 100);
    const netKg = humidityWaste.net_quantity_kg;
    const netTons = netKg / 1000;
    
    return {
      base_price_per_ton: basePricePerTon,
      adjusted_price_per_ton: adjustedPrice,
      adjustment_percent: adjustmentPercent,
      gross_amount: (grossKg / 1000) * basePricePerTon,
      net_amount: netTons * adjustedPrice
    };
  }

  /**
   * Aplicar descuento proporcional
   */
  applyProportionalDiscount(value, limit, maxDiscount) {
    if (value <= limit) return 0;
    const excess = value - limit;
    return Math.min(excess * (maxDiscount / limit), maxDiscount);
  }

  /**
   * Aplicar descuento progresivo por rangos
   */
  applyProgressiveDiscount(value, ranges) {
    for (const range of ranges) {
      if (value >= range.min && value <= range.max) {
        return range.discount;
      }
    }
    return ranges[ranges.length - 1].discount;
  }
}

module.exports = { BaseCalculator };
