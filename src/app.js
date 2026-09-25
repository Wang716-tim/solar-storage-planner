import { calculateScenario, validateInputs } from './engineering.js';

const form = document.querySelector('#scenario-form');
const numberFields = [...form.querySelectorAll('input[type="number"], input[type="range"]')];
const exampleValues = Object.fromEntries(numberFields.map((field) => [field.name, field.value]));
const currency = new Intl.NumberFormat('zh-CN', { maximumFractionDigits: 0 });
const quantity = new Intl.NumberFormat('zh-CN', { maximumFractionDigits: 1 });

function readInputs() {
  return Object.fromEntries(numberFields.map((field) => [field.name, Number(field.value)]));
}

function showErrors(errors) {
  for (const field of numberFields) {
    const message = errors[field.name] ?? '';
    const errorId = `${field.name}-error`;
    document.querySelector(`#${errorId}`).textContent = message;
    field.setAttribute('aria-invalid', String(Boolean(message)));
    if (message) field.setAttribute('aria-describedby', errorId);
    else field.removeAttribute('aria-describedby');
  }
}

function setText(id, value) {
  document.querySelector(`#${id}`).textContent = value;
}

function updateRangeLabels() {
  setText('daytimeUseShare-value', `${Math.round(Number(form.elements.daytimeUseShare.value) * 100)}%`);
  setText('targetSelfSufficiency-value', `${Math.round(Number(form.elements.targetSelfSufficiency.value) * 100)}%`);
}

function renderRoof(panelCount) {
  const tiles = document.querySelector('#roof-tiles');
  tiles.replaceChildren();
  for (let index = 0; index < Math.min(panelCount, 36); index += 1) {
    const tile = document.createElement('i');
    tile.className = 'roof-tile';
    tiles.append(tile);
  }
  if (panelCount > 36) {
    const extra = document.createElement('span');
    extra.textContent = `+${panelCount - 36}`;
    tiles.append(extra);
  }
}

function renderResult(result, inputs) {
  setText('pv-capacity', quantity.format(result.pvCapacityKw));
  setText('panel-count', currency.format(result.panelCount));
  setText('roof-area-result', quantity.format(inputs.roofAreaM2));
  setText('annual-generation', currency.format(result.annualGenerationKwh));
  setText('battery-capacity', quantity.format(result.batteryCapacityKwh));
  setText('annual-savings', currency.format(result.estimatedAnnualSavings));
  setText('payback-period', result.simplePaybackYears === null ? '—' : quantity.format(result.simplePaybackYears));
  setText('generation-value', currency.format(result.annualGenerationKwh));
  setText('self-use-value', currency.format(result.selfUseKwh));
  setText('export-value', currency.format(result.exportKwh));
  setText('estimated-cost', `${currency.format(result.estimatedCost)} 元`);
  renderRoof(result.panelCount);

  const max = Math.max(result.annualGenerationKwh, result.selfUseKwh, result.exportKwh, 1);
  document.querySelector('#generation-bar').style.width = `${result.annualGenerationKwh / max * 100}%`;
  document.querySelector('#self-use-bar').style.width = `${result.selfUseKwh / max * 100}%`;
  document.querySelector('#export-bar').style.width = `${result.exportKwh / max * 100}%`;
  document.querySelector('#energy-chart').setAttribute('aria-label', `预计发电 ${currency.format(result.annualGenerationKwh)} 千瓦时，其中自用 ${currency.format(result.selfUseKwh)} 千瓦时，余电上网 ${currency.format(result.exportKwh)} 千瓦时`);
}

function calculate() {
  updateRangeLabels();
  const inputs = readInputs();
  const errors = validateInputs(inputs);
  showErrors(errors);
  if (Object.keys(errors).length) {
    setText('form-status', '请检查标出的输入范围后重新估算。');
    return;
  }
  renderResult(calculateScenario(inputs), inputs);
  setText('form-status', '方案已更新。');
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  calculate();
});

for (const field of numberFields) {
  field.addEventListener('input', () => {
    if (field.type === 'range') updateRangeLabels();
  });
  field.addEventListener('change', calculate);
}

document.querySelector('#reset-button').addEventListener('click', () => {
  for (const field of numberFields) field.value = exampleValues[field.name];
  calculate();
});

calculate();
