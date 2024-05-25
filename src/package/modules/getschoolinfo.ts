import axios from "axios";
import https from "https";
import iconv from "iconv-lite";

export interface SchoolInfo {
  학교이름: string;
  설립구분: string;
  설립유형: string;
  설립일자: string;
  대표번호: string;
  홈페이지: string;
  주소: string;
  학생수: {
    교원1인당: number;
    학급당: number;
    전체: number;
  };
}

/**
 * 학교 상세정보 조회
 * @param schoolId 나이스에 등록된 학교 아이디 (ex. G100000485)
 * @returns 학교 알리미를 통해 열람할 수 있는 학교 정보
 */
export default async function getSchoolInfo(
  schoolId: string
): Promise<{ s: boolean; r: SchoolInfo | string }> {
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
      r: "invalid schoolId",
    };
  }
  const data = iconv
    .decode(res.data, "EUC-KR")
    .toString()
    .replaceAll(`\r`, "")
    .replaceAll(`\n`, "")
    .replaceAll(`\t`, "");

  const stcnt = data
    .split(`<tbody>`)[1]!
    .split(`</tbody>`)[0]!
    .replaceAll(`<td role="row">`, "")
    .split(`</td>`)
    .map((e) => parseFloat(e));

  return {
    s: true,
    r: {
      학교이름: data.split(`')" title="`)[1]!.split(" ")[0],
      설립구분: data.split("설립구분 :</span>")[1]!.split("</span>")[0],
      설립유형: data.split("설립유형 :</span>")[1]!.split("</span>")[0],
      설립일자: data.split("설립일자 :</span>")[1]!.split("</span>")[0],
      대표번호: data.split("대표번호 :</span>")[1]!.split("</span>")[0],
      홈페이지: data.split(` 홈페이지 새창">`)[1]!.split("<")[0],
      주소: data.split("주소 :</span>")[1]!.split("</span>")[0],
      학생수: {
        교원1인당: stcnt[0],
        학급당: stcnt[1],
        전체: stcnt[2],
      },
    },
  };
}
