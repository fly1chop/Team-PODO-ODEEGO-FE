import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { CustomError } from "@/constants/custom-error";

const API_END_POINT = process.env.NEXT_PUBLIC_API_END_POINT;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  //TODO
  // - groups api로 바꿀 것
  const { memberId } = req.query;
  const requestUrl = `${API_END_POINT}/api/v1/groups?member-id=${memberId}`;
  console.log(`API routes(/api/v1/group?member-id=): ${requestUrl}`);

  try {
    const { data } = await axios({
      url: requestUrl,
      method: "get",
    });

    console.log(data);

    res.status(200).json(data);
  } catch (e) {
    console.error(e);
    if (axios.isAxiosError(e)) {
      const errorCode = e.response?.data.errorCode;

      res.status(CustomError[errorCode].status).json({
        error: CustomError[errorCode].message,
        status: CustomError[errorCode].status,
      });
    } else {
      res.status(400).json({ error: "NEXT API CALL ERROR", status: 400 });
    }
  }
}
