import HTTP from "./config/axios-instance";

export const MidPointApi = {
  postMidPoint: async () => {
    try {
      const { data } = await HTTP.post({
        //TODO
        // - mid-point api로 바꿀 것
        url: "/v1/mid-point/search",
        data: {
          message: "kal",
        },
      });

      return data;
    } catch (e) {
      console.error(e);
    }
  },
};
