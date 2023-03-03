import { searchProps } from "@/types/search-props";
import axios from "axios";
import HTTP from "./config/axios-instance";

export const MidPointApi = {
  postMidPoint: async (addressList: searchProps[]) => {
    try {
      const { data } = await HTTP.post({
        url: "/v1/mid-point/search",
        data: {
          stations: addressList,
        },
      });

      return data;
    } catch (e) {
      if (axios.isAxiosError(e) && e.response?.status === 400) {
        return { error: "Error: Out of Bound", status: 400 };
      }
    }
  },
};
