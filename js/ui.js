// 再生状態を保持する変数
let isPlaying = false;
let playInterval = null;
let currentEventIndex = 0;

// 陣営色の状態を管理
let showFactionColors = false;

// 次のイベントに移動する関数
function moveToNextEvent() {
    if (currentEventIndex < events.length - 1) {
        currentEventIndex++;
        const startDate = eventToDate(events[0]);
        const endDate = eventToDate(events[events.length - 1]);
        const eventDate = eventToDate(events[currentEventIndex]);
        const newValue = normalizeDate(eventDate, startDate, endDate);
        
        const slider = document.getElementById('slider');
        slider.value = newValue;
        showEvent(currentEventIndex);
    }
}

// 前のイベントに移動する関数
function moveToPreviousEvent() {
    if (currentEventIndex > 0) {
        currentEventIndex--;
        const startDate = eventToDate(events[0]);
        const endDate = eventToDate(events[events.length - 1]);
        const eventDate = eventToDate(events[currentEventIndex]);
        const newValue = normalizeDate(eventDate, startDate, endDate);
        
        const slider = document.getElementById('slider');
        slider.value = newValue;
        showEvent(currentEventIndex);
    }
}

// 再生を開始する関数
function startPlayback() {
    if (isPlaying) return;
    isPlaying = true;

    playInterval = setInterval(() => {
        moveToNextEvent();
        if (currentEventIndex >= events.length - 1) {
            stopPlayback();
        }
    }, 6000);
}

// 再生を停止する関数
function stopPlayback() {
    if (!isPlaying) return;
    isPlaying = false;
    clearInterval(playInterval);
    playInterval = null;
    document.getElementById('play-button').textContent = '▶';
}

// Wikipediaのポップアップを表示する関数
function showWikipedia(countryName) {
    const wikipediaUrls = {
        "アメリカ合衆国": "https://ja.wikipedia.org/wiki/アメリカ合衆国",
        "イギリス連邦": "https://ja.wikipedia.org/wiki/イギリス",
        "ソビエト連邦": "https://ja.wikipedia.org/wiki/ソビエト連邦",
        "中華民国": "https://ja.wikipedia.org/wiki/中華民国_(1912–1949)",
        "フランス共和国": "https://ja.wikipedia.org/wiki/フランス",
        "カナダ": "https://ja.wikipedia.org/wiki/カナダ",
        "オーストラリア": "https://ja.wikipedia.org/wiki/オーストラリア",
        "ニュージーランド": "https://ja.wikipedia.org/wiki/ニュージーランド",
        "インド": "https://ja.wikipedia.org/wiki/インド",
        "南アフリカ": "https://ja.wikipedia.org/wiki/南アフリカ共和国",
        "ドイツ国": "https://ja.wikipedia.org/wiki/ドイツ国",
        "イタリア王国": "https://ja.wikipedia.org/wiki/イタリア王国",
        "大日本帝国": "https://ja.wikipedia.org/wiki/大日本帝国",
        "ハンガリー王国": "https://ja.wikipedia.org/wiki/ハンガリー王国",
        "ルーマニア王国": "https://ja.wikipedia.org/wiki/ルーマニア王国",
        "フィンランド": "https://ja.wikipedia.org/wiki/フィンランド",
        "ブルガリア王国": "https://ja.wikipedia.org/wiki/ブルガリア王国",
        "タイ": "https://ja.wikipedia.org/wiki/タイ王国",
        "ユーゴスラビア王国": "https://ja.wikipedia.org/wiki/ユーゴスラビア王国"
    };

    const url = wikipediaUrls[countryName];
    if (url) {
        const popup = document.getElementById('wikipedia-popup');
        const overlay = document.querySelector('.overlay');
        const iframe = document.getElementById('wikipedia-frame');
        
        iframe.src = url;
        popup.style.display = 'block';
        overlay.style.display = 'block';

        // 閉じるボタンのイベントリスナー
        const closeBtn = popup.querySelector('.close-btn');
        closeBtn.onclick = function() {
            popup.style.display = 'none';
            overlay.style.display = 'none';
            iframe.src = 'about:blank';
        };

        // オーバーレイクリックで閉じる
        overlay.onclick = function() {
            popup.style.display = 'none';
            overlay.style.display = 'none';
            iframe.src = 'about:blank';
        };
    }
}

