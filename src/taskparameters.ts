import * as core from '@actions/core';
import { AzureResourceFilterUtility } from "pipelines-appservice-lib/lib/RestUtilities/AzureResourceFilterUtility";
import { IAuthorizationHandler } from "pipelines-appservice-lib/lib/ArmRest/IAuthorizationHandler";
import { getHandler } from 'pipelines-appservice-lib/lib/AuthorizationHandlerFactory';
import { exist } from 'pipelines-appservice-lib/lib/Utilities/packageUtility';
import fs = require('fs');

export class TaskParameters {
    private static taskparams: TaskParameters;
    private _appName: string;
    private _image: string;
    private _resourceGroupName?: string;
    private _endpoint: IAuthorizationHandler;
    private _containerCommand: string;
    private _kind: string;
    private _isLinux: boolean;

    private constructor() {
        this._appName = core.getInput('app-name', { required: true });
        this._image = core.getInput('image');
        this._containerCommand = core.getInput('container-command');
        this._endpoint = getHandler();
    }

    public static getTaskParams() {
        if(!this.taskparams) {
            this.taskparams = new TaskParameters();
        }
        return this.taskparams;
    }

    public get appName() {
        return this._appName;
    }

    public get image() {
        return this._image;
    }

    public get resourceGroupName() {
        return this._resourceGroupName;
    }

    public get endpoint() {
        return this._endpoint;
    }

    public get isLinux() {
        return this._isLinux;
    }

    public get containerCommand() {
        return this._containerCommand;
    }

    public async getResourceDetails() {
        let appDetails = await AzureResourceFilterUtility.getAppDetails(this.endpoint, this.appName);
        this._resourceGroupName = appDetails["resourceGroupName"];
        this._kind = appDetails["kind"];
        this._isLinux = this._kind.indexOf('linux') >= 0;
    }
}