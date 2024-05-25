import { getSchoolInfo, searchSchool } from "../package";

searchSchool("유성").then((res) => {
  console.log(res);
  res.data.forEach((school) => {
    getSchoolInfo(school as string).then((info) => {
      console.log(info);
    });
  });
});
