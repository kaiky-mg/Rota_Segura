param appName string 
param location string = resourceGroup().location
param sku string 
param product string 
param project string 
param ambiente string
param cost_center string
param dockerImage string
param dockerRepos string
param tipo string
param acrname string
param applicationkey string



module planoservice 'templates/modelo_plano_service.bicep' = {
  name:'planoservice'
  params:{
    appName: '${appName}-Plan-${tipo}-${ambiente}'
    location:location
    sku: sku
    product: product
    project: project
    ambiente: ambiente
    cost_center: cost_center
  }
}

module aplicationDocker 'templates/modelo_aplicacao_docker.bicep' = {
  name: 'aplicationDocker'
  params:{
    webAppname:'${appName}-${tipo}-${ambiente}'
    location: location
    acrname: acrname
    appServicePlan: planoservice.outputs.appServicePlanId
    dockerImage: dockerImage
    dockerRepos: dockerRepos
    product: product
    project: project
    ambiente: ambiente
    cost_center: cost_center
    applicationkey: applicationkey
  }
}






