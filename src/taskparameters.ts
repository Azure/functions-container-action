import * as core from '@actions/core';

import { AzureResourceFilterUtility } from "azure-actions-appservice-rest/Utilities/AzureResourceFilterUtility";
import { IAuthorizer } from "azure-actions-webclient/Authorizer/IAuthorizer";

import fs = require('fs');

export class TaskParameters {
    private static taskparams: TaskParameters;
    private _appName: string;
    private _image: string;
    private _resourceGroupName?: string;
    private _endpoint: IAuthorizer;
    private _containerCommand: string;
    private _kind: string;
    private _slot: string;
    private _isLinux: boolean;

    private constructor(endpoint: IAuthorizer) {
        this._appName = core.getInput('app-name', { required: true });
        this._image = core.getInput('image');
        this._slot = core.getInput('slot-name');
        this._containerCommand = core.getInput('container-command');
        this._endpoint = endpoint;
    }

    public static getTaskParams(endpoint: IAuthorizer) {
        if(!this.taskparams) {
            this.taskparams = new TaskParameters(endpoint);
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

    public get slot() {
        if (this._slot !== undefined && this._slot.trim() === "") {
            return undefined;
        }
        return this._slot;
    }

    public async getResourceDetails() {
        let appDetails = await AzureResourceFilterUtility.getAppDetails(this.endpoint, this.appName);
        this._resourceGroupName = appDetails["resourceGroupName"];
        this._kind = appDetails["kind"];
        this._isLinux = this._kind.indexOf('linux') >= 0 || this._kind.indexOf('kubeapp') >=0;
    }
}