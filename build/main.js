"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var utils = __toESM(require("@iobroker/adapter-core"));
var import_aedes = __toESM(require("aedes"));
var import_aedes_server_factory = require("aedes-server-factory");
class Tinymqttbroker extends utils.Adapter {
  constructor(options = {}) {
    super({
      ...options,
      name: "tinymqttbroker"
    });
    this.on("ready", this.onReady.bind(this));
    this.on("unload", this.onUnload.bind(this));
  }
  async onReady() {
    this.serverPort = this.config.option1;
    this.withDB = this.config.option2;
    this.log.info("Start with DB: " + this.withDB);
    if (this.withDB) {
      const NedbPersistence = require("aedes-persistence-nedb");
      const db = new NedbPersistence({ path: `${utils.getAbsoluteInstanceDataDir(this)}/mqttData`, prefix: "" });
      this.aedes = new import_aedes.default({ persistence: db });
    } else {
      this.aedes = new import_aedes.default();
    }
    this.aedes.id = "iobroker_mqtt_broker_" + Math.floor(Math.random() * 1e5 + 1e5);
    this.server = (0, import_aedes_server_factory.createServer)(this.aedes);
    this.server.listen(this.serverPort, () => {
      this.log.info("MQTT-broker says: Server " + this.aedes.id + " started and listening on port " + this.serverPort);
    });
    this.aedes.on("client", (client) => {
      this.log.info(`MQTT-broker says: Client ${client ? client.id : client} connected to broker ${this.aedes.id}`);
    });
    this.aedes.on("clientDisconnect", (client) => {
      this.log.info(`MQTT-broker says: Client ${client ? client.id : client} disconnected from the broker ${this.aedes.id}`);
    });
    this.aedes.on("subscribe", (subscriptions, client) => {
      this.log.debug(`MQTT-broker says: Client ${client ? client.id : client} subscribed to topic(s): ${subscriptions.map((s) => s.topic).join(",")} on broker ${this.aedes.id}`);
    });
    this.aedes.on("unsubscribe", (subscriptions, client) => {
      this.log.debug(`MQTT-broker says: Client ${client ? client.id : client} unsubscribed from topic(s): ${subscriptions.join(",")} on broker ${this.aedes.id}`);
    });
  }
  onUnload(callback) {
    try {
      this.aedes.close();
      this.server.close();
      this.log.info(`MQTT-broker says: I (${this.aedes.id}) stopped my service. See you soon!`);
      callback();
    } catch (e) {
      callback();
    }
  }
  onStateChange(id, state) {
    if (state) {
      this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
    } else {
      this.log.info(`state ${id} deleted`);
    }
  }
}
if (require.main !== module) {
  module.exports = (options) => new Tinymqttbroker(options);
} else {
  (() => new Tinymqttbroker())();
}
//# sourceMappingURL=main.js.map
