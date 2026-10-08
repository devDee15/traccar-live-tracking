async function request(path, options = {}) {
  const response = await fetch(`/api${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'content-type': 'application/json' } : {}),
      ...options.headers,
    },
  });

  const body = response.status === 204 ? null : await response.json();
  if (!response.ok) throw new Error(body?.error?.message || `Request failed (${response.status})`);
  return body;
}

export const api = {
  vehicles() {
    return request('/vehicles?limit=100');
  },

  latest(vehicleId) {
    return request(`/tracking/latest/${vehicleId}`);
  },
};
