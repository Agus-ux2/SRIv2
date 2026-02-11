const { QualityService } = require('/opt/nodejs/quality/quality.service');

exports.handler = async (event) => {
  try {
    const qualityService = new QualityService();
    const results = {};

    // Test todos los granos
    const tests = [
      { grain_type: 'soja',    foreign_matter: 1.5, damaged_grains: 4.0, green_grains: 0.3, humidity: 15.0 },
      { grain_type: 'trigo',   foreign_matter: 1.2, damaged_grains: 2.5, broken_grains: 1.5, humidity: 15.5 },
      { grain_type: 'maiz',    foreign_matter: 1.8, damaged_grains: 3.5, broken_grains: 2.5, humidity: 16.0 },
      { grain_type: 'sorgo',   foreign_matter: 2.5, damaged_grains: 4.0, broken_grains: 3.0, humidity: 17.0 },
      { grain_type: 'girasol', foreign_matter: 1.2, damaged_grains: 3.0, empty_grains: 4.0, humidity: 12.0 }
    ];

    for (const analysis of tests) {
      const result = qualityService.calculateQuality(analysis, 25000, 350000);
      results[analysis.grain_type] = {
        factor: result.final_factor,
        grade: result.grade,
        discount: result.total_discount,
        waste_kg: result.humidity_waste.waste_kg,
        net_kg: result.humidity_waste.net_quantity_kg
      };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: true, grains_tested: 5, results })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: false, error: error.message })
    };
  }
};
