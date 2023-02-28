import FormInput from "@/components/common/form-input";
import Header from "@/components/layout/header";
import Main from "@/components/layout/main";
import { COLORS } from "@/constants/css";
import useModal from "@/hooks/use-modal";
import { isFirstVisitState } from "@/recoil/first-visit-state";
import { GroupDetailResponse } from "@/types/api/group";
import styled from "@emotion/styled";
import { Refresh, InsertLink } from "@mui/icons-material";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  IconButton,
  Stack,
} from "@mui/material";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { useRouter } from "next/router";
import { MouseEvent, useCallback, useEffect, useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import { useRecoilState } from "recoil";

interface InputState {
  username: string;
  stationName: string;
  lat: number;
  lng: number;
}

const GroupPage = ({
  data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [inputs, setInputs] = useState<InputState[]>();
  const { openModal } = useModal();
  const [isFirstVisit, setIsFirstVisit] = useRecoilState(isFirstVisitState);
  const { capacity, participants, owner } = data;

  const getInputsByParticipant = useCallback(() => {
    if (participants && participants.length > 0) {
      const inputsByParticipants = participants.map(({ username, start }) => {
        const { stationName, lat, lng } = start;
        return { username, stationName, lat, lng };
      });
      return Array.from(
        { length: capacity },
        (_, i) => inputsByParticipants[i] ?? { username: "", stationName: "" }
      );
    }

    return Array.from(Array(capacity)).fill({
      username: "",
      stationName: "",
    });
  }, [capacity, participants]);

  useEffect(() => {
    const initialInputs = getInputsByParticipant();
    setInputs(initialInputs);
  }, [getInputsByParticipant]);

  const handleInputClick = (username: string) => {
    router.push({
      pathname: "/search",
      query: {
        id: router.query.groupId,
        owner: username === owner,
      },
    });
  };

  const linkModalContent = useCallback(() => {
    const handleCopy = () => {
      navigator.clipboard.writeText(`/search/${router.query.groupId}`);
    };

    return (
      <div>
        <p>링크를 공유해서 주소를 입력받으세요</p>
        <FormInput
          index={0}
          address={`/search/${router.query.groupId}`}
          onClick={handleCopy}
        />
      </div>
    );
  }, [router.query.groupId]);

  const openLinkModal = useCallback(() => {
    openModal({
      children: linkModalContent(),
      handleClose: () => {
        setIsFirstVisit(false);
      },
    });
  }, [linkModalContent, openModal, setIsFirstVisit]);

  useEffect(() => {
    if (isFirstVisit) openLinkModal();
  }, [isFirstVisit, openLinkModal]);

  const handleLink = () => {
    openLinkModal();
  };

  const handleRefresh = () => {
    // TODO: fetch 모임 상세 정보 api
    getInputsByParticipant();
  };

  const handleCancel = () => {
    openModal({
      children: <p>정말로 삭제하시겠습니까?</p>,
      btnText: {
        confirm: "계속",
        close: "취소",
      },
      handleConfirm: () => {
        router.push("/");
        setIsFirstVisit(null);
      },
    });
  };

  const handleSearch = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (participants.length !== capacity) {
      toast.error("아직 주소를 다 못 받았어요..");
      return;
    }

    setIsLoading(true);
    // **TODO: 중간지점 찾기 api 호출
    // **TODO: 모임 삭제 api 호출
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
    await sleep(1000);
    setIsLoading(false);
  };

  return (
    <>
      <Header />
      <Main text='내 모임의 주소 제출 현황'>
        <Container
          sx={{
            maxHeight: "915px",
            overflow: "auto",
            paddingBottom: "2rem",
          }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "1rem",
            }}>
            <CustomIconButton>
              <InsertLink onClick={handleLink} />
            </CustomIconButton>
            <CustomIconButton>
              <Refresh onClick={handleRefresh} />
            </CustomIconButton>
          </Box>
          <form>
            <Stack spacing={1.5}>
              {inputs &&
                inputs.map(({ username, stationName }, index) => (
                  <div key={index}>
                    <FormInput
                      index={index}
                      address={stationName}
                      placeholder='주소가 아직 없어요...'
                      onClick={() => handleInputClick(username)}
                    />
                    <InputLabel>
                      {stationName ? `${username}이 입력했습니다` : ""}
                    </InputLabel>
                  </div>
                ))}
            </Stack>
            <Stack spacing={1.5} sx={{ marginTop: "2rem" }}>
              <CustomButton
                variant='contained'
                color='primary'
                size='large'
                onClick={handleCancel}>
                모임 취소하기
              </CustomButton>
              <CustomButton
                variant='contained'
                color='secondary'
                size='large'
                type='submit'
                onClick={handleSearch}>
                {isLoading ? <CircularProgress size='2rem' /> : "중간지점 찾기"}
              </CustomButton>
            </Stack>
          </form>
        </Container>
        <Toaster />
      </Main>
    </>
  );
};

export default GroupPage;

const InputLabel = styled.span`
  display: inline-block;
  width: 100%;
  font-size: 1rem;
  text-align: right;
`;

const CustomButton = styled(Button)`
  font-size: 1.3rem;
`;

const CustomIconButton = styled(IconButton)`
  color: ${COLORS.altGreen};

  > svg {
    font-size: 2rem;
  }
`;

export const getServerSideProps = async ({
  params,
}: GetServerSidePropsContext) => {
  // 404 Page if no params
  if (!params) {
    return {
      notFound: true,
    };
  }

  const groupId = params.groupId;
  // **TODO: 모임 정보 api 호출 endpoint로 교체
  const res = await fetch(
    `https://63fb17c14e024687bf71cf31.mockapi.io/group/${groupId}`
  );

  const data: GroupDetailResponse = await res.json();

  // Redirect home if no data
  if (!data) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {
      data,
    },
  };
};
