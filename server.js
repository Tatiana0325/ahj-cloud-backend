const Instance = require("./Instance");
const http = require("http");
const Koa = require("koa");
const Router = require("koa-router");
const WS = require("ws");

const app = new Koa();

app.use(async (ctx, next) => {
  const origin = ctx.request.get("Origin");
  if (!origin) {
    return await next();
  }

  const headers = { "Access-Control-Allow-Origin": "*" };

  if (ctx.request.method !== "OPTIONS") {
    ctx.response.set({ ...headers });
    try {
      return await next();
    } catch (e) {
      e.headers = { ...e.headers, ...headers };
      throw e;
    }
  }

  if (ctx.request.get("Access-Control-Request-Method")) {
    ctx.response.set({
      ...headers,
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH",
    });

    if (ctx.request.get("Access-Control-Request-Headers")) {
      ctx.response.set(
        "Access-Control-Allow-Headers",
        ctx.request.get("Access-Control-Request-Headers")
      );
    }
    ctx.response.status = 204;
  }
});

const router = new Router();
const server = http.createServer(app.callback());
const wsServer = new WS.Server({ server });

wsServer.on("connection", (ws, req) => {
  ws.on("message", async (msg) => {
    const message = JSON.parse(msg);
    if (message.type === "create") {
      ws.send(
        JSON.stringify({
          type: "received",
          data: {
            date: new Date().toLocaleString(),
            info: 'Received "Create command"',
            id: "Id will be assign",
          },
        })
      );
      setTimeout(async () => {
        const instance = new Instance();
        await instance.save();
        const instances = await Instance.getAll();
        ws.send(
          JSON.stringify({
            type: "created",
            data: {
              instances,
              date: new Date().toLocaleString(),
              info: "Created",
              id: instance.id,
            },
          })
        );
      }, 20000);
      return;
    } else if (message.type === "delete") {
      ws.send(
        JSON.stringify({
          type: "received",
          data: {
            date: new Date().toLocaleString(),
            info: 'Received "Delete command"',
            id: message.data.id,
          },
        })
      );
      setTimeout(async () => {
        await Instance.delete(message.data.id);
        const instances = await Instance.getAll();
        ws.send(
          JSON.stringify({
            type: "removed",
            data: {
              instances,
              date: new Date().toLocaleString(),
              info: "Removed",
              id: message.data.id,
            },
          })
        );
      }, 20000);
      return;
    } else if (message.type === "start") {
      ws.send(
        JSON.stringify({
          type: "received",
          data: {
            date: new Date().toLocaleString(),
            info: 'Received "Start command"',
            id: message.data.id,
          },
        })
      );
      setTimeout(async () => {
        await Instance.start(message.data.id);
        const instances = await Instance.getAll();
        ws.send(
          JSON.stringify({
            type: "startted",
            data: {
              instances,
              date: new Date().toLocaleString(),
              info: "Started",
              id: message.data.id,
            },
          })
        );
      }, 20000);
      return;
    } else if (message.type === "stop") {
      ws.send(
        JSON.stringify({
          type: "received",
          data: {
            date: new Date().toLocaleString(),
            info: 'Received "Stop command"',
            id: message.data.id,
          },
        })
      );
      setTimeout(async () => {
        await Instance.stop(message.data.id);
        const instances = await Instance.getAll();
        ws.send(
          JSON.stringify({
            type: "stopped",
            data: {
              instances,
              date: new Date().toLocaleString(),
              info: "Stopped",
              id: message.data.id,
            },
          })
        );
      }, 20000);
      return;
    }
  });
});

app.use(router.routes()).use(router.allowedMethods());
const port = process.env.PORT || 7070;
server.listen(port);
