import { TaskParameters } from "../src/TaskParameters";
import { AzureResourceFilterUtility } from "azure-actions-appservice-rest/Utilities/AzureResourceFilterUtility";

describe('Test TaskParameters', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    })

    it("Test Linux/Kube Container Deployment", async () => {
        jest.spyOn(AzureResourceFilterUtility, 'getAppDetails').mockImplementation(async(): Promise<any> => {
            return {
                resourceGroupName:'MOCK_RESOURCE_NAME',
                kind:'functionapp, kubeapp'
            };
        });

        await TaskParameters.prototype.getResourceDetails();
        expect(TaskParameters.prototype.isLinux).toBeTruthy();
    });
    
    it("Test Windows Container Deployment", async () => {
        jest.spyOn(AzureResourceFilterUtility, 'getAppDetails').mockImplementation(async(): Promise<any> => {
            return {
                resourceGroupName:'MOCK_RESOURCE_NAME',
                kind:'functionapp'
            };
        });

        await TaskParameters.prototype.getResourceDetails();
        expect(TaskParameters.prototype.isLinux).toBeFalsy();
    });
});
