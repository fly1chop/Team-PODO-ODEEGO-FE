// const checkLogin = (currentUser: any) => {
//   return currentUser instanceof Object;
// };
// export default checkLogin;

import { accessTokenStorage } from "@/utils/storage";

const useAuth = () => {
  const isAuthed = !!accessTokenStorage.get();

  const setAuth = (token: string) => {
    accessTokenStorage.set(token);
  };

  const removeAuth = () => {
    accessTokenStorage.remove();
  };

  return {
    isAuthed,
    setAuth,
    removeAuth,
  };
};

export default useAuth;