// 参加国リストを作成する関数
function createCountryList(countries) {
    return countries.map(country => `
        <li>
            <a href="#" onclick="showWikipedia('${country}'); return false;">${country}</a>
        </li>
    `).join('');
}

// 詳細を表示する関数
function showDetails(content, isCountries = false) {
    const detailsContainer = document.getElementById('details');
    detailsContainer.style.display = 'block';
    if (isCountries) {
        detailsContainer.classList.add('countries-popup');
    } else {
        detailsContainer.classList.remove('countries-popup');
    }
    detailsContainer.innerHTML = `
        <button class="close-btn">閉じる</button>
        ${content}
    `;
    detailsContainer.querySelector('.close-btn').addEventListener('click', () => {
        detailsContainer.style.display = 'none';
    });
}

// 陣営色の表示/非表示を切り替える関数
function toggleFactionColors() {
    showFactionColors = !showFactionColors;
    const factionButton = document.getElementById('faction-button');
    
    // ボタンのアクティブ状態を切り替え
    if (showFactionColors) {
        factionButton.classList.add('active');
    } else {
        factionButton.classList.remove('active');
    }
    
    // レイヤーの表示/非表示を切り替え
    if (map.getLayer('allied-countries')) {
        map.setLayoutProperty('allied-countries', 'visibility', showFactionColors ? 'visible' : 'none');
    }
    if (map.getLayer('axis-countries')) {
        map.setLayoutProperty('axis-countries', 'visibility', showFactionColors ? 'visible' : 'none');
    }
    if (map.getLayer('country-borders')) {
        map.setLayoutProperty('country-borders', 'visibility', showFactionColors ? 'visible' : 'none');
    }
}

