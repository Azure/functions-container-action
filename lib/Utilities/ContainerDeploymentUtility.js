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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContainerDeploymentUtility = void 0;
const AzureAppServiceUtility_1 = require("azure-actions-appservice-rest/Utilities/AzureAppServiceUtility");
const fs = require("fs");
const path = require("path");
const core = require("@actions/core");
class ContainerDeploymentUtility {
    constructor(appService) {
        this._appService = appService;
        this._appServiceUtility = new AzureAppServiceUtility_1.AzureAppServiceUtility(appService);
    }
    deployWebAppImage(images_1, multiContainerConfigFile_1, isLinux_1, isMultiContainer_1, startupCommand_1) {
        return __awaiter(this, arguments, void 0, function* (images, multiContainerConfigFile, isLinux, isMultiContainer, startupCommand, restart = true) {
            let updatedMulticontainerConfigFile = multiContainerConfigFile;
            if (isMultiContainer) {
                core.debug("Deploying Docker-Compose file " + multiContainerConfigFile + " to the webapp " + this._appService.getName());
                if (!!images) {
                    updatedMulticontainerConfigFile = this._updateImagesInConfigFile(multiContainerConfigFile, images);
                }
            }
            else {
                core.debug("Deploying image " + images + " to the webapp " + this._appService.getName());
            }
            core.debug("Updating the webapp configuration.");
            yield this._updateConfigurationDetails(startupCommand, isLinux, isMultiContainer, images, updatedMulticontainerConfigFile);
            if (restart) {
                core.debug('making a restart request to app service');
                yield this._appService.restart();
            }
        });
    }
    _updateImagesInConfigFile(multicontainerConfigFile, images) {
        const tempDirectory = `${process.env.RUNNER_TEMP}`;
        var contents = fs.readFileSync(multicontainerConfigFile).toString();
        var imageList = images.split("\n");
        imageList.forEach((image) => {
            let imageName = image.split(":")[0];
            if (contents.indexOf(imageName) > 0) {
                contents = this._tokenizeImages(contents, imageName, image);
            }
        });
        let newFilePath = path.join(tempDirectory, path.basename(multicontainerConfigFile));
        fs.writeFileSync(path.join(newFilePath), contents);
        return newFilePath;
    }
    _tokenizeImages(currentString, imageName, imageNameWithNewTag) {
        let i = currentString.indexOf(imageName);
        if (i < 0) {
            core.debug(`No occurence of replacement token: ${imageName} found`);
            return currentString;
        }
        let newString = "";
        currentString.split("\n")
            .forEach((line) => {
            if (line.indexOf(imageName) > 0 && line.toLocaleLowerCase().indexOf("image") > 0) {
                let i = line.indexOf(imageName);
                newString += line.substring(0, i);
                let leftOverString = line.substring(i);
                if (leftOverString.endsWith("\"")) {
                    newString += imageNameWithNewTag + "\"" + "\n";
                }
                else {
                    newString += imageNameWithNewTag + "\n";
                }
            }
            else {
                newString += line + "\n";
            }
        });
        return newString;
    }
    _updateConfigurationDetails(startupCommand, isLinuxApp, isMultiContainer, imageName, multicontainerConfigFile) {
        return __awaiter(this, void 0, void 0, function* () {
            var appSettingsNewProperties = !!startupCommand ? { appCommandLine: startupCommand } : {};
            if (isLinuxApp) {
                if (isMultiContainer) {
                    let fileData = fs.readFileSync(multicontainerConfigFile);
                    appSettingsNewProperties["linuxFxVersion"] = "COMPOSE|" + (Buffer.from(fileData).toString('base64'));
                }
                else {
                    appSettingsNewProperties["linuxFxVersion"] = "DOCKER|" + imageName;
                }
            }
            else {
                appSettingsNewProperties["windowsFxVersion"] = "DOCKER|" + imageName;
            }
            core.debug(`CONTAINER UPDATE CONFIG VALUES : ${JSON.stringify(appSettingsNewProperties)}`);
            yield this._appServiceUtility.updateConfigurationSettings(appSettingsNewProperties);
        });
    }
}
exports.ContainerDeploymentUtility = ContainerDeploymentUtility;
