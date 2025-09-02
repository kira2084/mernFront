// src/context/AuthContext.js
import React, {
  createContext,
  useReducer,
  useContext,
  useEffect,
  useState,
} from "react";

const AuthContext = createContext();

const initialState = {
  user: null,
  isAuthenticated: false,
  resetEmail: "",
};

function authReducer(state, action) {
  switch (action.type) {
    case "LOGIN": {
      const { user, token } = action.payload;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      return { ...state, user, isAuthenticated: true };
    }
    case "LOGOUT": {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return { ...state, user: null, isAuthenticated: false };
    }
    case "SET_RESET_EMAIL":
      return { ...state, resetEmail: action.payload };
    case "RESTORE": {
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: !!action.payload.user,
      };
    }
    default:
      return state;
  }
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    // verify token with backend
    fetch("https://mernback-2-x047.onrender.com/api/v1/me", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Token invalid/expired");
        return res.json();
      })
      .then((data) => {
        // if valid, log the user in automatically
        dispatch({
          type: "LOGIN",
          payload: { user: data.user, token },
        });
        setUser(data.user);
      })
      .catch(() => {
        dispatch({ type: "LOGOUT" });
      })
      .finally(() => setLoading(false));
  }, []);
  return (
    <AuthContext.Provider value={{ user, setUser, loading, state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
