const ROLE_STYLES = {
  system: 'bg-red-100 text-red-800 border border-red-300 font-bold',
  super_admin: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
  admin: 'bg-gray-900 text-white',
  editor: 'bg-blue-100 text-blue-700',
  viewer: 'bg-gray-100 text-gray-600',
};

const ROLE_LABELS = {
  system: 'System Admin',
  super_admin: 'Super Admin',
  admin: 'Admin',
  editor: 'Editor',
  viewer: 'Viewer',
};

export function createRoleBadge(role) {
  const roleKey = typeof role === 'string' ? role : (role.name || role.value || '');
  const span = document.createElement('span');
  span.className = `inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${ROLE_STYLES[roleKey] || 'bg-gray-100 text-gray-600'}`;
  span.textContent = ROLE_LABELS[roleKey] || roleKey;
  return span;
}

export function renderRoleBadges(roles) {
  if (!roles || !roles.length) return '—';
  return roles.map(r => {
    const roleKey = typeof r === 'string' ? r : (r.name || r.value || '');
    const style = ROLE_STYLES[roleKey] || 'bg-gray-100 text-gray-600';
    const label = ROLE_LABELS[roleKey] || roleKey;
    return `<span class="inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${style} mr-1">${label}</span>`;
  }).join('');
}
