import core = require('@actions/core');
import { AzureAppService } from 'azure-actions-appservice-rest/Arm/azure-app-service';

export class AzureAppServiceUtilityExt {
    private _appService: AzureAppService;
    constructor(appService: AzureAppService) {
        this._appService = appService;
    }

    public async isFunctionAppOnCentauri(): Promise<boolean>{
        try{
            let details: any =  await this._appService.get();
            if (details.properties["managedEnvironmentId"]){
                core.debug("Function Container app is on Centauri.");
                return true;
            }
            else{                
                return false;    
            }
        }
        catch(error){
            core.debug(`Skipping Centauri check: ${error}`);
            return false;
        }        
    }

}