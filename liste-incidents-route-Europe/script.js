console.log("Success")
    // 2D map
require([
    "esri/Map",
    "esri/views/MapView",
    "esri/views/SceneView",
    "esri/layers/GeoJSONLayer",
    "esri/widgets/Legend",
    "esri/widgets/Expand",
    "esri/widgets/Home",
    "esri/widgets/Fullscreen",
    "esri/widgets/BasemapToggle",
    "esri/widgets/BasemapGallery",
], function(Map, MapView, SceneView, GeoJSONLayer, Legend, Expand, Home, Fullscreen, BasemapToggle, BasemapGallery) {

    var map = new Map({
        basemap: "topo-vector",
        ground: "world-elevation"
    });

    // Création de la map centrée sur lyon
    var view = new MapView({
        container: "viewDiv",
        map: map,
        center: [4.8654488, 45.747671],
        zoom: 5
    });

    var other = {
        type: "simple-marker",
        color: "black",
        size: "8px", // pixels
    };

    // Severity symbols
    var critical = {
        type: "simple-marker",
        color: "red",
        size: "20px", // pixels
    };

    var major = {
        type: "simple-marker",
        color: "orange",
        size: "16px", // pixels
    };

    var low_impact = {
        type: "simple-marker",
        color: "yellow",
        size: "12px", // pixels
    };

    var minor = {
        type: "simple-marker",
        color: "white",
        size: "8px", // pixels
    };

    var SeverityServiceRenderer = {
        type: "unique-value",
        field: "severity",
        defaultSymbol: other,
        uniqueValueInfos: [{

                value: "critical",
                symbol: critical
            },
            {
                value: "major",
                symbol: major

            }, {
                value: "low_impact",
                symbol: low_impact
            }, {
                value: "minor",
                symbol: minor
            }
        ]
    };

    //Create pop-up variable
    var popup = {
        "title": "{incidenttype}", //incidenttype est une propriété de la couche GeoJSON
        "content": "<br>{start_localtime}<br>{fulldescription}"
    };

    // Créer une couche avec les données des incidents de la route
    var traffic_incident = new GeoJSONLayer({
        url: "https://opendata.arcgis.com/datasets/f35c1b885e1043bc8482e3cfe43819d7_20.geojson",
        renderer: SeverityServiceRenderer,
        popupTemplate: popup
    });

    //Création d'une légende
    var legend = new Legend({
        view: view,
        layerInfos: [{
            layer: traffic_incident,
            title: "Sévérité"
        }]
    });

    //Ajout du titre à gauche
    view.ui.add(titleDiv, "top-left");

    //Affichage de la légende
    view.ui.add(
        new Expand({
            view: view,
            content: legend,
        }),
        "top-left"
    );

    //Ajout de la basemap
    var basemapGallery = new BasemapGallery({
        view: view,
        source: {
            portal: {
                url: "https://www.arcgis.com",
                useVectorBasemaps: true // Load vector tile basemaps
            }
        }
    });
    view.ui.add(
        new Expand({
            view: view,
            content: basemapGallery,
        }),
        "top-left"
    );

    //Affichage d'un bouton home
    view.ui.add(
        new Home({
            view: view
        }),
        "top-left"
    );

    //Affichage d'un bouton plein ecran
    view.ui.add(
        new Fullscreen({
            view: view,
        }),
        "bottom-right"
    );

    //On enleve les boutons de zoom
    view.ui.remove('zoom');

    // On ajoute la couche à la vue existante
    map.add(traffic_incident, 0);

    //Ajout du champ filtre
    const formDiv = document.getElementById("formDiv");
    view.ui.add(
        new Expand({
            view: view,
            content: formDiv,
            expandIconClass: "esri-icon-layer-list",
            expanded: true
        }),
        "top-right"
    );


    //Script pour les filtres
    view.when().then(function() {
        view.whenLayerView(traffic_incident).then(function(layerView) {

            const filter = document.getElementById("filter");
            filter.addEventListener("change", function(event) {

                // Filtre les incidents par type
                const filterType = document.getElementById("filter-type");
                const conditionType = "incidenttype = '" + filterType.value + "'";
                const whereClauseType = filterType.value ? conditionType : "";

                // Filtre les incidents par date de début
                const filterDate = document.getElementById("filter-date");
                const conditionDate = `start_utctime BETWEEN '${filterDate.value}/01/01 00:00:01' AND '${filterDate.value}/12/31 23:59:59 '`;
                const whereClauseDate = filterDate.value ? conditionDate : "";

                let whereClause

                if (whereClauseType && whereClauseDate) {
                    whereClause = `${whereClauseType} AND ${whereClauseDate}`;
                } else {
                    whereClause = `${whereClauseType}${whereClauseDate}`;
                }

                layerView.filter = {
                    where: whereClause
                };

                view.popup.close();

            });

        });
    });

    //Bouton de regroupement
    const clusterConfig = {
        type: "cluster",
        clusterRadius: "100px",
        popupTemplate: {
            content: "Ce regroupement représente {cluster_count} incidents de la route."
        }
    };

    const toggleButton = document.getElementById("cluster");
    toggleButton.addEventListener("click", function() {
        let fr = traffic_incident.featureReduction;
        traffic_incident.featureReduction =
            fr && fr.type === "cluster" ? null : clusterConfig;
        toggleButton.innerText =
            toggleButton.innerText === "Activer regroupement" ?
            "Désactiver regroupement" :
            "Activer regroupement";
    });

    //Déplacer les élements après le titre
    view.ui.components = (["attribution", "compass", "zoom"]);

});