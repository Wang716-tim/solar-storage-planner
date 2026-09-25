import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateScenario, validateInputs } from '../src/engineering.js';

const standardInput = {
  monthlyKwh: 650,
  roofAreaM2: 48,
  targetSelfSufficiency: 0.75,
  annualYield: 1200,
  daytimeUseShare: 0.45,
  electricityPrice: 0.65,
  exportPrice: 0.35,
  installedCostPerKw: 4200,
  batteryAutonomyHours: 6,
};

test('calculates a finite estimate for a valid scenario', () => {
  const result = calculateScenario(standardInput);

  assert.ok(result.pvCapacityKw > 0);
  assert.ok(result.panelCount > 0);
  assert.ok(result.annualGenerationKwh > 0);
  assert.ok(result.batteryCapacityKwh > 0);
  assert.ok(result.estimatedAnnualSavings > 0);
  assert.ok(Number.isFinite(result.simplePaybackYears));
});

test('limits the panel count to the usable roof area', () => {
  const result = calculateScenario({ ...standardInput, roofAreaM2: 2 });

  assert.equal(result.panelCount, 0);
  assert.equal(result.pvCapacityKw, 0);
});

test('rejects values outside the documented input boundaries', () => {
  const errors = validateInputs({ ...standardInput, monthlyKwh: -1 });

  assert.equal(errors.monthlyKwh, '月用电量需在 1 至 100000 千瓦时之间');
});

test('rejects missing and non-numeric values without throwing', () => {
  const errors = validateInputs({ ...standardInput, annualYield: '很多' });

  assert.equal(errors.annualYield, '年发电量需在 500 至 2500 千瓦时/千瓦之间');
});

test('throws a field-level error when invalid values reach the calculation engine', () => {
  assert.throws(
    () => calculateScenario({ ...standardInput, monthlyKwh: 0 }),
    (error) => error instanceof TypeError && error.fields.monthlyKwh.includes('月用电量'),
  );
});

test('reports zero payback when upfront cost is zero', () => {
  const result = calculateScenario({ ...standardInput, installedCostPerKw: 0, batteryAutonomyHours: 0 });

  assert.equal(result.simplePaybackYears, 0);
});

test('has no payback estimate when the scenario produces no savings', () => {
  const result = calculateScenario({ ...standardInput, roofAreaM2: 0, electricityPrice: 0, exportPrice: 0 });

  assert.equal(result.annualGenerationKwh, 0);
  assert.equal(result.estimatedAnnualSavings, 0);
  assert.equal(result.simplePaybackYears, null);
});
