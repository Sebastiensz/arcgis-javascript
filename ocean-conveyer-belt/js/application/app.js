/*
 | Copyright 2016 Esri
 |
 | Licensed under the Apache License, Version 2.0 (the "License");
 | you may not use this file except in compliance with the License.
 | You may obtain a copy of the License at
 |
 |    http://www.apache.org/licenses/LICENSE-2.0
 |
 | Unless required by applicable law or agreed to in writing, software
 | distributed under the License is distributed on an "AS IS" BASIS,
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 | See the License for the specific language governing permissions and
 | limitations under the License.
 */
define([
  "calcite",
  "boilerplate/ItemHelper",
  "boilerplate/UrlParamHelper",
  "dojo/i18n!./nls/resources",
  "dojo/_base/declare",
  "dojo/_base/lang",
  "dojo/_base/Color",
  "dojo/colors",
  "dojo/number",
  "dojo/query",
  "dojo/on",
  "dojo/dom",
  "dojo/dom-attr",
  "dojo/dom-class",
  "dojo/dom-geometry",
  "dojo/dom-construct",
  "esri/identity/IdentityManager",
  "esri/core/lang",
  "esri/core/watchUtils",
  "esri/core/promiseUtils",
  "esri/portal/Portal",
  "esri/layers/Layer",
  "esri/layers/FeatureLayer",
  "esri/widgets/Home",
  "esri/widgets/Search",
  "esri/widgets/LayerList",
  "esri/widgets/Legend",
  "esri/widgets/Print",
  "esri/widgets/ScaleBar",
  "esri/widgets/Compass",
  "esri/widgets/BasemapGallery",
  "esri/widgets/Expand",
  "./ExaggeratedElevationLayer",
], function (calcite, ItemHelper, UrlParamHelper, i18n, declare, lang, Color, colors, number, query, on,
             dom, domAttr, domClass, domGeom, domConstruct,
             IdentityManager, esriLang, watchUtils, promiseUtils, Portal, Layer, FeatureLayer,
             Home, Search, LayerList, Legend, Print, ScaleBar, Compass, BasemapGallery, Expand,
             ExaggeratedElevationLayer) {

  return declare(null, {

    config: null,
    direction: null,

    /**
     *
     * @param boilerplateResponse
     */
    init: function (boilerplateResponse) {

      calcite.init();

      if(boilerplateResponse) {
        this.direction = boilerplateResponse.direction;
        this.config = boilerplateResponse.config;
        this.settings = boilerplateResponse.settings;
        const boilerplateResults = boilerplateResponse.results;
        const webMapItem = boilerplateResults.webMapItem;
        const webSceneItem = boilerplateResults.webSceneItem;
        const groupData = boilerplateResults.group;

        document.documentElement.lang = boilerplateResponse.locale;

        this.urlParamHelper = new UrlParamHelper();
        this.itemHelper = new ItemHelper();

        this._setDirection();

        if(webMapItem) {
          this._createWebMap(webMapItem);
        } else if(webSceneItem) {
          this._createWebScene(webSceneItem);
        } else if(groupData) {
          this._createGroupGallery(groupData);
        } else {
          this.reportError(new Error("app:: Could not load an item to display"));
        }
      }
      else {
        this.reportError(new Error("app:: Boilerplate is not defined"));
      }
    },

    /**
     *
     * @param error
     * @returns {*}
     */
    reportError: function (error) {
      // remove loading class from body
      //domClass.remove(document.body, CSS.loading);
      //domClass.add(document.body, CSS.error);
      // an error occurred - notify the user. In this example we pull the string from the
      // resource.js file located in the nls folder because we've set the application up
      // for localization. If you don't need to support multiple languages you can hardcode the
      // strings here and comment out the call in index.html to get the localization strings.
      // set message
      let node = dom.byId("loading_message");
      if(node) {
        //node.innerHTML = "<h1><span class=\"" + CSS.errorIcon + "\"></span> " + i18n.error + "</h1><p>" + error.message + "</p>";
        node.innerHTML = "<h1><span></span>" + i18n.error + "</h1><p>" + error.message + "</p>";
      }
      return error;
    },

    /**
     *
     * @private
     */
    _setDirection: function () {
      let direction = this.direction;
      let dirNode = document.getElementsByTagName("html")[0];
      domAttr.set(dirNode, "dir", direction);
    },

    /**
     *
     * @param webMapItem
     * @private
     */
    _createWebMap: function (webMapItem) {
      this.itemHelper.createWebMap(webMapItem).then(map => {

        let viewProperties = {
          map: map,
          container: this.settings.webmap.containerId
        };

        if(!this.config.title && map.portalItem && map.portalItem.title) {
          this.config.title = map.portalItem.title;
        }

        lang.mixin(viewProperties, this.urlParamHelper.getViewProperties(this.config));
        require(["esri/views/MapView"], MapView => {

          let view = new MapView(viewProperties);
          view.then(() => {
            this.urlParamHelper.addToView(view, this.config);
            this._ready(view);
          }, this.reportError);

        });
      }, this.reportError);
    },

    /**
     *
     * @param webSceneItem
     * @private
     */
    _createWebScene: function (webSceneItem) {
      this.itemHelper.createWebScene(webSceneItem).then(map => {

        let viewProperties = {
          map: map,
          container: this.settings.webscene.containerId
        };

        if(!this.config.title && map.portalItem && map.portalItem.title) {
          this.config.title = map.portalItem.title;
        }

        lang.mixin(viewProperties, this.urlParamHelper.getViewProperties(this.config));
        require(["esri/views/SceneView"], SceneView => {

          let view = new SceneView(viewProperties);
          view.then(() => {
            this.urlParamHelper.addToView(view, this.config);
            this._ready(view);
          }, this.reportError);
        });
      }, this.reportError);
    },

    /**
     *
     * @param groupData
     * @private
     */
    _createGroupGallery: function (groupData) {
      let groupInfoData = groupData.infoData;
      let groupItemsData = groupData.itemsData;

      if(!groupInfoData || !groupItemsData || groupInfoData.total === 0 || groupInfoData instanceof Error) {
        this.reportError(new Error("app:: group data does not exist."));
        return;
      }

      let info = groupInfoData.results[0];
      let items = groupItemsData.results;

      this._ready();

      if(info && items) {
        let html = "";

        html += "<h1>" + info.title + "</h1>";

        html += "<ol>";

        items.forEach(function (item) {
          html += "<li>" + item.title + "</li>";
        });

        html += "</ol>";

        document.body.innerHTML = html;
      }

    },

    /**
     *
     * @private
     */
    _ready: function (view) {

      //view.environment.lighting.directShadowsEnabled = true;

      // HOME //
      const homeWidget = new Home({ view: view });
      view.ui.add(homeWidget, { position: "top-left", index: 0 });


      // EXAGGERATION //
      const elevationExaggeration = 300.0;
      const layerExaggeration = 180.0;

      // EXAGGERATED ELEVATION //
      const defaultElevationLayer = view.map.ground.layers.getItemAt(0);
      defaultElevationLayer.visible = false;
      const exaggeratedElevationLayer = new ExaggeratedElevationLayer({
        url: defaultElevationLayer.url,
        exaggeration: elevationExaggeration
      });
      view.map.ground.layers.add(exaggeratedElevationLayer);


      this.createConveyorBeltLayer(view, layerExaggeration);
      this.createDirectionArrows(view, layerExaggeration);


    },

    /**
     *
     * @param view
     * @param exaggeration
     */
    createDirectionArrows: function (view, exaggeration) {

      const directionsLayer = view.map.layers.find(layer => {
        return (layer.title === "XYZV_Coordinates");
      });
      directionsLayer.load().then(() => {
        directionsLayer.popupEnabled = false;

        directionsLayer.renderer.classBreakInfos.forEach((cbi) => {
          const colorLike = cbi.symbol.color;
          cbi.symbol = {
            type: "point-3d",
            symbolLayers: [
              {
                type: "object",
                resource: { primitive: "inverted-cone" },
                material: { color: colorLike },
                anchor: "center",
                width: 200000.0,
                depth: 200000.0,
                height: 400000.0,
                tilt: 90.0
              }
            ]
          }
        });

        directionsLayer.renderer.visualVariables = [
          {
            type: "rotation",
            field: "Azimuth",
            axis: "heading"
          },
          {
            type: "size",
            axis: "height",
            field: function (graphic) {
              return 400000 + (100000 * graphic.getAttribute("Velocity"));
            }
          },
          {
            type: "size",
            axis: "width-and-depth",
            field: function (graphic) {
              return 400000;
            }
          }
        ];

        view.whenLayerView(directionsLayer).then((directionsLayerView) => {
          directionsLayerView.loadedGraphics.forEach(feature => {
            feature.geometry.z = (feature.geometry.z * exaggeration);
          });
          directionsLayerView.loadedGraphics.on("before-add", (evt) => {
            evt.item.geometry.z = (evt.item.geometry.z * exaggeration);
          });
        });

      });

    },

    /**
     *
     * @param view
     * @param exaggeration
     */
    createConveyorBeltLayer: function (view, exaggeration) {

      // CONVEYOR BELT LAYER //
      const conveyorBeltLayer = view.map.layers.find(layer => {
        return (layer.title === "Surface_Deep");
      });
      conveyorBeltLayer.load().then(() => {
        conveyorBeltLayer.popupEnabled = false;

        // USE TUBE SYMBOLS //
        conveyorBeltLayer.renderer.uniqueValueInfos.forEach((uvi) => {
          const colorLike = uvi.symbol.symbolLayers.getItemAt(0).material.color;
          uvi.symbol = {
            type: "line-3d",
            symbolLayers: [
              {
                type: "path",
                size: 100000,
                material: { color: colorLike }
              }
            ]
          }
        });

        // POLYLINE EXAGGERATION //
        const updatePolylineExaggeration = (feature) => {
          feature.geometry.paths.forEach((part) => {
            part.forEach((coords) => {
              coords[2] = (coords[2] * exaggeration);
            });
          });
        };

        // SHADOWS LAYER //
        this.createShadowLayer(view, conveyorBeltLayer);

        // EXAGGERATE THE POLYLINE Z VALUES //
        view.whenLayerView(conveyorBeltLayer).then((conveyorBeltLayerView) => {
          conveyorBeltLayerView.loadedGraphics.forEach((feature) => {
            updatePolylineExaggeration(feature);
            this.addShadowFeature(feature);
          });
          conveyorBeltLayerView.loadedGraphics.on("before-add", (evt) => {
            updatePolylineExaggeration(evt.item);
            this.addShadowFeature(evt.item);
          });
        });
      });

    },

    /**
     *
     * @param view
     * @param sourceLayer
     */
    createShadowLayer: function (view, sourceLayer) {
      const shadowsLayer = new FeatureLayer({
        fields: esriLang.clone(sourceLayer.fields),
        objectIdField: sourceLayer.objectIdField,
        geometryType: sourceLayer.geometryType,
        spatialReference: sourceLayer.spatialReference,
        source: [],
        popupTemplate: null,
        elevationInfo: { mode: "on-the-ground" },
        renderer: {
          type: "simple",
          symbol: {
            type: "simple-line",
            color: Color.named.gray.concat(0.4),
            width: "12px",
            style: "solid"
          }
        }
      });
      view.map.add(shadowsLayer);
      this.addShadowFeature = (feature) => {
        shadowsLayer.source.add(feature);
      };
    }

  });
});

