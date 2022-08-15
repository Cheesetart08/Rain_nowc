      <script>
let map;
let radar_conf = {
  basetime: [],
  validtime: [],
  indx: -1,
  layer: undefined,
};

$(window).on("load", function () {
  map = L.map("map", {
    zoomControl: true,
    maxZoom: 10,
    minZoom: 4,
    inertiaDeceleration: 10000,
    preferCanvas: true,
  });
  map.setView([37, 128], 5);
  
    map.createPane("base").style.zIndex = 80;
  map.createPane("line2").style.zIndex = 90;
  map.createPane("radar").style.zIndex = 100; 
  map.createPane("aa").style.zIndex = 105;  
  map.createPane("line").style.zIndex = 110;
 map.createPane("linearband").style.zIndex = 120;  
 
  //ベース地図読み込み
L.tileLayer("https://cyberjapandata.gsi.go.jp/xyz/hillshademap/{z}/{x}/{y}.png", {
    attribution: "国土地理院",
    pane: "base",
    opacity: 1,
  }).addTo(map);
  
   L.control.scale({maxWidth:200,position:'topright',imperial:false}).addTo(map);

  map.attributionControl.addAttribution("Japan Meteorological Agency");
 

  jma_radarload();
});

//雨雲レーダーJSON読み込み
const RADAR_URL = ["//www.jma.go.jp/bosai/jmatile/data/nowc/", "/none/", "/surf/hrpns/{z}/{x}/{y}.png"];
function jma_radarload() {
  let tm = new Date().getTime();
  $.getJSON("//www.jma.go.jp/bosai/jmatile/data/nowc/targetTimes_rad_N1.json?" + tm).done(function (data) {
    data = data.reverse();

    data.forEach((rdd) => {
      radar_conf.basetime.push(rdd.basetime);
      radar_conf.validtime.push(rdd.validtime);
      radar_conf.indx++;
    });

    tile_load(radar_conf.indx);

    timelabel_set(data[radar_conf.indx].validtime);
  });
}

//時間を表示
function timelabel_set(t) {
  let year = t.slice(0, 4);
  let month = t.slice(4, 6);
  let day = t.slice(6, 8);
  let hour = t.slice(8, 10);
  let date = t.slice(10, 12);
  let minutes = t.slice(12, 14);
  let dt = new Date(`${year}/${month}/${day} ${hour}:${date}:${minutes}`);
  dt.setHours(dt.getHours() + 9);

  month = dt.getMonth() + 1;
  if (month.toString().length == 1) month = "0" + month;
  day = dt.getDate();
  if (day.toString().length == 1) day = "0" + day;
  hour = dt.getHours();
  if (hour.toString().length == 1) hour = "0" + hour;
  minutes = dt.getMinutes();
  if (minutes.toString().length == 1) minutes = "0" + minutes;
  $("#time").text(`　${dt.getFullYear()}-${month}-${day} ${hour}:${minutes}　`);
}

//前のタイルへ（0より前はデータがないためスルー）
function back_tile() {
  let nindex = radar_conf.indx - 1;
  if (0 > nindex) return;
  radar_conf.indx = nindex;
  tile_load(nindex);
}

//次のタイルへ（次のindexに情報がなかったらスルー
function next_tile() {
  let nindex = radar_conf.indx + 1;
  if (radar_conf.basetime.length <= nindex) return;
  radar_conf.indx = nindex;
  tile_load(nindex);
}

function tile_load(nindex) {
  if (radar_conf.layer !== undefined) {
    map.removeLayer(radar_conf.layer);
  }

  let ri = nindex;
  radar_conf.layer = L.tileLayer(
    `${RADAR_URL[0]}${radar_conf.basetime[ri]}${RADAR_URL[1]}${radar_conf.validtime[ri]}${RADAR_URL[2]}`,
    {
      maxZoom: 10,
      minZoom: 4,
      opacity: 1,
      pane: "radar",
    }
  ).addTo(map);

  timelabel_set(radar_conf.validtime[ri]);
}

$.getJSON("//tile.hachi508.com/map_json/japan_fuken.json")
  .done(function(data){
        let line_geoobje = topojson.feature(data, data.objects.japan_fuken);
    fill_layer = L.geoJson(line_geoobje, {
      style: function (feature) {
        return {
          fillColor: "transparent",
          fillOpacity: 1,
          opacity: 1,
          weight: 0.5,
          color: "#000000",
          pane: "line",
        };
      },
    }).addTo(map);
  })

$.getJSON("//tile.hachi508.com/map_json/japan_fuken.json")
  .done(function(data){
        let line_geoobje = topojson.feature(data, data.objects.japan_fuken);
    fill_layer = L.geoJson(line_geoobje, {
      style: function (feature) {
        return {
          fillColor: "#000",
          fillOpacity: 0.25,
          opacity: 0,
          weight: 0,
          color: "#000",
          pane: "line2",
        };
      },
    }).addTo(map);
  })

$.getJSON("//tile.hachi508.com/map_json/world.json")
  .done(function(data){
        let line_geoobje = topojson.feature(data, data.objects.world);
    fill_layer = L.geoJson(line_geoobje, {
      style: function (feature) {
        return {
          fillColor: "#555",
          fillOpacity: 1,
          opacity: 1,
          weight: 0.5,
          color: "#000000",
          pane: "line2",
        };
      },
    }).addTo(map);
  })

setInterval(jma_radarload, 100000);
    </script>
