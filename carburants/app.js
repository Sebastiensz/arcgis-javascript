require([
  "esri/Map",
  "esri/views/MapView",
  "esri/layers/FeatureLayer",
  "esri/geometry/Point",
  "esri/layers/support/LabelClass",
  "esri/widgets/Locate",
  "esri/widgets/Search",
  "esri/tasks/Locator"
],
  function (
    Map,
    MapView,
    FeatureLayer,
    Point,
    LabelClass,
    Locate,
    Search,
	Locator
  ) {

    var map = new Map({
      basemap: "gray-vector"
    });

    var view = new MapView({
      container: "viewDiv",
      map: map,
      scale: 9000000,
      constraints: {
        maxZoom: 15,
        minZoom: 5
      }
    });

    var pt = new Point({
      x: 1.2365058,
      y: 46.0743763,
      spatialReference: 4326
    });
    view.center = pt;

   

    var featureLayer = new FeatureLayer({
      url: "https://services.arcgis.com/d3voDfTFbHOCRwVR/arcgis/rest/services/carburants/FeatureServer/0",
	  //url:"https://services.arcgis.com/d3voDfTFbHOCRwVR/arcgis/rest/services/carburants_com/FeatureServer/0",
	  
      outFields: ["*"],
      title: '',
      visible: true
    });

    // Displays two values returned from Arcade expressions
    // in a table within the popup when a feature is clicked
    featureLayer.popupTemplate = {
      title: "Informations mises à jour toutes les heures",
      content: [{
        type: "fields",
        fieldInfos: [{
          fieldName: "expression/adresse"
        }, {
          fieldName: "expression/ville"
        }, {
          fieldName: "expression/automate"
        }, {
          fieldName: "expression/gazole"
        }, {
          fieldName: "expression/sp95"
        }, {
          fieldName: "expression/sp98"
        }, {
          fieldName: "expression/e10"
        }, {
          fieldName: "expression/e85"
        }, {
          fieldName: "expression/gplc"
        }]
      },
    {     
      type: "text",
      text: "source : https://www.prix-carburants.gouv.fr/rubrique/opendata"
    }],
      expressionInfos: [{
        name: "adresse",
        title: "Adresse",
        expression: "Proper($feature.Adresse, 'firstword')"
      }, {
        name: "ville",
        title: "Ville",
        expression: "Proper($feature.Ville, 'firstword')"
      }, {
        name: "automate",
        title: "24h/24h",
        expression: "$feature.Automate24_24"
      }, {
        name: "gazole",
        title: "Gazole",
        expression: "IIf($feature.Gazole != 99999, $feature.Gazole + ' €', 'Non communiqué');"
      }, {
        name: "sp95",
        title: "Sans Plomb 95%",
        expression: "IIf($feature.SP95 != 99999, $feature.SP95 + ' €', 'Non communiqué');"
      }, {
        name: "sp98",
        title: "Sans Plomb 98%",
        expression: "IIf($feature.SP98 != 99999, $feature.SP98 + ' €', 'Non communiqué');"
      }, {
        name: "e10",
        title: "E10",
        expression: "IIf($feature.E10 != 99999, $feature.E10 + ' €', 'Non communiqué');"
      }, {
        name: "e85",
        title: "E85",
        expression: "IIf($feature.E85 != 99999, $feature.E85 + ' €', 'Non communiqué');"
      }, {
        name: "gplc",
        title: "GPLC",
        expression: "IIf($feature.GPLC != 99999, $feature.GPLC + ' €', 'Non communiqué');"
      }]
    };

    var agregation = new FeatureLayer({
      url: "https://services.arcgis.com/d3voDfTFbHOCRwVR/arcgis/rest/services/carburants_reg/FeatureServer/0",
      outFields: ["POINT_COUNT"],
      title: '',
      visible: true
    });

    var agregationdep = new FeatureLayer({
      url: "https://services.arcgis.com/d3voDfTFbHOCRwVR/arcgis/rest/services/carburatns_dep/FeatureServer/0",
      outFields: ["POINT_COUNT"],
      title: '',
      visible: true,
      definitionExpression: "POINT_COUNT > 0"
    });
/*
    var agregationcom = new FeatureLayer({
      url: "https://services.arcgis.com/d3voDfTFbHOCRwVR/arcgis/rest/services/carburants_com/FeatureServer/0",
      outFields: ["POINT_COUNT"],
      title: '',
      visible: true,
      definitionExpression: "POINT_COUNT > 0"
    });
*/
    const statesLabelClass = new LabelClass({
      labelExpressionInfo: { expression: "$feature.POINT_COUNT" },
      symbol: {
        type: "text",
        color: "white",
        haloSize: 1,
        haloColor: "black"
      }
    });

    agregation.labelingInfo = [statesLabelClass];
    agregation.labelsVisible = true

    agregationdep.labelingInfo = [statesLabelClass];
    agregationdep.labelsVisible = true

    map.add(agregation);
    map.add(agregationdep);
    //map.add(agregationcom);
    map.add(featureLayer);

    var locateWidget = new Locate({
      view: view
    });

    // Add the locate widget to the top left corner of the view
    view.ui.add(locateWidget, {
      position: "top-left"
    });


    var searchWidget = new Search({
      view: view,
      allPlaceholder: "Recherche par ville",
      locationEnabled: true,
	  includeDefaultSources: false
    });
	
	const sources = [
{
  locator: new Locator({ url: "https://utility.arcgis.com/usrsvcs/servers/60a8871933e44a249ca71bb13c2d823d/rest/services/World/GeocodeServer" }),
  singleLineFieldName: "SingleLine",
  name: "Géocodage sur la France",
  placeholder: "Rechercher",
  maxResults: 3,
  maxSuggestions: 6,
  suggestionsEnabled: false,
  minSuggestCharacters: 0
}];
	
	searchWidget.sources=sources;
	searchWidget.defaultSources =sources;
	searchWidget.searchAllEnabled =false;

    // Adds the search widget below other elements in
    // the top left corner of the view
    view.ui.add(searchWidget, {
      position: "top-right",
      index: 2
    });

    var typeC = document.createElement("select");
    typeC.className = "custom-select text-dark";
    typeC.onchange = function () {
      setVisibilityFilter(this)
    };
    typeC.style.visibility = "hidden";
    var all = document.createElement("option");
    var allText = document.createTextNode("Tous");
    all.appendChild(allText);
    all.value = "all";
    typeC.appendChild(all);

    var gazoil = document.createElement("option");
    var gazoilText = document.createTextNode("Gazole");
    gazoil.appendChild(gazoilText);
    gazoil.value = "Gazole";
    typeC.appendChild(gazoil);

    var sans95 = document.createElement("option");
    var sans95Text = document.createTextNode("SP 95");
    sans95.appendChild(sans95Text);
    sans95.value = "SP95";
    typeC.appendChild(sans95);

    var sans98 = document.createElement("option");
    var sans98Text = document.createTextNode("SP 98");
    sans98.appendChild(sans98Text);
    sans98.value = "SP98";
    typeC.appendChild(sans98);

    var edix = document.createElement("option");
    var edixText = document.createTextNode("E10");
    edix.appendChild(edixText);
    edix.value = "E10";
    typeC.appendChild(edix);

    var eqc = document.createElement("option");
    var eqcText = document.createTextNode("E85");
    eqc.appendChild(eqcText);
    eqc.value = "E85";
    typeC.appendChild(eqc);

    var gplcc = document.createElement("option");
    var gplccText = document.createTextNode("GPLc");
    gplcc.appendChild(gplccText);
    gplcc.value = "GPLc";
    typeC.appendChild(gplcc);

    view.ui.add(typeC, "bottom-right");


    var autom = document.createElement("BUTTON");
    var automText = document.createTextNode("24h/24h");
    autom.appendChild(automText);
    autom.className = "btn bg-white text-dark";
    autom.value = "Automate24_24";
    document.body.appendChild(autom);
    autom.style.visibility = "hidden";
    autom.onclick = function () {
      defExpression(this); return false;
    };
    view.ui.add(autom, "bottom-right");

    var clearFilter = document.createElement("BUTTON");
    var clearFilterText = document.createTextNode("Effacer");
    clearFilter.appendChild(clearFilterText);
    clearFilter.className = "btn bg-white text-dark";
    clearFilter.value = "clear";
    document.body.appendChild(clearFilter);
    clearFilter.style.visibility = "hidden";
    clearFilter.onclick = function () {
      defExpression(this); return false;
    };
    view.ui.add(clearFilter, "bottom-right");

    function setVisibilityFilter(event) {
      if (event.value == "all") {
        featureLayer.definitionExpression = "ObjectId IS NOT NULL"
      }
      else {
        champsFl = event.value
        featureLayer.definitionExpression = champsFl + " != 99999"
      }

    }

    function defExpression(btn) {
      if (btn.value == "Automate24_24") {
        featureLayer.definitionExpression = "Automate24_24 = 'Oui'"
      }
      else {
        featureLayer.definitionExpression = "ObjectId IS NOT NULL"
      }
    };

    view.watch("scale", function (newValue, oldValue, propertyName) {
      if (newValue <= 200000) {
        featureLayer.visible = true;
        clearFilter.style.visibility = "visible"
        autom.style.visibility = "visible"
        typeC.style.visibility = "visible"
      }
      else {
        featureLayer.definitionExpression = "ObjectId IS NOT NULL"
        featureLayer.visible = false;
        agregation.visible = true;
        clearFilter.style.visibility = "hidden"
        autom.style.visibility = "hidden"
        typeC.style.visibility = "hidden"
      }

    });
  });
