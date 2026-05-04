define(["require", "exports", "esri/layers/FeatureLayer", "esri/renderers/UniqueValueRenderer", "esri/symbols/PolygonSymbol3D", "esri/symbols/ExtrudeSymbol3DLayer"], function (require, exports, FeatureLayer, UniqueValueRenderer, PolygonSymbol3D, ExtrudeSymbol3DLayer) {
    Object.defineProperty(exports, "__esModule", { value: true });
    function createLayer() {
        var resSym = new PolygonSymbol3D({
            symbolLayers: [
                new ExtrudeSymbol3DLayer({
                    material: {
                        color: "#FC921F"
                    }
                })
            ]
        });
        var condoSym = new PolygonSymbol3D({
            symbolLayers: [
                new ExtrudeSymbol3DLayer({
                    material: {
                        color: "#333"
                    }
                })
            ]
        });
        var renderer = new UniqueValueRenderer({
            defaultSymbol: new PolygonSymbol3D({
                symbolLayers: [
                    new ExtrudeSymbol3DLayer({
                        material: {
                            color: "#A7C636"
                        }
                    })
                ]
            }),
            defaultLabel: "Other",
            field: "DESCLU",
            uniqueValueInfos: [
                {
                    value: "Residential",
                    symbol: resSym,
                    label: "Residential"
                }, {
                    value: "Residential Condominium",
                    symbol: condoSym,
                    label: "Condominium"
                }
            ],
            visualVariables: [
                {
                    type: "size",
                    field: "ELEVATION",
                    valueUnit: "feet" // Converts and extrudes all data values in feet
                }
            ]
        });
        return new FeatureLayer({
            url: "https://services1.arcgis.com/jjVcwHv9AQEq3DH3/ArcGIS/rest/services/Buildings/FeatureServer/0",
            renderer: renderer,
            popupTemplate: {
                title: "{DESCLU}",
                content: [{
                        type: "fields",
                        fieldInfos: [{
                                fieldName: "ADDRESS",
                                label: "Address"
                            }, {
                                fieldName: "DESCLU",
                                label: "Type"
                            }, {
                                fieldName: "ELEVATION",
                                label: "Height"
                            }]
                    }]
            },
            outFields: ["ADDRESS", "DESCLU", "ELEVATION"],
            definitionExpression: "ELEVATION > 0",
        });
    }
    exports.createLayer = createLayer;
});
