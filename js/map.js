// Mapboxの設定
mapboxgl.accessToken = 'pk.eyJ1IjoiZ2dwbGF5ZXIiLCJhIjoiY200OXBzcmI1MGR6bzJxcTFrdDJ1MGJyNSJ9.o_VpEScSsAPdt8U8PDB58Q';

// 地図の初期化
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    projection: 'globe',
    zoom: 2
});

// ナビゲーションコントロールの追加
map.addControl(new mapboxgl.NavigationControl());

// 地図のスタイルが読み込まれたときの処理
map.on('style.load', () => {
    map.setFog({});
});

// 現在のマーカーを保持する変数
let currentMarker = null;

// マーカーを更新する関数
function updateMarker(longitude, latitude) {
    if (currentMarker) {
        currentMarker.remove();
    }

    currentMarker = new mapboxgl.Marker({ color: 'red' })
        .setLngLat([longitude, latitude])
        .addTo(map);
}

// 地図の中心を移動する関数
function flyToLocation(longitude, latitude) {
    map.flyTo({
        center: [longitude, latitude],
        zoom: 10,
        bearing: 45,
        pitch: 45,
        speed: 1.2,
        curve: 1.5
    });
}

// 日本地図に移動する関数
function flyToJapan() {
    map.flyTo({
        center: [138.2529, 36.2048],
        zoom: 5,
        bearing: 0,
        pitch: 0,
        speed: 1.2,
        curve: 1.5
    });
}

// 世界地図に移動する関数
function flyToWorld() {
    map.flyTo({
        center: [0, 0],
        zoom: 2,
        bearing: 0,
        pitch: 0,
        speed: 1.2,
        curve: 1.5
    });
} 