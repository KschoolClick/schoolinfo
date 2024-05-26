# schoolinfo

## Installing
Using npm:
```
npm install schoolinfo
```
Using yarn:
```
yarn add schoolinfo
```

## Example
```ts
import { getSchoolInfo, searchSchool } from "schoolinfo";

// Search schools with a given query
searchSchool("유성").then((res) => {
  console.log(res);
  res.data.forEach((school) => {
    // Get school detail info
    getSchoolInfo(school as string).then((info) => {
      console.log(info);
    });
  });
});
```
