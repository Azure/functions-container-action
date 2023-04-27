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
exports.AzureAppServiceUtilityExt = void 0;
const core = require("@actions/core");
class AzureAppServiceUtilityExt {
    constructor(appService) {
        this._appService = appService;
    }
    isFunctionAppOnCentauri() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let details = yield this._appService.get();
                if (details.properties["managedEnvironmentId"]) {
                    core.debug("Function Container app is on Centauri.");
                    return true;
                }
                else {
                    return false;
                }
            }
            catch (error) {
                core.debug(`Skipping Centauri check: ${error}`);
                return false;
            }
        });
    }
}
exports.AzureAppServiceUtilityExt = AzureAppServiceUtilityExt;
