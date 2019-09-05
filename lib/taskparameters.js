"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const AzureResourceFilterUtility_1 = require("pipelines-appservice-lib/lib/RestUtilities/AzureResourceFilterUtility");
const AuthorizationHandlerFactory_1 = require("pipelines-appservice-lib/lib/AuthorizationHandlerFactory");
class TaskParameters {
    constructor() {
        this._appName = core.getInput('app-name', { required: true });
        this._image = core.getInput('image');
        this._containerCommand = core.getInput('container-command');
        this._endpoint = AuthorizationHandlerFactory_1.getHandler();
    }
    static getTaskParams() {
        if (!this.taskparams) {
            this.taskparams = new TaskParameters();
        }
        return this.taskparams;
    }
    get appName() {
        return this._appName;
    }
    get image() {
        return this._image;
    }
    get resourceGroupName() {
        return this._resourceGroupName;
    }
    get endpoint() {
        return this._endpoint;
    }
    get isLinux() {
        return this._isLinux;
    }
    get containerCommand() {
        return this._containerCommand;
    }
    getResourceDetails() {
        return __awaiter(this, void 0, void 0, function* () {
            let appDetails = yield AzureResourceFilterUtility_1.AzureResourceFilterUtility.getAppDetails(this.endpoint, this.appName);
            this._resourceGroupName = appDetails["resourceGroupName"];
            this._kind = appDetails["kind"];
            this._isLinux = this._kind.indexOf('linux') >= 0;
        });
    }
}
exports.TaskParameters = TaskParameters;
