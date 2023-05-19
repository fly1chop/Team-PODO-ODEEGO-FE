type LocalStorage = typeof window.localStorage;

import {
  ACCESS_TOKEN_KEY,
  LOGOUT_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
} from "@/constants/local-storage";

const isClientSide = () => typeof window !== "undefined";

const storage = (key: string) => {
  return {
    set: (value: string) => {
      if (!isClientSide() || !value) return;
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (err) {
        throw new Error((err as Error).message);
      }
    },
    get: () => {
      if (!isClientSide()) return;

      try {
        const getItemValue = localStorage.getItem(key);
        const storedValue = JSON.parse(getItemValue as string);

        return storedValue;
      } catch (err) {
        throw new Error((err as Error).message);
      }
    },
    remove: () => {
      if (key === "") return;
      if (!isClientSide()) return;

      try {
        localStorage.removeItem(key);
      } catch (err) {
        throw new Error((err as Error).message);
      }
    },
  };
};

export default storage;
export const accessTokenStorage = storage(ACCESS_TOKEN_KEY);
export const logoutTokenStorage = storage(LOGOUT_TOKEN_KEY);
export const refreshTokenStorage = storage(REFRESH_TOKEN_KEY);

export const getLocalStorage = (key: string) => {
  if (key === undefined || key === null) return;
  if (typeof window === "undefined") return;

  const storage: LocalStorage = localStorage;
  try {
    const getItemValue = storage.getItem(key);
    const storedValue = JSON.parse(getItemValue as string);

    return storedValue;
  } catch (err) {
    throw new Error((err as Error).message);
  }
};

export const setLocalStorage = (key: string, value: string) => {
  if (value === undefined || value === null) return;
  if (typeof window === "undefined") return;

  const storage: LocalStorage = localStorage;
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch (err) {
    throw new Error((err as Error).message);
  }
};

export const removeLocalStorage = (key: string) => {
  if (key === "") return;
  if (typeof window === "undefined") return;

  const storage: LocalStorage = localStorage;
  try {
    storage.removeItem(key);
  } catch (err) {
    throw new Error((err as Error).message);
  }
};
