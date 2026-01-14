// Formatear fechas a dd/mm/yyyy
export function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export const formatDateHrs = (dateString) => {
  if (!dateString) return '-'

  const date = new Date(dateString)

  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()

  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${day}/${month}/${year}, ${hours}:${minutes} hrs.`
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

export function formatStatusText(status) {
  const map = {
    REQUESTED: 'Pendiente',
    APPROVED: 'Aprobado',
    REJECTED: 'Rechazado',
    DRAFT: 'Borrador',
    CANCELLED: 'Cancelado',
    PARTIAL_RECEIVED: 'Recibido P.',
    RECEIVED: 'Recibido',
    ACTIVE: 'Activo',
    INACTIVE: 'Inactivo'
  }
  return map[status] || status
}

// Capitalizar textos
export function capitalize(text) {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}


export function priceFormatter(value) {
  if (value == null) return ''
  // Formato chileno: separador de miles, sin decimales
  return '$ ' + value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
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
    <span>${isActive ? 'Activo' : 'Inactivo'}</span>
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


export function statusTextCellTemplate(cellElement, cellInfo) {
  const status = cellInfo.data.status
  const text = formatStatusText(status) // usa la traducción

  // Definir color según status
  let bgColor = 'bg-gray-50'
  let textColor = 'text-black'
  let pulseColor = '' // color del puntito

  switch (status) {
    case 'REQUESTED':
      bgColor = 'bg-yellow-50'
      textColor = 'text-yellow-800'
      pulseColor = 'bg-yellow-400'
      break
    case 'APPROVED':
    case 'ACTIVE':
      bgColor = 'bg-green-50'
      textColor = 'text-green-800'
      pulseColor = 'bg-green-400'
      break
    case 'REJECTED':
      bgColor = 'bg-red-50'
      textColor = 'text-red-800'
      pulseColor = 'bg-red-400'
      break
    case 'DRAFT':
      bgColor = 'bg-yellow-50'
      textColor = 'text-yellow-800'
      pulseColor = 'bg-yellow-400'
      break
    case 'CANCELLED':
    case 'INACTIVE':
      bgColor = 'bg-red-50'
      textColor = 'text-red-800'
      pulseColor = 'bg-red-400'
      break
    case 'PARTIAL_RECEIVED':
      bgColor = 'bg-blue-50'
      textColor = 'text-blue-800'
      pulseColor = 'bg-blue-400'
      break
    case 'RECEIVED':
      bgColor = 'bg-green-400'
      textColor = 'text-green-900'
      pulseColor = 'bg-green-900'
      break
  }

  const span = document.createElement('span')
  span.className = `rounded-full ${bgColor} ${textColor} font-[400] px-3 h-[23px] inline-flex items-center justify-start gap-1 w-[100px] border border-gray-100 leading-normal`
  
  // SVG puntito animado
  span.innerHTML = `<span class="w-[10px] h-[10px] ${pulseColor} rounded-full animate-pulse basis-[10px]!"></span>
                    <span class="text-[12px]">${text}</span>`

  cellElement.appendChild(span)
}

//Nop para data grid
export function getStatusMeta(status) {
  const text = formatStatusText(status)

  let bgColor = 'bg-gray-50'
  let textColor = 'text-black'
  let pulseColor = ''

  switch (status) {
    case 'REQUESTED':
      bgColor = 'bg-yellow-50'
      textColor = 'text-yellow-800'
      pulseColor = 'bg-yellow-400'
      break
    case 'APPROVED':
      bgColor = 'bg-green-50'
      textColor = 'text-green-800'
      pulseColor = 'bg-green-400'
      break
    case 'REJECTED':
      bgColor = 'bg-red-50'
      textColor = 'text-red-800'
      pulseColor = 'bg-red-400'
      break
    case 'DRAFT':
      bgColor = 'bg-yellow-50'
      textColor = 'text-yellow-800'
      pulseColor = 'bg-yellow-400'
      break
    case 'CANCELLED':
      bgColor = 'bg-red-50'
      textColor = 'text-red-800'
      pulseColor = 'bg-red-400'
      break
    case 'PARTIAL_RECEIVED':
      bgColor = 'bg-blue-50'
      textColor = 'text-blue-800'
      pulseColor = 'bg-blue-400'
      break
  }

  return { text, bgColor, textColor, pulseColor }
}

export const validarRutChileno = (rut) => {
  if (!rut) return false

  const cleanRut = rut.replace(/\./g, '').replace(/-/g, '').toUpperCase()
  if (!/^\d{7,8}[0-9K]$/.test(cleanRut)) return false

  const body = cleanRut.slice(0, -1)
  const dv = cleanRut.slice(-1)

  let sum = 0
  let multiplier = 2

  for (let i = body.length - 1; i >= 0; i--) {
    sum += Number(body[i]) * multiplier
    multiplier = multiplier === 7 ? 2 : multiplier + 1
  }

  const expected = 11 - (sum % 11)
  const dvCalc =
    expected === 11 ? '0' :
    expected === 10 ? 'K' :
    expected.toString()

  return dv === dvCalc
}


export const formatearRutConPuntos = (value) => {
  if (!value) return ''

  // Limpia todo excepto números y K
  let clean = value.replace(/[^0-9kK]/g, '').toUpperCase()
  if (clean.length === 0) return ''

  const dv = clean.slice(-1)
  let body = clean.slice(0, -1)

  // Aplica puntos al cuerpo
  body = body
    .split('')
    .reverse()
    .join('')
    .replace(/(\d{3})(?=\d)/g, '$1.')
    .split('')
    .reverse()
    .join('')

  return body ? `${body}-${dv}` : dv
}


