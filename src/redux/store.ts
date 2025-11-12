import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import credientialReducer from './slices/credientialSlice';
import dashbordReducer from './slices/dashboardSlice';


export const store = configureStore({
  reducer: {
    user: userReducer,
    credential: credientialReducer,
    dashboard : dashbordReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
