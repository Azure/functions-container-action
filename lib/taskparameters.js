"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskParameters = void 0;
const core = __importStar(require("@actions/core"));
const AzureResourceFilterUtility_1 = require("azure-actions-appservice-rest/Utilities/AzureResourceFilterUtility");
class TaskParameters {
    constructor(endpoint) {
        this._appName = core.getInput('app-name', { required: true });
        this._image = core.getInput('image');
        this._slot = core.getInput('slot-name');
        this._containerCommand = core.getInput('container-command');
        this._endpoint = endpoint;
    }
    static getTaskParams(endpoint) {
        if (!this.taskparams) {
            this.taskparams = new TaskParameters(endpoint);
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
    get slot() {
        if (this._slot !== undefined && this._slot.trim() === "") {
            return undefined;
        }
        return this._slot;
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
