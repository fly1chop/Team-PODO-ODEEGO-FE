import { useRouter } from "next/router";
import React, { useEffect } from "react";
import SignUpSearchInput from "@/components/signup/signup-search";
import styled from "@emotion/styled";
import { COLORS } from "@/constants/css";
import Header from "@/components/layout/header";
// import Header from "@/components/layout/header";

const Kakao = () => {
  const router = useRouter();
  const { code: authCode } = router.query;

  const { pathname } = router;

  useEffect(() => {
    try {
      const NewTest = async () => {
        console.log(pathname);
        if (authCode) {
          const response = await fetch(`/api/kakao-login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ authCode }),
          });

          const data = await response.json();
          console.log(data);

          const res = await fetch(
            // 배포 서버
            `https://odeego.shop/api/v1/auth/user/me`,
            // 배포 서버
            // `https://52.78.224.123:8080/api/v1/auth/user/me`,
            // 개인 서버
            // `http://15.165.99.21:8080/api/v1/auth/user/me`,
            {
              headers: {
                Authorization: `Bearer ${data.tokenResponse.access_token}`,
              },
              method: "POST",
            }
          );

          const data3 = await res.json();
          console.log(data3);

          localStorage.setItem("token", data3.accessToken);
        }
      };

      NewTest();
    } catch (e) {
      alert(e);
    }
  }, [router]);

  // console.log(userImage);

  return (
    <SignUpContainer>
      <Header />
      <BorderContainer />
      <SignUpTitle>가까운 지하철역을 입력해주세요. ^^</SignUpTitle>

      <SignUpSearchInput />
    </SignUpContainer>
  );
};
export default Kakao;

const SignUpTitle = styled.h1`
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 50px;
  margin-bottom: 50px;
`;

const BorderContainer = styled.div`
  height: 25px;
  width: 100%;
  background-color: ${COLORS.backgroundPrimary};
  margin-top: -15px;
  border-radius: 20px 20px 0 0;
`;

const SignUpContainer = styled.div`
  width: 100%;
  margin: 0 auto;
`;
