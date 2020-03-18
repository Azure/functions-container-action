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
const main_1 = require("../main");
const AuthorizerFactory_1 = require("azure-actions-webclient/AuthorizerFactory");
const AzureAppServiceUtility_1 = require("azure-actions-appservice-rest/Utilities/AzureAppServiceUtility");
const ContainerDeploymentUtility_1 = require("azure-actions-appservice-rest/Utilities/ContainerDeploymentUtility");
const KuduServiceUtility_1 = require("azure-actions-appservice-rest/Utilities/KuduServiceUtility");
const azure_app_service_1 = require("azure-actions-appservice-rest/Arm/azure-app-service");
const taskparameters_1 = require("../taskparameters");
jest.mock('@actions/core');
jest.mock('../taskparameters');
jest.mock('azure-actions-webclient/AuthorizerFactory');
jest.mock('azure-actions-appservice-rest/Arm/azure-app-service');
jest.mock('azure-actions-appservice-rest/Utilities/AzureAppServiceUtility');
jest.mock('azure-actions-appservice-rest/Utilities/ContainerDeploymentUtility');
jest.mock('azure-actions-appservice-rest/Utilities/KuduServiceUtility');
describe('main.ts tests', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it("gets inputs and executes function container action", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            let getAuthorizerSpy = jest.spyOn(AuthorizerFactory_1.AuthorizerFactory, 'getAuthorizer');
            let getResourceDetailsSpy = jest.fn();
            let getTaskParamsSpy = jest.spyOn(taskparameters_1.TaskParameters, 'getTaskParams').mockReturnValue({
                appName: 'mockApp',
                image: 'mockImage',
                slot: 'mockSlotName',
                containerCommand: 'mockContainerCommand',
                getResourceDetails: getResourceDetailsSpy
            });
            let getKuduServiceSpy = jest.spyOn(AzureAppServiceUtility_1.AzureAppServiceUtility.prototype, 'getKuduService');
            let deployWebAppImageSpy = jest.spyOn(ContainerDeploymentUtility_1.ContainerDeploymentUtility.prototype, 'deployWebAppImage');
            let syncFunctionTriggersViaHostruntimeSpy = jest.spyOn(azure_app_service_1.AzureAppService.prototype, 'syncFunctionTriggersViaHostruntime');
            let updateDeploymentStatusSpy = jest.spyOn(KuduServiceUtility_1.KuduServiceUtility.prototype, 'updateDeploymentStatus');
            let getApplicationURLSpy = jest.spyOn(AzureAppServiceUtility_1.AzureAppServiceUtility.prototype, 'getApplicationURL').mockResolvedValue('http://test');
            let setOutputSpy = jest.spyOn(core, 'setOutput');
            let exportVariableSpy = jest.spyOn(core, 'exportVariable');
            yield main_1.main();
            expect(getResourceDetailsSpy).toHaveBeenCalledTimes(1);
            expect(getAuthorizerSpy).toHaveBeenCalledTimes(1);
            expect(getTaskParamsSpy).toHaveBeenCalledTimes(1);
            expect(getKuduServiceSpy).toHaveBeenCalled();
            expect(deployWebAppImageSpy).toHaveBeenCalled();
            expect(syncFunctionTriggersViaHostruntimeSpy).toHaveBeenCalled();
            expect(updateDeploymentStatusSpy).toHaveBeenCalled();
            expect(getApplicationURLSpy).toHaveBeenCalled();
            expect(setOutputSpy).toHaveBeenCalled();
            expect(exportVariableSpy).toHaveBeenCalled();
        }
        catch (e) {
        }
    }));
});
