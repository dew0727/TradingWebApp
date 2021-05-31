class socket {
  static _io = null;
  static setIo = (io) => {
    this._io = io;
  };

  static emit = (topic, msg) => {
    if (this._io == null || this._io == undefined) {
      console.info("Websocket is not defined");
      return;
    }

    if ('ORDER_COMPLETE_STATUS' === topic) {
      console.log(topic, msg)
    }
    this._io.emit(topic, msg);
  };
}

module.exports = {
  socket,
};
