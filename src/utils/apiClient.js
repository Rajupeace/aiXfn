const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const headersJson = { 'Content-Type': 'application/json' };

function getAuthHeaders() {
  const headers = {};

  if (typeof window !== 'undefined' && window.localStorage) {
    const adminToken = window.localStorage.getItem('adminToken');
    const facultyToken = window.localStorage.getItem('facultyToken');
    const userData = window.localStorage.getItem('userData');

    console.log('[apiClient] Getting auth headers:', {
      hasAdminToken: !!adminToken,
      hasFacultyToken: !!facultyToken,
      hasUserData: !!userData
    });

    if (adminToken) {
      headers['x-admin-token'] = adminToken;
      console.log('[apiClient] Admin token added to headers');
    } else if (userData) {
      try {
        const parsedUserData = JSON.parse(userData);
        if (parsedUserData.role === 'admin') {
          console.error('[apiClient] CRITICAL: Admin user detected but adminToken missing from localStorage!');
          console.error('[apiClient] Please log out and log in again to refresh your session.');
        }
      } catch (e) {
        console.error('[apiClient] Failed to parse userData:', e);
      }
    }

    if (facultyToken) {
      headers['x-faculty-token'] = facultyToken;
      console.log('[apiClient] Faculty token added to headers');
    }
  } else {
    console.error('[apiClient] localStorage is not available');
  }

  return headers;
}

export async function apiGet(path) {
  if (!API_URL) throw new Error('API_URL not configured');
  const res = await fetch(`${API_URL.replace(/\/$/, '')}${path}`, { headers: { ...getAuthHeaders() } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errorMsg = data.details || data.error || `GET ${path} failed: ${res.status}`;
    throw new Error(errorMsg);
  }
  return data;
}

export async function apiPost(path, body) {
  if (!API_URL) throw new Error('API_URL not configured');
  const res = await fetch(`${API_URL.replace(/\/$/, '')}${path}`, {
    method: 'POST',
    headers: { ...headersJson, ...getAuthHeaders() },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errorMsg = data.details || data.error || `POST ${path} failed: ${res.status}`;
    throw new Error(errorMsg);
  }
  return data;
}

export async function apiPut(path, body) {
  if (!API_URL) throw new Error('API_URL not configured');
  const res = await fetch(`${API_URL.replace(/\/$/, '')}${path}`, {
    method: 'PUT',
    headers: { ...headersJson, ...getAuthHeaders() },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errorMsg = data.details || data.error || `PUT ${path} failed: ${res.status}`;
    throw new Error(errorMsg);
  }
  return data;
}

export async function apiDelete(path) {
  if (!API_URL) throw new Error('API_URL not configured');
  const res = await fetch(`${API_URL.replace(/\/$/, '')}${path}`, { method: 'DELETE', headers: { ...getAuthHeaders() } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errorMsg = data.details || data.error || `DELETE ${path} failed: ${res.status}`;
    throw new Error(errorMsg);
  }
  return data;
}

export async function apiUpload(path, formData) {
  if (!API_URL) throw new Error('API_URL not configured');
  const res = await fetch(`${API_URL.replace(/\/$/, '')}${path}`, {
    method: 'POST',
    body: formData,
    headers: { ...getAuthHeaders() },
  });
  if (!res.ok) throw new Error(`UPLOAD ${path} failed: ${res.status}`);
  return res.json();
}

export async function adminLogin(adminId, password) {
  if (!API_URL) throw new Error('API_URL not configured');
  try {
    const res = await fetch(`${API_URL.replace(/\/$/, '')}/api/admin/login`, {
      method: 'POST', headers: headersJson, body: JSON.stringify({ adminId, password })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || `Login failed: ${res.status}`);
    }
    return data;
  } catch (error) {
    console.error('Admin login API error:', error);
    throw error;
  }
}

export async function facultyLogin(facultyId, password) {
  if (!API_URL) throw new Error('API_URL not configured');
  try {
    const res = await fetch(`${API_URL.replace(/\/$/, '')}/api/faculty/login`, {
      method: 'POST', headers: headersJson, body: JSON.stringify({ facultyId, password })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || `Faculty login failed: ${res.status}`);
    }
    return data;
  } catch (error) {
    console.error('Faculty login API error:', error);
    throw error;
  }
}

export async function facultyLogout() {
  if (!API_URL) throw new Error('API_URL not configured');
  const res = await fetch(`${API_URL.replace(/\/$/, '')}/api/faculty/logout`, {
    method: 'POST',
    headers: { ...getAuthHeaders() }
  });
  if (!res.ok) throw new Error('faculty logout failed');
  return res.json();
}

export async function adminLogout() {
  if (!API_URL) throw new Error('API_URL not configured');
  const res = await fetch(`${API_URL.replace(/\/$/, '')}/api/admin/logout`, { method: 'POST', headers: { ...getAuthHeaders() } });
  if (!res.ok) throw new Error('admin logout failed');
  return res.json();
}

const client = { apiGet, apiPost, apiPut, apiDelete, apiUpload, adminLogin, adminLogout, facultyLogin, facultyLogout };
export default client;
