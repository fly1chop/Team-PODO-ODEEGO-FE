import AddressForm from "@/components/home/address-form";
import Header from "@/components/layout/header";
import Main from "@/components/layout/main";
import useModal from "@/hooks/use-modal";
import { isFirstVisitState } from "@/recoil/first-visit-state";
import { Button } from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSetRecoilState } from "recoil";

export default function Home() {
  // useModal 훅 사용 예시입니다. 작업할땐 삭제해주세요. (line 9 - line 39)
  const setIsFirstVisit = useSetRecoilState(isFirstVisitState);
  const { openModal } = useModal();
  const router = useRouter();

  const modalContent = () => {
    return (
      <>
        <p>로그인을 먼저해주세요</p>
        <div>
          <p>로그인을 먼저해주세요</p>
          <p>로그인을 먼저해주세요</p>
        </div>
      </>
    );
  };

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const handleOpenModal = () => {
    openModal({
      children: modalContent(),
      btnText: {
        confirm: "로그인하기",
        close: "취소",
      },
      handleConfirm: async () => {
        await sleep(1000);
        setIsFirstVisit(true);
        router.push(`/group/${3}`);
      },
    });
  };

  const MAIN_TEXT = "만날 사람 주소를 추가해주세요";

  return (
    <>
      <Header />
      <Main text={MAIN_TEXT}>
        <AddressForm />
      </Main>
      <Button onClick={handleOpenModal}>Make Group</Button>
      <div>
        <Link href='/search'>search</Link>
      </div>
      <div>
        <Link href='/place'>place</Link>
      </div>
    </>
  );
}
