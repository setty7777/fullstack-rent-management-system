import apiRequest from "../../../utils/api";

export const loginApi = async (credentials, navigate) => {
  return await apiRequest({
    endpoint: "/auth/login",
    method: "POST",
    body: credentials,
    navigate,
  });
};
