import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { hydrateThunk } from "../state/authSlice";

export default function AuthHydrator({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(hydrateThunk());
  }, [dispatch]);

  return children;
}