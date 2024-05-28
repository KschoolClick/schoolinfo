import axios from "axios";
import https from "https";
import iconv from "iconv-lite";

export interface SchoolInfo {
  name: string;
  estDiv: string;
  estType: string;
  estDate: string;
  genNumber: string;
  homepage: string;
  address: string;
  studentCnt: number;
}

/**
 * 학교 상세정보 조회
 * @param schoolId 나이스에 등록된 학교 아이디 (ex. G100000485)
 * @returns 학교 알리미를 통해 열람할 수 있는 학교 정보
 */
export default async function getSchoolInfo(schoolId: string): Promise<
  | { s: true; r: SchoolInfo }
  | {
      s: false;
      e: string;
    }
> {
  const instance = axios.create({
    httpsAgent: new https.Agent({
      rejectUnauthorized: false,
    }),
    responseType: "arraybuffer",
  });
  const res = await instance.get(
    "https://www.schoolinfo.go.kr/ei/ss/Pneiss_b01_s0.do?VIEWMODE=3&PRE_JG_YEAR=&HG_CD=" +
      schoolId,
    {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
      },
    }
  );
  if (res.status !== 200 || !res.data) {
    return {
      s: false,
      e: "invalid schoolId",
    };
  }
  const data = iconv
    .decode(res.data, "EUC-KR")
    .toString()
    .replaceAll(`\r`, "")
    .replaceAll(`\n`, "")
    .replaceAll(`\t`, "");

  return {
    s: true,
    r: {
      name: data.split(`')" title="`)[1]!.split(" ")[0],
      estDiv: data.split("설립구분 :</span>")[1]!.split("</span>")[0],
      estType: data.split("설립유형 :</span>")[1]!.split("</span>")[0],
      estDate: data.split("설립일자 :</span>")[1]!.split("</span>")[0],
      genNumber: data.split("대표번호 :</span>")[1]!.split("</span>")[0],
      homepage: data.split(` 홈페이지 새창">`)[1]!.split("<")[0],
      address: data.split("주소 :</span>")[1]!.split("</span>")[0],
      studentCnt: parseInt(
        data
          .split(`<tbody>`)[1]!
          .split(`</tbody>`)[0]!
          .replaceAll(`<td role="row">`, "")
          .split(`</td>`)[2]
      ),
    },
  };
}
