import { Provider, useDispatch, useSelector } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { useEffect, useRef } from "react";

import { store } from "./store";
import AppRoutes from "./routes";

import {
  fetchCurrentUser,
} from "./features/Auth/state/authSlice";



function Hydrator({ children }) {
  const dispatch = useDispatch();

  const isHydrating = useSelector(
    (state) => state.auth.isHydrating
  );

  const started = useRef(false);

  useEffect(() => {
    if (started.current) {
      return;
    }

    started.current = true;

    dispatch(fetchCurrentUser());
  }, [dispatch]);

  if (isHydrating) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base">
        <p className="font-mono text-xs uppercase tracking-widest text-textMuted">
          Establishing Secure Session...
        </p>
      </div>
    );
  }

  return children;
}


function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Hydrator>
          <AppRoutes />
        </Hydrator>
      </BrowserRouter>
    </Provider>
  );
}

export default App;