import urls from "../../Global/constants/UrlConstants";
import { getCallParams, getFileCallParams, makeCall } from "../../utils/Service";



export async function getPerosnalDetails(userId: String) {
    try {
      const callParams = await getCallParams("GET");
      const response = await makeCall(
        urls.GETEMPLOYEERECORDBYID + userId,
        callParams
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  export async function ImageUpLoad(file: any) {
    try {
      const callParams = await getFileCallParams(file);
      const response = await makeCall(urls.IMAGEUPLOAD, callParams);
      return response;
    } catch (error) {
      throw error;
    }
  }

  export async function updatePersonalDetail(body: any) {
    try {
      const callParams = await getCallParams("PUT", body);
      const response = await makeCall(
        urls.UPDATEEMPLOYEEPERSONALDETAIL,
        callParams
      );
      return response;
    } catch (error) {
      throw error;
    }
  }