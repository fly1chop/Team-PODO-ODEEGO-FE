import { atom } from "recoil";

export const tokenRecoilState = atom<string>({
  key: "test",
  default: "testToken",
});

export const testState2 = atom<unknown>({
  key: "test2",
  default: "",
});
