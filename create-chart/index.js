require([
    "esri/config","esri/Map",
    "esri/views/MapView",
    "esri/PopupTemplate",
    "esri/layers/FeatureLayer",
    "esri/widgets/Popup",
    "esri/tasks/support/Query",
    "https://cdn.jsdelivr.net/npm/chart.js@2.8.0","esri/widgets/Search",
    "dojo/domReady!"
  ],
  function (esriConfig,Map, MapView, PopupTemplate, FeatureLayer, Popup, Query, Chart,Search) {
esriConfig.apiKey= "AAPK2ac310e1478f41ed8ac738dafc1e969d5t9-FFWs7QnAgAXnbQDXseVcq-d0wMWQxYF-gQKSwywK3noEj2_rkuQAmsCXNWdu";
    var featureLayerRenderer = {
      type: "simple",  
      symbol: {
        type: "simple-fill",
        style: "solid",
        color: [51, 204, 51, 0.15],
      }
    };

    var featureLayer = new FeatureLayer({
      url: "https://services.arcgis.com/d3voDfTFbHOCRwVR/arcgis/rest/services/COMMUNESFrance/FeatureServer",
      renderer: featureLayerRenderer,
      definitionExpression: "COMMUNE_POPULATION > 0",
      visible: true
    });

    var map = new Map({
      basemap: "arcgis-topographic",
      layers: [featureLayer]
    });

    var view = new MapView({
      container: "viewDiv",
      map: map,
      center: [2.35,48.8],
      zoom: 11,
      popup: {
        dockEnabled: true,
        visible: false,
        dockOptions: {
          buttonEnabled: true,
          breakpoint: false,
          position: "auto"
        }
      }
    });
  
  const searchWidget = new Search({
  view: view
});
// Adds the search widget below other elements in
// the top left corner of the view
view.ui.add(searchWidget, {
  position: "top-left",
  index: 1
});

    // Create a query to get data from the feature layer
    var query = new Query();
    query.returnGeometry = true;
    query.outFields = ["CSP_PopActive_Cadres_Actifs", "CSP_PopActive_Cadres_Chômeurs", "CSP_PopActive_Ouvriers_Actifs", "CSP_PopActive_Ouvriers_Chômeurs", "CSP_PopActive_Agriculteurs_Acti", "CSP_PopActive_Employés_Actifs","COMMUNE_NOM_COM"];
    query.where = "1=1";
    query.num = 50;

    // On view click, query the feature layer and pass the results to setContentInfo function.
    view.on("click", (e) => {
      query.geometry = e.mapPoint,
      featureLayer.queryFeatures(query).then((results) =>{

          view.popup.visible = true;
          view.popup.open({
              title: "CSP à "+results.features[0].attributes.COMMUNE_NOM_COM,
              content: setContentInfo(results.features[0].attributes)
          });

      });
    });

  // Using the data from the feature layer, create a doughnut graph.
  function setContentInfo(results){
    // Create a new canvas element, this is where the graph will be placed.
    var canvas = document.createElement('canvas');
    canvas.id = "myChart";
    
    // Create a data object, this will include the data from the feature layer and other information like color or labels.
    var data = {
      datasets:[{
        data: [results.CSP_PopActive_Cadres_Actifs, results.CSP_PopActive_Ouvriers_Actifs, results.CSP_PopActive_Employés_Actifs,results.CSP_PopActive_Agriculteurs_Acti],
        backgroundColor: ["#4286f4", "#41f4be", "#8b41f4", "#e241f4", "#f44185", "#f4cd41"]
      }],
      labels: [
        'Cadres actifs','Ouvriers actifs','Employes actifs','Agriculteurs actifs',
      ]
    };

    // Create a new Chart and hook it to the canvas and then return the canvas.
    var myPieChart = new Chart(canvas,{
      type: 'doughnut',
      data: data
  });
		
  return canvas;
  }
});
