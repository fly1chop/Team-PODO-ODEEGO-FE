import { useQuery } from "@tanstack/react-query";
import HTTP from "./config/axios-instance";

interface AuthenticationResponse {
  accessToken: string;
  refreshToken: string;
  memberType: "PRE" | "REGULAR";
  profileImageUrl: string;
}
export const UserApi = {
  authUser: async (kakaoAccessToken: string) => {
    try {
      const data: AuthenticationResponse = await HTTP.post({
        url: `${process.env.NEXT_PUBLIC_API_END_POINT}/api/v1/auth/user/me`,
        headers: {
          Authorization: `Bearer ${kakaoAccessToken}`,
        },
      });

      return data;
    } catch (e) {
      throw e;
    }
  },
};

export const useAuthQuery = (kakaoAccessToken: string) => {
  return useQuery(["kakaoAccessToken"], () =>
    UserApi.authUser(kakaoAccessToken)
  );
};
