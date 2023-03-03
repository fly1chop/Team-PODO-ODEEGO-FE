import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

const API_END_POINT = process.env.NEXT_PUBLIC_API_END_POINT;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  //TODO
  // - groups api로 바꿀 것
  const { memberId } = req.query;
  const { capacity } = req.body;
  const requestUrl = `${API_END_POINT}/api/test/groups?member-id=${memberId}`;

  try {
    const response = await axios({
      url: requestUrl,
      method: "post",
      data: {
        capacity,
      },
    });

    const groupId = response.headers.location.split("/")[4];

    res.status(200).json({ groupId });
  } catch (e) {
    console.error(e);
    res.status(400).send({ error: "Error", status: 400 });
  }
}
