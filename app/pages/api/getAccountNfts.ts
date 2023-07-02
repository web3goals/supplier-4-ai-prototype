import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const address = req.query.address;
    const network = req.query.network;
    const { data } = await axios.get(
      "https://knn3-gateway.knn3.xyz/data-api/api/addresses/holdNfts",
      {
        params: {
          address: address,
          network: network,
        },
        headers: {
          "auth-key": process.env.NEXT_PUBLIC_KNN3_API_KEY,
          Accept: "application/json",
        },
      }
    );
    return res.status(200).json({ data: data });
  } catch (error: any) {
    if (error.response) {
      return res.status(500).json({
        error: {
          data: error.response.data,
          status: error.response.status,
          headers: error.response.headers,
        },
      });
    }
    return res.status(500).json({ error: error.toString() });
  }
}
