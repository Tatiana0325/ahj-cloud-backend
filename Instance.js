const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const path = require("path");

class Instance {
  constructor() {
    this.id = uuidv4();
    this.state = "stopped";
  }

  async save() {
    const tikets = await Instance.getAll();
    tikets.push(this.toJSON());
    return new Promise((resolve, reject) => {
      fs.writeFile(
        path.join(__dirname, "public", "dateBase.json"),
        JSON.stringify(tikets),
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  }

  toJSON() {
    return {
      id: this.id,
      state: this.state,
    };
  }

  static getAll() {
    return new Promise((resolve, reject) => {
      fs.readFile(
        path.join(__dirname, "public", "dateBase.json"),
        "utf-8",
        (err, content) => {
          if (err) {
            reject(err);
          } else {
            resolve(JSON.parse(content));
          }
        }
      );
    });
  }

  static async getById(id) {
    const tikets = await Instance.getAll();
    return tikets.find((elem) => elem.id === id);
  }

  static async start(id) {
    const instances = await Instance.getAll();
    const idx = instances.findIndex((elem) => elem.id === id);
    instances[idx].state = "running";

    return new Promise((resolve, reject) => {
      fs.writeFile(
        path.join(__dirname, "public", "dateBase.json"),
        JSON.stringify(instances),
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  }

  static async stop(id) {
    const instances = await Instance.getAll();
    const idx = instances.findIndex((elem) => elem.id === id);
    instances[idx].state = "stopped";

    return new Promise((resolve, reject) => {
      fs.writeFile(
        path.join(__dirname, "public", "dateBase.json"),
        JSON.stringify(instances),
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  }

  static async delete(id) {
    let instances = await Instance.getAll();
    instances = instances.filter((elem) => elem.id !== id);

    return new Promise((resolve, reject) => {
      fs.writeFile(
        path.join(__dirname, "public", "dateBase.json"),
        JSON.stringify(instances),
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  }
}

module.exports = Instance;
