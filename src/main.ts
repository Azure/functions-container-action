import * as core from '@actions/core';
import * as crypto from "crypto";

var prefix = !!process.env.AZURE_HTTP_USER_AGENT ? `${process.env.AZURE_HTTP_USER_AGENT}` : "";
let usrAgentRepo = crypto.createHash('sha256').update(`${process.env.GITHUB_REPOSITORY}`).digest('hex');
let actionName = 'DeployFunctionAppContainerToAzure';
let userAgentString = (!!prefix ? `${prefix}+` : '') + `GITHUBACTIONS_${actionName}_${usrAgentRepo}`;
core.exportVariable('AZURE_HTTP_USER_AGENT', userAgentString);

import { KuduServiceUtility } from 'pipelines-appservice-lib/lib/RestUtilities/KuduServiceUtility';
import { AzureAppService } from 'pipelines-appservice-lib/lib/ArmRest/azure-app-service';
import { AzureAppServiceUtility } from 'pipelines-appservice-lib/lib/RestUtilities/AzureAppServiceUtility';
import { ContainerDeploymentUtility } from 'pipelines-appservice-lib/lib/RestUtilities/ContainerDeploymentUtility';
import { addAnnotation } from 'pipelines-appservice-lib/lib/RestUtilities/AnnotationUtility';
import { TaskParameters } from './taskparameters';

async function main() {
    let isDeploymentSuccess: boolean = true;
    const responseUrl: string = 'app-url';

    try {
        var taskParams = TaskParameters.getTaskParams();
        await taskParams.getResourceDetails();

        core.debug("Predeployment Step Started");
        var appService = new AzureAppService(taskParams.endpoint, taskParams.resourceGroupName, taskParams.appName, taskParams.slot);
        var appServiceUtility = new AzureAppServiceUtility(appService);

        var kuduService = await appServiceUtility.getKuduService();
        var kuduServiceUtility = new KuduServiceUtility(kuduService);

        core.debug("Deployment Step Started");
        core.debug("Performing container based deployment.");

        let containerDeploymentUtility: ContainerDeploymentUtility = new ContainerDeploymentUtility(appService);
        await containerDeploymentUtility.deployWebAppImage(taskParams.image, "", taskParams.isLinux, false, taskParams.containerCommand);

        try {
            await appService.syncFunctionTriggersViaHostruntime();
        } catch (expt) {
            core.warning("Failed to sync function triggers in function app. Trigger listing may be out of date.");
        }
    }
    catch (error) {
        core.debug("Deployment Failed with Error: " + error);
        isDeploymentSuccess = false;
        core.setFailed(error);
    }
    finally {
        if(!!kuduServiceUtility) {
            await addAnnotation(taskParams.endpoint, appService, isDeploymentSuccess);
            let activeDeploymentID = await kuduServiceUtility.updateDeploymentStatus(isDeploymentSuccess, null, {'type': 'Deployment', 'slotName': appService.getSlot()});
            core.debug('Active DeploymentId :'+ activeDeploymentID);
        }

        let appServiceApplicationUrl: string = await appServiceUtility.getApplicationURL();
        console.log('Azure Function App URL: ' + appServiceApplicationUrl);
        core.setOutput(responseUrl, appServiceApplicationUrl);
        core.exportVariable('AZURE_HTTP_USER_AGENT', prefix);
        core.debug(isDeploymentSuccess ? "Deployment Succeded" : "Deployment failed");
    }
}

main();