import { BaseSideService } from "@zeppos/zml/base-side";

async function fetchData(res) {
  try {
    // Requesting network data using the fetch API
    // The sample program is for simulation only and does not request real network data, so it is commented here
    // Example of a GET method request
    // const { body: { data = {} } = {} } = await fetch({
    //   url: 'https://xxx.com/api/xxx',
    //   method: 'GET'
    // })
    // Example of a POST method request
    // const { body: { data = {} } = {} } = await fetch({
    //   url: 'https://xxx.com/api/xxx',
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({
    //     text: 'Hello Zepp OS'
    //   })
    // })

    // A network request is simulated here, Reference documentation: https://jsonplaceholder.typicode.com/
    const response = await fetch({
      url: "https://jsonplaceholder.typicode.com/todos/1",
      method: "GET",
    });
    const resBody =
      typeof response.body === "string"
        ? JSON.parse(response.body)
        : response.body;

    res(null, {
      result: resBody,
    });
  } catch (error) {
    res(null, {
      result: "ERROR",
    });
  }
}

AppSideService(
  BaseSideService({
    onInit() {},

    onRequest(req, res) {
      // 顯示手錶傳來的請求類型
      console.log("request method:", req.method);

      // 保留原本取得外部測試資料的功能
      if (req.method === "GET_DATA") {
        fetchData(res);
        return;
      }

      // 接收手錶傳來的心率
      if (req.method === "UPLOAD_HEART_RATE") {
        const { bpm } = req.params || {};

        console.log(`[HEART_RATE] received bpm=${bpm}`);

        // 回覆手錶，表示 Side Service 已收到心率
        res(null, {
          result: {
            received: true,
            bpm,
          },
        });
      }
    },

    onRun() {},

    onDestroy() {},
  }),
);
