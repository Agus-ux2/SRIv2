const { SojaCalculator } = require('./soja.calculator');
const { TrigoCalculator } = require('./trigo.calculator');
const { MaizCalculator } = require('./maiz.calculator');
const { SorgoCalculator } = require('./sorgo.calculator');
const { GirasolCalculator } = require('./girasol.calculator');

class QualityService {
  constructor() {
    this.calculators = {
      soja: new SojaCalculator(),
      trigo: new TrigoCalculator(),
      maiz: new MaizCalculator(),
      sorgo: new SorgoCalculator(),
      girasol: new GirasolCalculator()
    };
  }

  calculateQuality(analysis, grossQuantity, basePrice) {
    const grainType = analysis.grain_type.toLowerCase();
    const calculator = this.calculators[grainType];
    
    if (!calculator) {
      throw new Error(`No calculator found for grain type: ${grainType}. Available: ${Object.keys(this.calculators).join(', ')}`);
    }
    
    return calculator.calculateQuality(analysis, grossQuantity, basePrice);
  }

  getAvailableGrains() {
    return Object.keys(this.calculators);
  }
}

module.exports = { QualityService };
