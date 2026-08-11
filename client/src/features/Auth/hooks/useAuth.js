import { useSelector, useDispatch } from "react-redux";
import { useCallback } from "react";

import {
  loginThunk,
  registerThunk,
  logoutThunk,
} from "../state/authSlice";

export function useAuth() {
  const dispatch = useDispatch();

  const {
    user,
    status,
    isHydrating,
    error,
  } = useSelector((state) => state.auth);

  const login = useCallback(
    (credentials) => {
      return dispatch(loginThunk(credentials)).unwrap();
    },
    [dispatch]
  );

  const register = useCallback(
    (details) => {
      return dispatch(registerThunk(details)).unwrap();
    },
    [dispatch]
  );

  const logout = useCallback(() => {
    return dispatch(logoutThunk()).unwrap();
  }, [dispatch]);

  return {
    user,

    isAuthenticated: Boolean(user),

    isLoading: status === "loading",

    isHydrating,

    error,

    login,

    register,

    logout,
  };
}