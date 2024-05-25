import axios from "axios";
import https from "https";
import iconv from "iconv-lite";
import gsif, { SchoolInfo } from "./getschoolinfo";

const euckr_urlencode = (str: string) => {
  var buf = iconv.encode(str, "euc-kr");
  var encodedStr = "";
  for (var i = 0; i < buf.length; i++) {
    encodedStr += "%" + buf[i].toString(16);
  }
  return encodedStr;
};

/**
 * 학교 검색
 * @param query 검색할 학교 이름
 * @returns 학교알리미에서 사용하는 학교 코드
 */
export default async function searchSchool(
  query: string,
  getSchoolInfo: boolean = false
) {
  const instance = axios.create({
    httpsAgent: new https.Agent({
      rejectUnauthorized: false,
    }),
    responseType: "arraybuffer",
  });
  const res = await instance.post(
    "https://www.schoolinfo.go.kr/ei/ss/Pneiss_f01_l0.do",
    `SEARCH_GS_HANGMOK_CD=&SEARCH_GS_HANGMOK_NM=&SEARCH_SCHUL_NM=${euckr_urlencode(
      query
    )}&SEARCH_GS_BURYU_CD=&SEARCH_SIGUNGU=&SEARCH_SIDO=&SEARCH_FOND_SC_CODE=&SEARCH_MODE=&SEARCH_TYPE=1&pageNumber=1&SEARCH_KEYWORD=${euckr_urlencode(
      query
    )}`,
    {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  const data = iconv
    .decode(res.data, "EUC-KR")
    .toString()
    .replaceAll(`\r`, "")
    .replaceAll(`\n`, "")
    .replaceAll(`\t`, "");
  let schoolCodes: (
    | string
    | {
        code: string;
        info: SchoolInfo | string;
      }
  )[] = data
    .split(`$("#searchParamFrm #HG_CD").val('`)
    .map((e: string) => e.split(`'`)[0])
    .filter((e: string) => e.length == 10); // check is alphabet or number
  if (getSchoolInfo) {
    let schoolInfos = [];
    for (const schoolCode of schoolCodes) {
      const res = await gsif(schoolCode as string);
      if (res.s) {
        schoolInfos.push(res.r);
      } else {
        schoolInfos.push("error");
      }
    }
    schoolCodes = schoolCodes.map((e, i) => {
      return {
        code: e,
        info: schoolInfos[i],
      };
    }) as {
      code: string;
      info: SchoolInfo | string;
    }[];
  }
  return {
    s: true,
    data: schoolCodes,
  };
}
