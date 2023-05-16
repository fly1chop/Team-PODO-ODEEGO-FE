import { NextApiRequest, NextApiResponse } from "next";
import queryString from "query-string";

async function getTokenFromKakao(authCode: string) {
  try {
    const tokenUrl = `https://kauth.kakao.com/oauth/token?${queryString.stringify(
      {
        grant_type: "authorization_code",
        client_id: process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY,
        redirect_uri: process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI,
        code: authCode,
      }
    )}`;

    const response: NextApiResponse = await fetch(tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    }).then((res) => res.json());

    return response;
  } catch (err) {
    throw new Error((err as Error).message);
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { authCode } = req.body;

  try {
    const tokenResponse = await getTokenFromKakao(authCode);
    res.status(200).json({ tokenResponse });
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    }
  }
}
