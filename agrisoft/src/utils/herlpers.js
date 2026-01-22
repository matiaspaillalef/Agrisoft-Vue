import { StateCL } from '@/utils/dataState.js'
import { ProvitionalCL } from '@/utils/dataProvitionals'

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

export function formatDateCL(cellInfo) {
  if (!cellInfo.value) return ''
  return new Date(cellInfo.value).toLocaleDateString('es-CL', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
}

export const toMySQLDateTime = (value, endOfDay = false) => {
  if (!value) return null;

  // Si viene como ISO: 2026-01-01T12:00:00.000Z
  if (typeof value === 'string' && value.includes('T')) {
    const date = value.split('T')[0];
    return `${date} ${endOfDay ? '23:59:59' : '00:00:00'}`;
  }

  // Si viene como Date object
  const yyyy = value.getFullYear();
  const mm = String(value.getMonth() + 1).padStart(2, '0');
  const dd = String(value.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${endOfDay ? '23:59:59' : '00:00:00'}`;
};



// Traducir status
export function formatStatus(status) {
  const map = {
    0: 'Cancelado',
    1: 'Pendiente',
    2: 'Aprobado',
    3: 'Rechazado'
  };
  return map[status] || status;
}

export function formatStatusv2(status) {
  switch (status) {
    case 1:
    case '1': return 'Creada'
    case 2:
    case '2': return 'En tránsito'
    case 3:
    case '3': return 'Entregada'
    case 0:
    case '0': return 'Cancelada'
    default: return 'Desconocido'
  }
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
    INACTIVE: 'Inactivo',
    0: 'Inactivo',
    1: 'Activo',
    2: 'Inactivo'
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
  const status = cellInfo.data.status;
  const idState = cellInfo.data.id_state;

  let bgClass = '';
  let textClass = '';
  let label = '';
  let svgContent = '';

  if (status === 1 || status === '1' || status === true || idState === 1) {
    // Activo
    bgClass = 'bg-green-50';
    textClass = 'text-green-800';
    label = 'Activo';
    svgContent = activeSvg();
  } else if (status === 2 || status === '2') {
    // Cerrado
    bgClass = 'bg-orange-50';
    textClass = 'text-orange-500';
    label = 'Cerrado';
    svgContent = closedSvg(); // Aquí puedes definir un SVG para cerrado
  } else {
    // Inactivo
    bgClass = 'bg-gray-50';
    textClass = 'text-black';
    label = 'Inactivo';
    svgContent = inactiveSvg();
  }

  const span = document.createElement('span');
  span.className = `rounded-full ${bgClass} ${textClass} font-[400] px-3 h-[23px] inline-flex items-center justify-center gap-1 w-[100px] border border-gray-100`;

  span.innerHTML = `
    ${svgContent}
    <span>${label}</span>
  `;

  cellElement.appendChild(span);
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

function closedSvg() {
  return `
  <span class="w-[10px] h-[10px] bg-orange-400 rounded-full animate-pulse"></span>
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
    case 1:
    case '1':
    case 'APPROVED':
      bgColor = 'bg-green-50'
      textColor = 'text-green-800'
      pulseColor = 'bg-green-400'
      break
    case 0:
    case '0':  
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

export function statusCellTemplatev2(cellElement, cellInfo) {
  const status = cellInfo.data.status;

  // 1. Configuración de estilos por Estado (Mapa)
  const statusConfig = {
    0: { 
      bg: 'bg-red-50!', 
      text: 'text-red-800', 
      dot: 'bg-red-500',
      border: 'border-red-100'
    },
    1: { 
      bg: 'bg-blue-50', 
      text: 'text-blue-800', 
      dot: 'bg-blue-500',
      border: 'border-blue-100'
    },
    2: { 
      bg: 'bg-orange-50', 
      text: 'text-orange-700', 
      dot: 'bg-orange-500',
      border: 'border-orange-100'
    },
    3: { 
      bg: 'bg-green-50', 
      text: 'text-green-700', 
      dot: 'bg-green-500',
      border: 'border-green-100'
    }
  };

  // 2. Fallback (por si llega un estado desconocido)
  const defaultConfig = { 
    bg: 'bg-gray-50', 
    text: 'text-gray-600', 
    dot: 'bg-gray-400',
    border: 'border-gray-200'
  };

  // Seleccionamos el estilo actual
  const style = statusConfig[status] || defaultConfig;

  // 3. Renderizado del HTML
  // Nota: Usamos style.text para el color de la letra, no style.dot (que es bg)
  cellElement.innerHTML = `
    <div class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border w-[100px] ${style.bg} ${style.border} ${style.text}">
      <span class="w-2 h-2 mr-1.5 rounded-full ${style.dot} animate-pulse"></span>
      ${formatStatusv2(status)}
    </div>
  `;
}


export const getCompensationBoxName = (id) => {
  if (!id) return 'N/A';
  const box = ProvitionalCL.find(b => b.id === Number(id));
  return box ? box.name : 'N/A';
};

// Obtener nombre de la Región por region_number
export const getRegionName = (regionNumber) => {
  if (!regionNumber) return 'N/A';
  const region = StateCL.find(r => r.region_number === regionNumber);
  return region ? region.region : regionNumber; // Si no lo encuentra, devuelve el valor original
};

export const validarEmail = (v) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v || '');

export const validarTelefonoCL = (v) =>
  /^[0-9]{9}$/.test(v || '');

export const validarURL = (v) =>
  /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/.*)?$/.test(v || '');


export function formatNumberCL(value, decimals = 2) {
  if (value === null || value === undefined || value === '') return '';
  return Number(value).toLocaleString('es-CL', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals
  });
}

export function seasonStatusCellTemplate(container, options) {
  const seasons = options.component.option('columns')
    .find(c => c.dataField === 'season')?.lookup?.dataSource?.store || []

  const seasonId = options.value
  const season = seasons.find(s => Number(s.id) === Number(seasonId))

  const status = String(season?.status ?? '0')

  const wrapper = document.createElement('div')
  wrapper.className = 'flex items-center gap-2'

  const dot = document.createElement('div')
  dot.className = 'w-2.5 h-2.5 rounded-full flex-shrink-0'

  if (status === '1') {
    dot.classList.add('bg-green-500', 'animate-pulse')
  } else if (status === '3') {
    dot.classList.add('bg-orange-500', 'animate-pulse')
  } else {
    dot.classList.add('bg-red-500', 'animate-pulse')
  }

  const text = document.createElement('span')
  text.textContent = season?.name || options.text || ''

  wrapper.appendChild(dot)
  wrapper.appendChild(text)
  container.appendChild(wrapper)
}



