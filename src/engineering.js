const limits = {
  monthlyKwh: [1, 100000, '月用电量需在 1 至 100000 千瓦时之间'],
  roofAreaM2: [0, 100000, '可用屋顶面积需在 0 至 100000 平方米之间'],
  targetSelfSufficiency: [0, 1, '目标供电比例需在 0 至 100% 之间'],
  annualYield: [500, 2500, '年发电量需在 500 至 2500 千瓦时/千瓦之间'],
  daytimeUseShare: [0, 1, '白天用电比例需在 0 至 100% 之间'],
  electricityPrice: [0, 100, '购电单价需在 0 至 100 元/千瓦时之间'],
  exportPrice: [0, 100, '上网电价需在 0 至 100 元/千瓦时之间'],
  installedCostPerKw: [0, 1000000, '光伏单价需在 0 至 1000000 元/千瓦之间'],
  batteryAutonomyHours: [0, 24, '备用时长需在 0 至 24 小时之间'],
};

const panel = { powerKw: 0.42, areaM2: 2.1 };
const battery = { usableFraction: 0.9, roundTripEfficiency: 0.88, costPerKwh: 800 };

export function validateInputs(input) {
  const errors = {};

  for (const [key, [minimum, maximum, message]] of Object.entries(limits)) {
    const value = input?.[key];
    if (value === '' || value === null || value === undefined || !Number.isFinite(Number(value))) {
      errors[key] = message;
      continue;
    }
    const number = Number(value);
    if (number < minimum || number > maximum) errors[key] = message;
  }

  return errors;
}

export function calculateScenario(input) {
  const errors = validateInputs(input);
  if (Object.keys(errors).length) {
    const error = new TypeError('输入参数无效');
    error.fields = errors;
    throw error;
  }

  const annualUse = Number(input.monthlyKwh) * 12;
  const requestedCapacity = annualUse * Number(input.targetSelfSufficiency) / Number(input.annualYield);
  const roofPanelCount = Math.floor(Number(input.roofAreaM2) / panel.areaM2);
  const panelCount = Math.min(Math.ceil(requestedCapacity / panel.powerKw), roofPanelCount);
  const pvCapacityKw = panelCount * panel.powerKw;
  const annualGenerationKwh = pvCapacityKw * Number(input.annualYield);
  const dailyUse = annualUse / 365;
  const batteryCapacityKwh = dailyUse * (1 - Number(input.daytimeUseShare))
    * Number(input.batteryAutonomyHours) / 24 / battery.usableFraction;
  const daytimeDemand = annualUse * Number(input.daytimeUseShare);
  const directUse = Math.min(annualGenerationKwh, daytimeDemand);
  const batteryUse = Math.min(
    Math.max(0, annualGenerationKwh - directUse),
    batteryCapacityKwh * battery.usableFraction * battery.roundTripEfficiency * 365,
    Math.max(0, annualUse - directUse),
  );
  const selfUseKwh = directUse + batteryUse;
  const exportKwh = Math.max(0, annualGenerationKwh - selfUseKwh);
  const estimatedAnnualSavings = selfUseKwh * Number(input.electricityPrice)
    + exportKwh * Number(input.exportPrice);
  const estimatedCost = pvCapacityKw * Number(input.installedCostPerKw)
    + batteryCapacityKwh * battery.costPerKwh;

  return {
    panelCount,
    pvCapacityKw,
    annualUseKwh: annualUse,
    annualGenerationKwh,
    batteryCapacityKwh,
    selfUseKwh,
    exportKwh,
    estimatedAnnualSavings,
    estimatedCost,
    simplePaybackYears: estimatedAnnualSavings > 0 ? estimatedCost / estimatedAnnualSavings : null,
    assumptions: { ...panel, ...battery },
  };
}
