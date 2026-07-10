const API = (() => {
  const base = window.location.origin;
  let authListeners = [];
  let currentSession = null;

  function getToken() {
    try { const s = JSON.parse(localStorage.getItem('session') || '{}'); return s.access_token; } catch { return null; }
  }

  function setSession(s) {
    currentSession = s;
    if (s) localStorage.setItem('session', JSON.stringify(s));
    else localStorage.removeItem('session');
    authListeners.forEach(cb => cb(s ? 'SIGNED_IN' : 'SIGNED_OUT', s));
  }

  async function api(path, opts = {}) {
    const headers = { 'Content-Type': 'application/json', ...opts.headers };
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    try {
      const res = await fetch(`${base}${path}`, { ...opts, headers, credentials: 'omit' });
      return res.json();
    } catch {
      return { error: 'Network error — is the server running?' };
    }
  }

  function apiForm(path, form) {
    const headers = {};
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return fetch(`${base}${path}`, { method: 'POST', headers, body: form }).then(r => r.json());
  }

  function qs(params) {
    const parts = [];
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null) parts.push(`${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
    }
    return parts.length ? `?${parts.join('&')}` : '';
  }

  function QueryBuilder(table) {
    let filters = {};
    let orderCol = '';
    let orderAsc = true;
    let limitCount = 0;
    let singleResult = false;
    let selectCols = '*';
    let headOnly = false;

    const chain = {
      select(cols) { selectCols = cols || '*'; return chain; },
      eq(col, val) { filters[col] = val; return chain; },
      in(col, vals) { filters[`${col}=in`] = vals?.join(','); return chain; },
      ilike(col, val) { filters[col] = val; return chain; },
      order(col, opts) { orderCol = col; orderAsc = opts?.ascending !== false; return chain; },
      limit(n) { limitCount = n; return chain; },
      maybeSingle() { singleResult = true; return chain; },
      async then(resolve) {
        const params = { ...filters, select: selectCols };
        if (orderCol) params.order = (orderAsc ? '' : '-') + orderCol;
        if (limitCount) params.limit = limitCount;
        if (headOnly) { return resolve({ count: 0, data: null }); }
        const result = await api(`/api/${table}${qs(params)}`);
        const data = result.data || result;
        if (singleResult) return resolve({ data: (Array.isArray(data) ? data[0] : data) || null, error: result.error || null });
        return resolve({ data: Array.isArray(data) ? data : (data ? [data] : []), error: result.error || null });
      },

      // Mutation support
      insert(row) {
        return {
          select() { return this; },
          maybeSingle() { return this; },
          async then(resolve) {
            const result = await api(`/api/${table}`, { method: 'POST', body: JSON.stringify(row) });
            return resolve({ data: result.data || result, error: result.error || null });
          },
        };
      },
      update(row) {
        return {
          eq(col, val) {
            return {
              select() { return this; },
              maybeSingle() { return this; },
              async then(resolve) {
                const id = val;
                const result = await api(`/api/${table}/${id}`, { method: 'PATCH', body: JSON.stringify(row) });
                return resolve({ data: result.data || result, error: result.error || null });
              },
            };
          },
          async then(resolve) {
            if (row.id) {
              const result = await api(`/api/${table}/${row.id}`, { method: 'PATCH', body: JSON.stringify(row) });
              return resolve({ data: result.data || result, error: result.error || null });
            }
            return resolve({ error: 'No id provided for update' });
          },
        };
      },
      delete() {
        return {
          eq(col, val) {
            return {
              async then(resolve) {
                const result = await api(`/api/${table}/${val}`, { method: 'DELETE' });
                return resolve({ data: null, error: result.error || null });
              },
            };
          },
        };
      },
      upsert(row, opts) {
        const conflictCol = opts?.onConflict || 'id';
        return {
          select() { return this; },
          maybeSingle() { return this; },
          async then(resolve) {
            const key = row[conflictCol];
            if (!key) {
              const result = await api(`/api/${table}`, { method: 'POST', body: JSON.stringify(row) });
              return resolve({ data: result.data || result, error: result.error || null });
            }
            const existing = await api(`/api/${table}/${key}`);
            if (existing.data) {
              const result = await api(`/api/${table}/${key}`, { method: 'PATCH', body: JSON.stringify(row) });
              return resolve({ data: result.data || result, error: result.error || null });
            }
            const result = await api(`/api/${table}`, { method: 'POST', body: JSON.stringify(row) });
            return resolve({ data: result.data || result, error: result.error || null });
          },
        };
      },
    };
    // Handle head: true option
    Object.defineProperty(chain, 'head', { get: () => { headOnly = true; return chain; } });
    return chain;
  }

  return {
    from(table) { return QueryBuilder(table); },
    auth: {
      async signUp({ email, password, options }) {
        const body = { email, password, ...(options?.data || {}) };
        const result = await api('/api/auth/signup', { method: 'POST', body: JSON.stringify(body) });
        if (result.data?.session) setSession(result.data.session);
        return result;
      },
      async signInWithPassword({ email, password }) {
        const result = await api('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
        if (result.data?.session) setSession(result.data.session);
        return result;
      },
      async signOut() { setSession(null); return { error: null }; },
      async getSession() {
        try {
          const stored = JSON.parse(localStorage.getItem('session') || '{}');
          if (stored?.access_token) {
            const result = await api('/api/auth/user');
            const user = result.data?.user;
            if (user) {
              const session = { ...stored, user };
              return { data: { session, user } };
            }
            return { data: { session: stored, user: stored.user || null } };
          }
        } catch {}
        return { data: { session: null } };
      },
      async getUser() { return await api('/api/auth/user'); },
      onAuthStateChange(cb) {
        authListeners.push(cb);
        try {
          const stored = JSON.parse(localStorage.getItem('session') || '{}');
          if (stored?.access_token) cb('SIGNED_IN', stored);
        } catch {}
        return { data: { subscription: { unsubscribe: () => { authListeners = authListeners.filter(l => l !== cb); } } } };
      },
    },
    storage: {
      from(bucket) {
        return {
          async upload(path, file) {
            const form = new FormData();
            form.append('file', file);
            form.append('bucket', bucket.split('/')[0]);
            form.append('path', path);
            const result = await apiForm('/api/upload', form);
            return { error: result.error || null, data: result.data };
          },
          getPublicUrl(path) {
            return { data: { publicUrl: `${base}/uploads/${bucket}/${path}` } };
          },
        };
      },
    },
    functions: {
      async invoke(name, opts) {
        if (name === 'domain-check') {
          const result = await api('/api/functions/domain-check', { method: 'POST', body: JSON.stringify(opts?.body || {}) });
          return result;
        }
        if (name === 'domain-check-all') {
          const result = await api('/api/functions/domain-check-all', { method: 'POST', body: JSON.stringify(opts?.body || {}) });
          return result;
        }
        return { data: null, error: 'Unknown function' };
      },
    },
  };
})();

export const supabase = API;
