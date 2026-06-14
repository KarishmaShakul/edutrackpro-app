import { useSelector, useDispatch } from 'react-redux';
import { logoutUser }               from '../store/slices/authSlice.js';
import { useNavigate }              from 'react-router-dom';

export const useAuth = () => {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { user, isAuth, loading } = useSelector(s => s.auth);

  const logout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  return { user, isAuth, loading, logout };
};