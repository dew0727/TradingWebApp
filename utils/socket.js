class socket {
  static _io = null;
  static setIo = (io) => {
    this._io = io;
  };

  static emit = (topic, msg) => {
    if (this._io == null || this._io == undefined) {
      console.log("Websocket is not defined");
      return;
    }

    this._io.emit(topic, msg);
  };
}

module.exports = {
  socket,
};
