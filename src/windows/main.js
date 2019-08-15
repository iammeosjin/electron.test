"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var electron_1 = require("electron");
var url_1 = require("url");
var path_1 = require("path");
var MainWindow = /** @class */ (function (_super) {
    __extends(MainWindow, _super);
    function MainWindow() {
        var _this = _super.call(this, {
            fullscreenWindowTitle: true,
            webPreferences: {
                nodeIntegration: true
            }
        }) || this;
        _this.loadURL(url_1["default"].format({
            pathname: path_1["default"].join(electron_1.app.getAppPath(), 'html/index.html'),
            protocol: 'file:',
            slashes: true
        }));
        return _this;
    }
    return MainWindow;
}(electron_1.BrowserWindow));
exports["default"] = MainWindow;
