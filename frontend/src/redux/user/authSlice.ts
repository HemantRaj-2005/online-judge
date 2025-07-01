import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  user: null | {
    email: string;
    username: string;
    isVerified: boolean;
    isAuthor: boolean;
    accessToken: string;
  };
}

const initialState: AuthState = {
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<AuthState["user"]>) => {
      state.user = action.payload;
    },
    logout: (state) => {
      state.user = null;
    },
    updateVerification: (state, action: PayloadAction<boolean>) => {
      if (state.user) {
        state.user.isVerified = action.payload;
      }
    },
  },
});

export const { setUser, logout, updateVerification } = authSlice.actions;
export default authSlice.reducer;
