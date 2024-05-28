import { getSchoolInfo, searchSchool } from "../package";

(async () => {
  const startTime = Date.now();
  let d = await searchSchool("유성중", true);
  console.log(d, Date.now() - startTime);
})();
