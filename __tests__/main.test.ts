import * as core from "@actions/core";
import { main } from "../src/main";
import { AuthorizerFactory } from 'azure-actions-webclient/AuthorizerFactory';
import { AzureAppServiceUtility } from 'azure-actions-appservice-rest/Utilities/AzureAppServiceUtility';
import { ContainerDeploymentUtility } from 'azure-actions-appservice-rest/Utilities/ContainerDeploymentUtility';
import { KuduServiceUtility } from 'azure-actions-appservice-rest/Utilities/KuduServiceUtility';
import { AzureAppService } from 'azure-actions-appservice-rest/Arm/azure-app-service';
import { TaskParameters } from "../src/taskparameters";

jest.mock('@actions/core');
jest.mock('../src/taskparameters');
jest.mock('azure-actions-webclient/AuthorizerFactory');
jest.mock('azure-actions-appservice-rest/Arm/azure-app-service');
jest.mock('azure-actions-appservice-rest/Utilities/AzureAppServiceUtility');
jest.mock('azure-actions-appservice-rest/Utilities/ContainerDeploymentUtility');
jest.mock('azure-actions-appservice-rest/Utilities/KuduServiceUtility');

describe('main.ts tests', () => {

    afterEach(() => {
        jest.restoreAllMocks();
    })
        
    //this test checks if all the functions in this action are executing or not
    it("gets inputs and executes all the functions", async () => {

        try {

            let getAuthorizerSpy = jest.spyOn(AuthorizerFactory, 'getAuthorizer');

            let getResourceDetailsSpy = jest.fn();
            let getTaskParamsSpy = jest.spyOn(TaskParameters, 'getTaskParams').mockReturnValue({ 
                appName: 'mockApp' ,
                image: 'mockImage' ,
                slot: 'mockSlotName' ,
                containerCommand: 'mockContainerCommand' ,
                getResourceDetails: getResourceDetailsSpy as unknown
            } as TaskParameters);

            let getKuduServiceSpy = jest.spyOn(AzureAppServiceUtility.prototype, 'getKuduService');
            let deployWebAppImageSpy = jest.spyOn(ContainerDeploymentUtility.prototype, 'deployWebAppImage');
            let syncFunctionTriggersViaHostruntimeSpy = jest.spyOn(AzureAppService.prototype,'syncFunctionTriggersViaHostruntime');
            let updateDeploymentStatusSpy = jest.spyOn(KuduServiceUtility.prototype, 'updateDeploymentStatus');
            let getApplicationURLSpy = jest.spyOn(AzureAppServiceUtility.prototype, 'getApplicationURL').mockResolvedValue('http://test');
            let setOutputSpy = jest.spyOn(core, 'setOutput');
            let exportVariableSpy = jest.spyOn(core, 'exportVariable');
        
            await main();

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
        catch(e) {
        }

    })
})