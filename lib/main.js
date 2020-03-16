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
const crypto = __importStar(require("crypto"));
const AuthorizerFactory_1 = require("azure-actions-webclient/AuthorizerFactory");
const azure_app_service_1 = require("azure-actions-appservice-rest/Arm/azure-app-service");
const AzureAppServiceUtility_1 = require("azure-actions-appservice-rest/Utilities/AzureAppServiceUtility");
const ContainerDeploymentUtility_1 = require("azure-actions-appservice-rest/Utilities/ContainerDeploymentUtility");
const KuduServiceUtility_1 = require("azure-actions-appservice-rest/Utilities/KuduServiceUtility");
const taskparameters_1 = require("./taskparameters");
const AnnotationUtility_1 = require("azure-actions-appservice-rest/Utilities/AnnotationUtility");
var prefix = !!process.env.AZURE_HTTP_USER_AGENT ? `${process.env.AZURE_HTTP_USER_AGENT}` : "";
let usrAgentRepo = crypto.createHash('sha256').update(`${process.env.GITHUB_REPOSITORY}`).digest('hex');
let actionName = 'DeployFunctionAppContainerToAzure';
let userAgentString = (!!prefix ? `${prefix}+` : '') + `GITHUBACTIONS_${actionName}_${usrAgentRepo}`;
core.exportVariable('AZURE_HTTP_USER_AGENT', userAgentString);
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        let isDeploymentSuccess = true;
        const responseUrl = 'app-url';
        try {
            let endpoint = yield AuthorizerFactory_1.AuthorizerFactory.getAuthorizer();
            var taskParams = taskparameters_1.TaskParameters.getTaskParams(endpoint);
            yield taskParams.getResourceDetails();
            core.debug("Predeployment Step Started");
            var appService = new azure_app_service_1.AzureAppService(taskParams.endpoint, taskParams.resourceGroupName, taskParams.appName, taskParams.slot);
            var appServiceUtility = new AzureAppServiceUtility_1.AzureAppServiceUtility(appService);
            var kuduService = yield appServiceUtility.getKuduService();
            var kuduServiceUtility = new KuduServiceUtility_1.KuduServiceUtility(kuduService);
            core.debug("Deployment Step Started");
            core.debug("Performing container based deployment.");
            let containerDeploymentUtility = new ContainerDeploymentUtility_1.ContainerDeploymentUtility(appService);
            yield containerDeploymentUtility.deployWebAppImage(taskParams.image, "", taskParams.isLinux, false, taskParams.containerCommand);
            try {
                yield appService.syncFunctionTriggersViaHostruntime();
            }
            catch (expt) {
                core.warning("Failed to sync function triggers in function app. Trigger listing may be out of date.");
            }
        }
        catch (error) {
            core.debug("Deployment Failed with Error: " + error);
            isDeploymentSuccess = false;
            core.setFailed(error);
        }
        finally {
            if (!!kuduServiceUtility) {
                yield AnnotationUtility_1.addAnnotation(taskParams.endpoint, appService, isDeploymentSuccess);
                let activeDeploymentID = yield kuduServiceUtility.updateDeploymentStatus(isDeploymentSuccess, null, { 'type': 'Deployment', 'slotName': appService.getSlot() });
                core.debug('Active DeploymentId :' + activeDeploymentID);
            }
            let appServiceApplicationUrl = yield appServiceUtility.getApplicationURL();
            console.log('Azure Function App URL: ' + appServiceApplicationUrl);
            core.setOutput(responseUrl, appServiceApplicationUrl);
            core.exportVariable('AZURE_HTTP_USER_AGENT', prefix);
            core.debug(isDeploymentSuccess ? "Deployment Succeded" : "Deployment failed");
        }
    });
}
exports.main = main;
main();
