import DirectionsTransitRoundedIcon from "@mui/icons-material/DirectionsTransitRounded";
import { useEffect, useState } from "react";
import styled from "@emotion/styled";

interface NotFoundProps {
  title: string;
  icon: string;
  sxNumber: number;
}

const NotFound = ({ title, icon, sxNumber }: NotFoundProps) => {
  const [iconName, setIconName] = useState(icon);

  useEffect(() => {
    setIconName(icon);
  }, [icon]);

  return (
    <NotFountContainer>
      {iconName === "지하철역" && (
        <DirectionsTransitRoundedIcon sx={{ fontSize: sxNumber }} />
      )}

      <h1>{title}</h1>
    </NotFountContainer>
  );
};
export default NotFound;

const NotFountContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 50vh;
`;
