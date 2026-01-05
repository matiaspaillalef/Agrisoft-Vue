// Formatear fechas a dd/mm/yyyy
export function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

// Traducir status
export function formatStatus(status) {
  const map = {
    1: 'Pendiente',
    2: 'Aprobado',
    3: 'Rechazado'
  };
  return map[status] || status;
}

// Capitalizar textos
export function capitalize(text) {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}


//Cell template para status 
export function statusCellTemplate(cellElement, cellInfo) {
  const isActive =
    cellInfo.data.status === 1 ||
    cellInfo.data.status === true

  const span = document.createElement('span')
  span.className = isActive
    ? 'rounded-full  bg-gray-50 text-black font-[400] px-3 h-[23px] inline-flex items-center w-[100px] justify-center gap-1 border border-gray-100'
    : 'rounded-full bg-gray-50 text-black font-[400] px-3 h-[23px] inline-flex items-center justify-center gap-1 w-[100px] border border-gray-100'

  // SVG
  span.innerHTML = `
    ${isActive ? activeSvg() : inactiveSvg()}
    <span>${isActive ? 'Activa' : 'Inactiva'}</span>
  `

  cellElement.appendChild(span)
}

function activeSvg() {
  return `
    <span class="w-[10px] h-[10px] bg-green-400 rounded-full animate-pulse"></span>
  `
}

function inactiveSvg() {
  return `
  <span class="w-[10px] h-[10px] bg-red-400 rounded-full animate-pulse"></span>
  `
}