// イベントリスナーを設定する関数
function setupEventListeners() {
    // スライダーのイベントリスナー
    const slider = document.getElementById('slider');
    let isDragging = false;
    let dragStartValue = 0;

    slider.addEventListener('mousedown', () => {
        isDragging = true;
        dragStartValue = parseInt(slider.value);
    });

    slider.addEventListener('mouseup', () => {
        isDragging = false;
        const nearestIndex = findNearestEventIndex(parseInt(slider.value));
        if (nearestIndex !== currentEventIndex) {
            currentEventIndex = nearestIndex;
            const startDate = eventToDate(events[0]);
            const endDate = eventToDate(events[events.length - 1]);
            const eventDate = eventToDate(events[currentEventIndex]);
            const newValue = normalizeDate(eventDate, startDate, endDate);
            slider.value = newValue;
            showEvent(currentEventIndex);
        } else {
            slider.value = dragStartValue;
        }
    });

    slider.addEventListener('input', () => {
        if (!isDragging) {
            const nearestIndex = findNearestEventIndex(parseInt(slider.value));
            if (nearestIndex !== currentEventIndex) {
                currentEventIndex = nearestIndex;
                const startDate = eventToDate(events[0]);
                const endDate = eventToDate(events[events.length - 1]);
                const eventDate = eventToDate(events[currentEventIndex]);
                const newValue = normalizeDate(eventDate, startDate, endDate);
                slider.value = newValue;
                showEvent(currentEventIndex);
            }
        }
    });

    // キーボードイベントリスナー
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') {
            moveToNextEvent();
        } else if (e.key === 'ArrowLeft') {
            moveToPreviousEvent();
        }
    });

    // 再生ボタンのイベントリスナー
    document.getElementById('play-button').addEventListener('click', function() {
        if (isPlaying) {
            stopPlayback();
        } else {
            startPlayback();
            this.textContent = '⏸';
        }
    });

    // 停止ボタンのイベントリスナー
    document.getElementById('stop-button').addEventListener('click', () => {
        stopPlayback();
    });

    // 最初のイベントに戻るボタンのイベントリスナー
    document.getElementById('first-button').addEventListener('click', () => {
        stopPlayback();
        currentEventIndex = 0;
        slider.value = 0;
        showEvent(0);
    });

    // 最後のイベントに進むボタンのイベントリスナー
    document.getElementById('last-button').addEventListener('click', () => {
        stopPlayback();
        currentEventIndex = events.length - 1;
        slider.value = 100;
        showEvent(events.length - 1);
    });

    // メニューボタンのイベントリスナー
    const menuButton = document.getElementById('menu-button');
    const menuContent = document.getElementById('menu-content');
    menuButton.addEventListener('click', function() {
        if (menuContent.style.display === 'none' || menuContent.style.display === '') {
            menuContent.style.display = 'block';
        }
    });

    // メニュー外をクリックしたときにメニューを閉じる
    document.addEventListener('click', function(event) {
        if (!menuButton.contains(event.target) && !menuContent.contains(event.target)) {
            menuContent.style.display = 'none';
        }
    });

    // 日本地図ボタンのイベントリスナー
    document.getElementById('japan-button').addEventListener('click', function() {
        flyToJapan();
    });

    // 世界地図ボタンのイベントリスナー
    document.getElementById('world-button').addEventListener('click', function() {
        flyToWorld();
    });

    // イベント一覧ボタンのイベントリスナー
    document.getElementById('events-button').addEventListener('click', function() {
        document.getElementById('events-panel').classList.add('visible');
        updateEventList(); // イベント一覧を更新
    });

    // イベント一覧を閉じるボタンのイベントリスナー
    document.getElementById('close-events').addEventListener('click', function() {
        document.getElementById('events-panel').classList.remove('visible');
    });

    // 検索ボックスのイベントリスナー
    const searchBox = document.getElementById('search-box');
    searchBox.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const eventItems = document.querySelectorAll('.event-item');
        
        eventItems.forEach(item => {
            const title = item.querySelector('.event-title').textContent.toLowerCase();
            const date = item.querySelector('.event-date').textContent.toLowerCase();
            const description = item.getAttribute('data-description')?.toLowerCase() || '';
            
            if (title.includes(searchTerm) || date.includes(searchTerm) || description.includes(searchTerm)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    });

    // 情報ボタンのイベントリスナー
    const infoButton = document.getElementById('info-button');
    const infoPopup = document.getElementById('info-popup');
    infoButton.addEventListener('click', function() {
        infoPopup.style.display = 'block';
    });

    // 情報ポップアップを閉じるボタンのイベントリスナー
    infoPopup.querySelector('.close-btn').addEventListener('click', function() {
        infoPopup.style.display = 'none';
    });

    // 参加国ボタンのイベントリスナー
    document.getElementById('countries-button').addEventListener('click', function() {
        const countriesTable = `
            <h3>太平洋戦争の参加国</h3>
            <div class="countries-container">
                <div class="country-section">
                    <h4>連合国側</h4>
                    <h5>主要国</h5>
                    <ul>
                        ${createCountryList(["アメリカ合衆国", "イギリス連邦", "ソビエト連邦", "中華民国", "フランス共和国"])}
                    </ul>
                    <h5>その他の国</h5>
                    <ul>
                        ${createCountryList(["カナダ", "オーストラリア", "ニュージーランド", "インド", "南アフリカ"])}
                    </ul>
                </div>
                <div class="country-section">
                    <h4>枢軸側</h4>
                    <h5>主要国</h5>
                    <ul>
                        ${createCountryList(["ドイツ国", "イタリア王国", "大日本帝国"])}
                    </ul>
                    <h5>その他の国</h5>
                    <ul>
                        ${createCountryList(["ハンガリー王国", "ルーマニア王国", "フィンランド", "ブルガリア王国", "タイ", "ユーゴスラビア王国"])}
                    </ul>
                </div>
            </div>
        `;
        showDetails(countriesTable, true);
    });

    // 地図を開くボタンのイベントリスナー
    document.getElementById('open-map-button').addEventListener('click', function() {
        document.getElementById('welcome-popup').style.display = 'none';
        document.getElementById('map').style.display = 'block';
        this.style.display = 'none';
        map.resize();
        initializeData();
    });

    // 陣営色切り替えボタンのイベントリスナー
    document.getElementById('faction-button').addEventListener('click', function() {
        toggleFactionColors();
    });
} 