import { useRouter } from "next/router";
import { useEffect } from "react";
import styled from "@emotion/styled";
import { accessTokenStorage, logoutTokenStorage } from "@/utils/storage";
import Header from "@/components/layout/header";
import fetch from "node-fetch";
import { InferGetServerSidePropsType, GetServerSideProps } from "next";
import { useAuthQuery } from "@/axios/user";
import { CircularProgress } from "@mui/material";
import Main from "@/components/layout/main";

interface TokenResponse {
  tokenResponse: {
    access_token: string;
    refresh_token: string;
  };
}

export const getServerSideProps: GetServerSideProps<TokenResponse> = async (
  context
) => {
  const { NEXT_PUBLIC_URL } = process.env;

  const loginKakao = `/api/kakao-login`;

  const { code: authCode } = context.query;

  const responseKakao = await fetch(NEXT_PUBLIC_URL + loginKakao, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ authCode }),
  });

  const { tokenResponse } = (await responseKakao.json()) as TokenResponse;

  // const loginAuthUrl = `/api/auth/login`;

  // await fetch(NEXT_PUBLIC_URL + loginAuthUrl, {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json",
  //   },
  //   body: JSON.stringify(tokenResponse),
  // });

  return {
    props: {
      tokenResponse,
    },
  };
};

const Kakao = (
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) => {
  const router = useRouter();
  const kakaoAccessToken = props.tokenResponse.access_token;
  const { isSuccess, data } = useAuthQuery(kakaoAccessToken);

  useEffect(() => {
    if (!isSuccess) return;

    const { accessToken, memberType } = data;
    accessTokenStorage.set(accessToken);
    logoutTokenStorage.set(accessToken);

    memberType === "PRE" ? router.replace("/mypage") : router.replace("/");
  }, [data, isSuccess, router]);

  // useEffect(() => {
  //   const fetchKaokaoUserData = async () => {
  //     try {
  //       if (authCode) {
  //         logoutTokenStorage.get(props.tokenResponse.access_token);
  //         if (window.performance && performance.navigation.type !== 1) {
  //           const loginBackendUrl = `${process.env.NEXT_PUBLIC_API_END_POINT_ODEEGO}/api/v1/auth/user/me`;
  //           const { data } = await axiosInstanceWitToken.post(loginBackendUrl);
  //           accessTokenStorage.set(data.accessToken);
  //         } else {
  //           console.error("The page is reloaded");
  //         }
  //       }
  //     } catch (err) {
  //       throw new Error((err as Error).message);
  //     }
  //   };
  //   fetchKaokaoUserData();
  // }, [authCode, router]);

  return (
    <SignUpContainer>
      <Header token={kakaoAccessToken} />
      <Main text=''>
        <Container>
          <CircularProgress />
        </Container>
      </Main>
      {/* <SignUpTitle>가까운 지하철역을 입력해주세요. ^^</SignUpTitle>
      <SignUpSearchInput /> */}
    </SignUpContainer>
  );
};
export default Kakao;

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

// const SignUpTitle = styled.h1`
//   font-size: 14px;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   margin-top: 50px;
//   margin-bottom: 50px;
// `;

const SignUpContainer = styled.div`
  width: 43rem;
  margin: 0 auto;
`;
