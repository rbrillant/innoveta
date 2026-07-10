import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabase';

export default function AuthGuard({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then((result) => {
      const session = result?.data?.session;
      if (!session) {
        const full = location.pathname + location.search;
        navigate(`/auth?redirect=${encodeURIComponent(full)}`, { replace: true });
      } else {
        setChecking(false);
      }
    });
  }, [navigate, location.pathname, location.search]);

  if (checking) return null;

  return children;
}
