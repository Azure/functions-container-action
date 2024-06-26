import { AzureAppService } from 'azure-actions-appservice-rest/Arm/azure-app-service';
import { AzureAppServiceUtility } from 'azure-actions-appservice-rest/Utilities/AzureAppServiceUtility';

import fs = require('fs');
import path = require('path');
import core = require('@actions/core');

export class ContainerDeploymentUtility {
    private _appService: AzureAppService;
    private _appServiceUtility: AzureAppServiceUtility;

    constructor(appService: AzureAppService) {
        this._appService = appService;
        this._appServiceUtility = new AzureAppServiceUtility(appService);
    }

    public async deployWebAppImage(images: string, multiContainerConfigFile: string, isLinux: boolean, 
        isMultiContainer: boolean, startupCommand: string, restart:boolean=true): Promise<void> {
        let updatedMulticontainerConfigFile: string = multiContainerConfigFile;

        if(isMultiContainer) {
            core.debug("Deploying Docker-Compose file " + multiContainerConfigFile + " to the webapp " + this._appService.getName());
            if(!!images) {
                updatedMulticontainerConfigFile = this._updateImagesInConfigFile(multiContainerConfigFile, images);
            }
        }
        else {
            core.debug("Deploying image " + images + " to the webapp " + this._appService.getName());
        }

        core.debug("Updating the webapp configuration.");
        await this._updateConfigurationDetails(startupCommand, isLinux, isMultiContainer, images, updatedMulticontainerConfigFile);

        if (restart){
            core.debug('making a restart request to app service');
            await this._appService.restart();
        }
    }

    private _updateImagesInConfigFile(multicontainerConfigFile: any, images: any): string {
        const tempDirectory = `${process.env.RUNNER_TEMP}`;
        var contents = fs.readFileSync(multicontainerConfigFile).toString();
        var imageList = images.split("\n");
        imageList.forEach((image: string) => {
            let imageName = image.split(":")[0];
            if (contents.indexOf(imageName) > 0) {
                contents = this._tokenizeImages(contents, imageName, image);
            }
        });

        let newFilePath = path.join(tempDirectory, path.basename(multicontainerConfigFile));
        fs.writeFileSync(
            path.join(newFilePath),
            contents
        );
        
        return newFilePath;
    }

    private _tokenizeImages(currentString: string, imageName: string, imageNameWithNewTag: string) {
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
                    } else {
                        newString += imageNameWithNewTag + "\n";
                    }
                }
                else {
                    newString += line + "\n";
                }
            });

        return newString;
    }

    private async _updateConfigurationDetails(startupCommand: string, isLinuxApp: boolean, isMultiContainer: boolean, imageName?: string, multicontainerConfigFile?: string): Promise<void> {
        var appSettingsNewProperties: {[index: string]:any} = !!startupCommand ? { appCommandLine: startupCommand } : {};

        if(isLinuxApp) {
            if(isMultiContainer) {
                let fileData = fs.readFileSync(multicontainerConfigFile);
                appSettingsNewProperties["linuxFxVersion"] = "COMPOSE|" + (Buffer.from(fileData).toString('base64'));
            }
            else {
                appSettingsNewProperties["linuxFxVersion"] =  "DOCKER|" + imageName;
            }
        }
        else {
            appSettingsNewProperties["windowsFxVersion"] =  "DOCKER|" + imageName;
        }

        core.debug(`CONTAINER UPDATE CONFIG VALUES : ${JSON.stringify(appSettingsNewProperties)}`);
        await this._appServiceUtility.updateConfigurationSettings(appSettingsNewProperties);
    }
}