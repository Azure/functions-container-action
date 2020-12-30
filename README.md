# GitHub Actions for deploying customized Azure Functions image

With the Azure Functions GitHub Action, you can automate your workflow to deploy [Azure Functions](https://azure.microsoft.com/en-us/services/functions/) in a customized image.

Get started today with a [free Azure account](https://azure.com/free/open-source)!

The repository contains a GitHub Action to deploy your customized function app image into Azure Functions. If you are looking for a simple GitHub Action to deploy your function app without building a customized image, please consider using [functions-action](https://github.com/Azure/functions-action).

The definition of this GitHub Action is in [action.yml](https://github.com/Azure/functions-container-action/blob/master/action.yml).

# End-to-End Workflow

## Dependencies on other GitHub Actions
* [Checkout](https://github.com/actions/checkout) Checkout your Git repository content into GitHub Actions agent.
* [Azure Login](https://github.com/Azure/login) Login with your Azure credentials for function app deployment authentication.

## Azure Service Principle for RBAC
Create an [Azure Service Principal for RBAC](https://docs.microsoft.com/en-us/azure/role-based-access-control/overview) and add it as a [GitHub Secret in your repository](https://help.github.com/en/articles/virtual-environments-for-github-actions#creating-and-using-secrets-encrypted-variables).
1. Download Azure CLI from [here](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli?view=azure-cli-latest), run `az login` to login with your Azure credentials.
2. Run Azure CLI command
```
   az ad sp create-for-rbac --name "myApp" --role contributor \
                            --scopes /subscriptions/{subscription-id}/resourceGroups/{resource-group}/providers/Microsoft.Web/sites/{app-name} \
                            --sdk-auth

  # Replace {subscription-id}, {resource-group}, and {app-name} with the names of your subscription, resource group, and Azure function app.
  # The command should output a JSON object similar to this:

  {
    "clientId": "<GUID>",
    "clientSecret": "<GUID>",
    "subscriptionId": "<GUID>",
    "tenantId": "<GUID>",
    (...)
  }
```
3. Paste the json response from above Azure CLI to your GitHub Repository > Settings > Secrets > Add a new secret > **AZURE_CREDENTIALS**

## Setup Container Registry Credentials
1. Paste your container registry username (e.g. docker hub username) to your GitHub Repository > Settings > Secrets > Add a new secret > **REGISTRY_USERNAME**
2. Paste your container registry password (e.g. docker hub password) to your GitHub Repository > Settings > Secrets > Add a new secret > **REGISTRY_PASSWORD**
3. (Optional) Create a new repository under your registry namespace (e.g. docker.io/mynamespace/myrepository)

## Create Azure function app and Deploy to function app container using GitHub Actions
1. Follow the tutorial [Create a function on Linux using a custom image](https://docs.microsoft.com/en-us/azure/azure-functions/functions-create-function-linux-custom-image)
2. Customize your Dockerfile to ensure the function app dependencies can be resolved properly on runtime (e.g. npm install)
3. Use the [linux-container-functionapp-on-azure.yml](https://github.com/Azure/actions-workflow-samples/tree/master/FunctionApp/linux-container-functionapp-on-azure.yml) template as a reference, create a new workflow.yml file under your project `./github/workflows/`
4. Commit and push your project to GitHub repository, you should see a new GitHub Action initiated in **Actions** tab.

Azure Functions Action for deploying customized Azure Functions image is supported for the Azure public cloud as well as Azure government clouds ('AzureUSGovernment' or 'AzureChinaCloud'). Before running this action, login to the respective Azure Cloud  using [Azure Login](https://github.com/Azure/login) by setting appropriate value for the `environment` parameter.

# Contributing

This project welcomes contributions and suggestions.  Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.opensource.microsoft.com.

When you submit a pull request, a CLA bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., status check, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.
