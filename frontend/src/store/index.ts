import { configureStore } from "@reduxjs/toolkit";
import { type TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { combineReducers } from "@reduxjs/toolkit";
import { authReducer } from "./slices/authSlice";
import { assessmentReducer } from "./slices/assessmentSlice";
import violationsReducer from "./slices/violationsSlice";
import { apiSlice } from "./apiSlice";
import { setAuthTokenGetter } from "../api";

// Create the combined reducer including API slice
const rootReducer = combineReducers({
    auth: authReducer,
    assessment: assessmentReducer,
    violations: violationsReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
});

const persistConfig = {
    storage,
    key: "root",
    whitelist: ["auth", "violations"]
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [
                    "persist/PERSIST",
                    "persist/REHYDRATE",
                    "persist/PAUSE",
                    "persist/PURGE",
                    "persist/REGISTER",
                    "persist/FLUSH"
                ]
            }
        }).concat(apiSlice.middleware)
});

export const persistor = persistStore(store);

// Set up the auth token getter after store is created
setAuthTokenGetter(() => store.getState().auth.token);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch
export const useAppDispatch: () => typeof store.dispatch = () =>
    useDispatch<typeof store.dispatch>();

export const useAppSelector: TypedUseSelectorHook<
    ReturnType<typeof store.getState>
> = useSelector;