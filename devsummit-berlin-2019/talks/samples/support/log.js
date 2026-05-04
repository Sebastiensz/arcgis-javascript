define(["require", "exports"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    function message() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var message = Array.prototype.join.call(args, " ");
        var viewLog = document.getElementById("viewLog");
        viewLog.textContent = message;
    }
    exports.message = message;
    ;
    var timeoutHandle = 0;
    function timeout() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        message.apply(void 0, args);
        if (timeoutHandle) {
            clearTimeout(timeoutHandle);
        }
        timeoutHandle = setTimeout(function () {
            timeoutHandle = 0;
            message("");
        }, 2000);
    }
    exports.timeout = timeout;
});
