const sqlite3 = require("sqlite3").verbose();
const http = require("http");

let db = new sqlite3.Database("./back/data.db", (err) => {
  if (err) {
    return console.error(err.message);
  }
});

http
  .createServer((req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, OPTIONS, PUT, PATCH, DELETE"
    ); // If needed
    res.setHeader(
      "Access-Control-Allow-Headers",
      "X-Requested-With,content-type"
    ); // If needed
    res.setHeader("Access-Control-Allow-Credentials", true); // If needed

    if (req.method === "POST") {
      let reqData = "";
      res.writeHead(200, { ContentType: "application/json" });
      req.on("data", (chunk) => {
        reqData += chunk;
        if (reqData.length > 1e6) {
          return;
        }
      });
      req.on("end", () => {
        const request = JSON.parse(reqData);
        db.all(
          "select * from tracks where TrackId >= ? limit ?",
          [request.start, request.limit],
          (err, rows) => {
            res.write(
              JSON.stringify({
                error: err,
                rows: rows,
              })
            );
      		res.end();
          }
        );
      });
    } else {
      res.writeHead(200);
      res.end();
    }
  })
  .listen(8081);
