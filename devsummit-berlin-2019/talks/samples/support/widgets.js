// credits @jkieboom@esri.com
define(["require", "exports", "esri/Map", "esri/views/MapView"], function (require, exports, Map, MapView) {
    Object.defineProperty(exports, "__esModule", { value: true });
    function createFullscreen(view) {
        var fullscreen = document.createElement("div");
        fullscreen.classList.add("esri-widget--button", "esri-interactive");
        var span = document.createElement("span");
        span.classList.add("esri-icon", "esri-icon-zoom-out-fixed");
        fullscreen.appendChild(span);
        view.ui.add(fullscreen, "top-left");
        fullscreen.addEventListener("click", function () {
            parent.postMessage({ type: "fullscreen" }, "*");
        });
    }
    exports.createFullscreen = createFullscreen;
    function createOverviewMap(view) {
        var div = document.createElement("div");
        div.setAttribute("id", "overviewDiv");
        view.container.appendChild(div);
        var mapView = new MapView({
            map: new Map({
                basemap: "streets-night-vector"
            }),
            container: div,
            ui: {
                components: []
            },
            constraints: {
                snapToZoom: false
            }
        });
        var handle = view.watch("extent", function (extent) {
            mapView.extent = extent;
        });
        return {
            view: mapView,
            remove: function () {
                handle.remove();
                mapView.container = null;
                mapView.destroy();
                if (div.parentElement) {
                    div.parentElement.removeChild(div);
                }
            }
        };
    }
    exports.createOverviewMap = createOverviewMap;
    var addElementDiv = document.createElement("div");
    function add(view, html, eventHandlers) {
        addElementDiv.innerHTML = html;
        var elem = addElementDiv.children[0];
        addElementDiv.innerHTML = "";
        elem.classList.add("text-on-view");
        view.ui.add(elem, "top-left");
        if (eventHandlers) {
            for (var eventName in eventHandlers) {
                elem.addEventListener(eventName, eventHandlers[eventName]);
            }
        }
        return elem;
    }
    exports.add = add;
});
