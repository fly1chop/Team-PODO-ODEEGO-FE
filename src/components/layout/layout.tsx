import { SIZE } from "../../constants/css";
import styled from "@emotion/styled";
import GlobalModal from "@/components/common/global-modal";
import React from "react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Container>
      <GlobalModal />
      {children}
    </Container>
  );
};

export default Layout;

const Container = styled.div`
  max-height: ${SIZE.height};
  min-width: 320px;
  max-width: ${SIZE.width};
  margin: auto;
  box-sizing: border-box;
`;
