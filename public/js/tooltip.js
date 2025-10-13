const helpBtn = document.getElementById('help-btn');
const helpBoxes = Array.from(document.querySelectorAll('.help-box'));
let currentStep = 0;
let overlay = null;
let isActive = false;

function startHelp() {
  if (isActive) return;

  isActive = true;
  currentStep = 0;

  overlay = document.createElement('div');
  overlay.className = 'overlay';
  document.body.appendChild(overlay);
  overlay.style.display = 'block';

  overlay.addEventListener('click', nextStep);

  showStep(currentStep);
}

function endHelp() {
  if (!isActive) return;
  isActive = false;

  if (overlay) {
    overlay.removeEventListener('click', nextStep);
    overlay.remove();
    overlay = null;
  }

  helpBoxes.forEach((box) => box.classList.remove('help-highlight'));
  document.querySelectorAll('.tooltip').forEach((t) => t.remove());
}

function showStep(index) {
  if (index >= helpBoxes.length || index < 0) return endHelp();

  helpBoxes.forEach((box) => box.classList.remove('help-highlight'));
  document.querySelectorAll('.tooltip').forEach((t) => t.remove());

  const targetBox = helpBoxes[index];
  if (!targetBox) return endHelp();

  targetBox.classList.add('help-highlight');
  const rect = targetBox.getBoundingClientRect();
  const position = targetBox.dataset.position;
  const gap = 20;
  let top; 
  let left;

  const tooltip = document.createElement('div');
  tooltip.className = 'tooltip';
  tooltip.textContent = targetBox.dataset.message;

  document.body.appendChild(tooltip);

  switch (position) {
    case 'right':
      left = rect.right + gap;
      top = rect.top + rect.height / 2 - tooltip.offsetHeight / 2;
      break;
    case 'left':
      left = rect.left - tooltip.offsetWidth - gap;
      top = rect.top + rect.height / 2 - tooltip.offsetHeight / 2;
      break;
    case 'top':
      left = rect.left + rect.width / 2 - tooltip.offsetWidth / 2;
      top = rect.top - tooltip.offsetHeight - gap;
      break;
    case 'bottom':
      left = rect.left + rect.width / 2 - tooltip.offsetWidth / 2;
      top = rect.bottom + gap;
      break;
    default:
      left = rect.right + gap;
      top = rect.top + rect.height / 2 - tooltip.offsetHeight / 2;
  }
  tooltip.style.top = `${top}px`;
  tooltip.style.left = `${left}px`;
}

function nextStep() {
  currentStep++;
  if (currentStep < helpBoxes.length) {
    showStep(currentStep);
  } else {
    endHelp();
  }
}

helpBtn.addEventListener('click', startHelp);

document.addEventListener('keydown', (e) => {
  if (!isActive) return;
  if (e.key === 'Escape') return endHelp();
});
