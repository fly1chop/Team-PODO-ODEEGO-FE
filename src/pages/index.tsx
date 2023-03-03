import styled from "@emotion/styled";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Stack,
} from "@mui/material";
import { useEffect, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import { useRouter } from "next/navigation";
import useMultipleInputs from "@/hooks/use-multiple-inputs";
import toast, { Toaster } from "react-hot-toast";
import { useRecoilState, useSetRecoilState } from "recoil";
import { searchState } from "@/recoil/search-state";
import { MidPointApi } from "@/axios/mid-point";
import { COLORS } from "@/constants/css";
import FormInput from "@/components/home/form-input";
import useTimeoutFn from "@/hooks/use-timeout-fn";
import { accessTokenState } from "@/recoil/acess-token-state";
import { GroupsApi } from "@/axios/groups";
import HomeButton from "@/components/home/home-button";
import useModal from "@/hooks/use-modal";
import { isFirstVisitState } from "@/recoil/first-visit-state";
import { MidPointState } from "@/recoil/midpoint-state";
import SelectModal from "@/components/home/modal/select-modal";
import LoginConfirmModal from "@/components/home/modal/login-modal";
import { ERROR_TEXT } from "@/constants/error";
import { STATUS_CODE } from "@/constants/status";
import { ROUTES } from "@/constants/routes";
import { BUTTON_TEXT, MAIN_TEXT, MODAL_TEXT } from "@/constants/component-text";
import { getLocalStorage, setLocalStorage } from "@/utils/storage";
import { COUNT } from "@/constants/local-storage";
import Header from "@/components/layout/header";
import { TestApi } from "@/axios/test";

const { MAIN } = MAIN_TEXT;

const {
  BUTTON_MID_POINT_TEXT,
  BUTTON_GROUPS_ALT_TEXT,
  BUTTON_GROUPS_DEFAULT_TEXT,
} = BUTTON_TEXT;

const { LOGIN_TEXT, CLOSE_TEXT, MAKE_A_GROUP_TEXT } = MODAL_TEXT;

const {
  ERROR_DUPLICATE_START_POINT,
  ERROR_MISSING_START_POINT,
  ERROR_OUT_OF_BOUND,
  ERROR_ALREADY_EXIST_GROUP,
  ERROR_UNSELECT_PEOPLE_COUNT,
} = ERROR_TEXT;

const { ERROR_400 } = STATUS_CODE;

const { SEARCH, LOGIN, MAP, GROUP } = ROUTES;

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [groupId, setGroupId] = useState("");
  const setMidPointResponse = useSetRecoilState(MidPointState);
  const [token, setToken] = useRecoilState(accessTokenState);
  const hasAccessToken = token ? true : false;
  const [addressList, setAddressList] = useRecoilState(searchState);
  const { inputs, addInput, removeInput } = useMultipleInputs();
  const router = useRouter();
  const { openModal } = useModal();
  const setIsFirstVisit = useSetRecoilState(isFirstVisitState);

  const loginModalConfig = {
    children: <LoginConfirmModal />,
    btnText: {
      confirm: LOGIN_TEXT,
      close: CLOSE_TEXT,
    },
    handleConfirm: async () => {
      router.push(`${LOGIN}`);
    },
  };

  const selectModalConfig = {
    children: <SelectModal />,
    btnText: {
      confirm: MAKE_A_GROUP_TEXT,
      close: CLOSE_TEXT,
    },
    handleConfirm: async () => {
      const count = getLocalStorage(COUNT, "");
      if (count === "") {
        toast.error(ERROR_UNSELECT_PEOPLE_COUNT);
        return;
      }
      //모임 생성 Test API
      // - 현재 약속방을 삭제하는 기능이 없음
      // - memberId가 계속 바뀌어야 합니다. 동일한 memberId로 계속 만드는 경우, 이미 존재한다는 에러 발생
      const data = await GroupsApi.postCreateGroup(
        parseInt(token),
        parseInt(count, 10)
      );
      setLocalStorage(COUNT, "");

      if (data.status === ERROR_400) {
        toast.error(ERROR_ALREADY_EXIST_GROUP);
        return;
      }

      const { groupId } = data;
      console.log(`go to the group page : /group/${groupId}`);
      setIsFirstVisit(true);
      router.push(`${GROUP}/${groupId}`);
    },
  };

  useEffect(() => {
    const initGroupId = async () => {
      if (!hasAccessToken) return "";

      //TODO 실제 모임조회 api로 바꾸기
      const data = await GroupsApi.getAll(token);
      const groupId = data?.groups?.[0]?.groupId || "";

      setGroupId(groupId);
      // setGroupId("");
      setLocalStorage(COUNT, "");
    };

    initGroupId();
  }, [hasAccessToken, setGroupId, token]);

  //tmp 더미 회원 생성 메서드
  const createTmpDummyUser = async () => {
    const nickname = "k" + Math.random() + "";

    try {
      const { memberId } = await TestApi.postDummyUser(nickname);
      console.log(memberId);
      setToken(memberId);
    } catch (e) {
      console.error(e);
    }
  };

  const handleInputClickRoute = (index: number) => {
    router.push(`${SEARCH}?id=${index}`);
  };

  const handleButtonClickGroups = async () => {
    if (isLoading) return;
    if (!hasAccessToken) {
      openModal(loginModalConfig);
      return;
    }
    if (groupId) {
      console.log(`go to the group page : /group/${groupId}`);
      router.push(`${GROUP}/${groupId}`);
      return;
    }

    setIsLoading(true);
    openModal(selectModalConfig);
    setIsLoading(false);
  };

  const handleButtonClickMiddlePointSubmit = async () => {
    if (isLoading) return;

    const notEmptyAddressList = addressList
      .filter((a) => a.stationName !== "")
      .map((a) => {
        return {
          stationName: a.stationName.split(" ")[0],
          lat: a.lat,
          lng: a.lng,
        };
      });
    if (notEmptyAddressList.length < 2) {
      toast.error(ERROR_MISSING_START_POINT);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const data = await MidPointApi.postMidPoint(notEmptyAddressList);

    setIsLoading(false);

    if (data.status === ERROR_400) {
      toast.error(ERROR_OUT_OF_BOUND);
    } else if (data.start.length < 2) {
      toast.error(ERROR_DUPLICATE_START_POINT);

      //TODO
      // - 지우기
      console.log(data);
      setMidPointResponse(data);
      setAddressList(notEmptyAddressList);
      router.push(`${MAP}`);
    }
  };

  const { run: debounceMidPoint } = useTimeoutFn({
    fn: async () => {
      handleButtonClickMiddlePointSubmit();
    },
    ms: 500,
  });

  return (
    <>
      <Button onClick={createTmpDummyUser}>Set Token</Button>
      <Header />
      <MainContainer>
        <BorderContainer />
        <TextP>{MAIN}</TextP>
        <Form>
          <Box
            sx={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}>
            {inputs.map((input, index) => (
              <FormInput
                key={index}
                index={index}
                stationName={input.stationName}
                onClick={() => !isLoading && handleInputClickRoute(index)}
                onRemove={(e) => !isLoading && removeInput(e, index)}
              />
            ))}
            {inputs.length < 4 && (
              <IconButton
                aria-label='add'
                sx={{ color: "#b4c9bc" }}
                onClick={(e) => !isLoading && addInput(e)}>
                <AddIcon />
              </IconButton>
            )}
          </Box>
          <LoadingContainer>
            {isLoading && (
              <CircularProgress
                size='4rem'
                sx={{
                  color: "#DBE4D7",
                }}
              />
            )}
          </LoadingContainer>
          <Stack
            spacing={1.5}
            sx={{
              width: "80%",
              textAlign: "center",
              "& span": {
                fontSize: "1.5rem",
              },
            }}>
            <HomeButton
              onClick={debounceMidPoint}
              defaultText={BUTTON_MID_POINT_TEXT}
              color='secondary'
            />
            <span>OR</span>
            <HomeButton
              onClick={handleButtonClickGroups}
              hasCondition={!!groupId}
              defaultText={BUTTON_GROUPS_DEFAULT_TEXT}
              altText={BUTTON_GROUPS_ALT_TEXT}
            />
          </Stack>
          <Toaster />
        </Form>
      </MainContainer>
    </>
  );
}

const MainContainer = styled.main`
  width: 100%;
  max-height: 625px;
  min-height: 509px;
  height: 80vh;
  background-color: ${COLORS.backgroundPrimary};
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: -2px 0 4px -5px #333, 2px 0 4px -5px #333;
  user-select: none;
`;

const TextP = styled.p`
  text-align: center;
  font-size: 1.2rem;
  margin: 4rem 0 3.3rem 0;
  opacity: 0.7;
  color: ${COLORS.semiBlack};
`;

const BorderContainer = styled.div`
  height: 3rem;
  width: 100%;
  background-color: ${COLORS.backgroundPrimary};
  margin-top: -15px;
  border-radius: 20px 20px 0 0;
`;

const Form = styled.form`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
`;

const LoadingContainer = styled.div`
  height: 5rem;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.5rem 0;
`;
