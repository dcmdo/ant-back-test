var path = require("path");//引入NodeJS的路径对象
let alias = {};
//共有库
(function () {
    var global_libs = path.resolve(__dirname,'custom-components/global-libs');
    alias.Animation = path.resolve(global_libs,'animation/animation.js');
    alias.Base64 = path.resolve(global_libs,'base64/base64.js');
    alias.ClientDetect = path.resolve(global_libs,'client-detect/client-detect.js');
    alias.Coroutine = path.resolve(global_libs,'coroutine/coroutine.js');
    alias.Ease = path.resolve(global_libs,'ease/ease.js');
    alias.DOMCrossPlatformEvent = path.resolve(global_libs,'dom-cross-platform-event/dom-cross-platform-event.js');
    alias.Event = path.resolve(global_libs,'event/event.js');
    alias.EventCenter = path.resolve(global_libs,'event/event-center.js');
    alias.FullScreen = path.resolve(global_libs,'fullscreen/fullscreen.js');
    alias["disable-touch-refresh"] = path.resolve(global_libs,'global-setup/disable-touch-refresh.js');
    alias.ForceOrientation = path.resolve(global_libs,'global-setup/force-orientation.js');
    alias["stop-browser-default-drop"] = path.resolve(global_libs,'global-setup/stop-browser-default-drop.js');
    alias.GUID_UUID = path.resolve(global_libs,'guid-uuid/guid-uuid.js');
    alias.imageColor = path.resolve(global_libs,'image-color/image-color.js');
    alias.Increment = path.resolve(global_libs,'increment/increment.js');
    alias.InView = path.resolve(global_libs,'in-view/in-view.js');
    alias.CoolMath = path.resolve(global_libs,'math/cool-math.js');
    alias.CoolVector2 = path.resolve(global_libs,'math/cool-vector2.js');
    alias.CoolMatrix3x3 = path.resolve(global_libs,'math/cool-matrix3x3.js');
    alias.SVGAddon = path.resolve(global_libs,'math/svg-addon.js');
    alias.CoolFetch = path.resolve(global_libs,'fetch/cool-fetch.js');
    alias.NodeFetch = path.resolve(global_libs,'fetch/node-fetch.js');
    alias.FontSizeAdapter = path.resolve(global_libs,'font-size-adapter/font-size-adapter.js');
    alias.ArrayFns = path.resolve(global_libs,'under-score/array-fns.js');
    alias.ObjectFns = path.resolve(global_libs,'under-score/object-fns.js');
    alias.Polyfill = path.resolve(global_libs,'polyfill/polyfill.js');
    alias.Preload = path.resolve(global_libs,'preload/preload.js');
    alias.ScreenConsole = path.resolve(global_libs,'screen-console/screen-console.js');
    alias.Tween = path.resolve(global_libs,'tween/tween.js');
    alias.RippleTween = path.resolve(global_libs,'tween/ripple-tween.js');
    alias.throttle = path.resolve(global_libs,'under-score/throttle.js');
    alias.TypesCheck = path.resolve(global_libs,'under-score/types-check.js');
    alias.Upload = path.resolve(global_libs,'upload/upload.js');
})();
//UI库
(function () {
    var ui_components = path.resolve(__dirname,'custom-components/ui-components');
    alias.Bubble = path.resolve(ui_components,"bubble/bubble.js");
    alias.Button = path.resolve(ui_components,'button/button.js');
    alias.ButtonGroup = path.resolve(ui_components,'button/button-group.js');
    alias.ColorPicker = path.resolve(ui_components,'color-picker/color-picker.js');
    alias.CoolRouter  = path.resolve(ui_components,'cool-router/cool-router.js');
    alias.DropDown = path.resolve(ui_components,'drop-down/drop-down.js');
    alias.DateSelect = path.resolve(ui_components,'date-select/date-select.js');
    alias.DateRangeSelect = path.resolve(ui_components,'date-select/date-range-select.js');
    alias.EChartsBar = path.resolve(ui_components,'echarts/echarts-bar.js');
    alias.EChartsGraph = path.resolve(ui_components,'echarts/echarts-graph.js');
    alias.EChartsLine = path.resolve(ui_components,'echarts/echarts-line.js');
    alias.EChartsPie = path.resolve(ui_components,'echarts/echarts-pie.js');
    alias.EChartsRadar = path.resolve(ui_components,'echarts/echarts-radar.js');
    alias.FlashPlayer = path.resolve(ui_components,'flash-player/flash-player.js');
    alias.Gallery = path.resolve(ui_components,'gallery/gallery.js');
    alias.H5ToolPlayer = path.resolve(ui_components,'h5-tool-player/h5-tool-player.js');
    alias.H5ElectronPlayer = path.resolve(ui_components,'h5-tool-player/h5-electron-player.js');
    alias.Image = path.resolve(ui_components,'image/image.js');
    alias.TextField = path.resolve(ui_components,'input-components/text-field.js');
    alias.NumInput = path.resolve(ui_components,'input-components/num-input.js');
    alias.NumSelect = path.resolve(ui_components,'input-components/num-select.js');
    alias.KeepZoomRatio = path.resolve(ui_components,'keep-zoom-ratio/keep-zoom-ratio.js');
    alias.Loading = path.resolve(ui_components,'loading/loading.js');
    alias.MessageBox = path.resolve(ui_components,'message-box/message-box.js');
    alias.Pagination = path.resolve(ui_components,'pagination/pagination.js');
    alias.PixiContainer = path.resolve(ui_components,'pixi-container/pixi-container.js');
    alias.ProgressBar = path.resolve(ui_components,'progress-bar/progress-bar.js');
    alias.Rate = path.resolve(ui_components,'rate/rate.js');
    alias.SearchBar = path.resolve(ui_components,'search-bar/search-bar.js');
    alias.SelectGrid = path.resolve(ui_components,'select-grid/select-grid.js');
    alias.SelectGroup = path.resolve(ui_components,'select-grid/select-group.js');
    alias.Slider = path.resolve(ui_components,'slider/slider.js');
    alias.Step = path.resolve(ui_components,'step/step.js');
    alias.CheckBox = path.resolve(ui_components,'switches/check-box.js');
    alias.CheckBoxGroup = path.resolve(ui_components,'switches/check-box-group.js');
    alias.RadioButton = path.resolve(ui_components,'switches/radio-button.js');
    alias.RadioButtonGroup = path.resolve(ui_components,'switches/radio-button-group.js');
    alias.Switch = path.resolve(ui_components,'switches/switch.js');
    alias.StateSelect = path.resolve(ui_components,'switches/state-select');
    alias.Toggle = path.resolve(ui_components,'switches/toggle.js');
    alias.Table = path.resolve(ui_components,'table/table.js');
    alias.ThreeJsContainer = path.resolve(ui_components,'threejs-container/threejs-container.js');
    alias.Tree = path.resolve(ui_components,'tree/tree.js');
    alias.SingleUploader = path.resolve(ui_components,'uploaders/single-uploader.js');
    alias.MultipleUploader = path.resolve(ui_components,'uploaders/multiple-uploader.js');
    alias.VideoPlayer = path.resolve(ui_components,'video-player/video-player.js');
    alias.ModalWindow = path.resolve(ui_components,'window/modal-window.js');
    alias.DragWindow = path.resolve(ui_components,'window/drag-window.js');
    alias.UIComponent = path.resolve(ui_components,'ui-component.js');
})();
//three库
(
    function () {
        alias.ThreeLibs = path.resolve(__dirname,'custom-components/three-libs/three-libs')
    }
)();
module.exports = alias;