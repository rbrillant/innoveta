import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabase';

export default function AuthGuard({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate(`/auth?redirect=${encodeURIComponent(location.pathname)}`, { replace: true });
      } else {
        setChecking(false);
      }
    });
  }, [navigate, location.pathname]);

  if (checking) return null;

  return children;
}
