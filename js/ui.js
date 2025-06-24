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
    const countryFlags = {
        "アメリカ合衆国": "flag-icon-us",
        "イギリス連邦": "flag-icon-gb",
        "ソビエト連邦": "flag-icon-ru",
        "中華民国": "flag-icon-cn",
        "フランス共和国": "flag-icon-fr",
        "カナダ": "flag-icon-ca",
        "オーストラリア": "flag-icon-au",
        "ニュージーランド": "flag-icon-nz",
        "インド": "flag-icon-in",
        "南アフリカ": "flag-icon-za",
        "ドイツ国": "flag-icon-de",
        "イタリア王国": "flag-icon-it",
        "大日本帝国": "flag-icon-jp",
        "ハンガリー王国": "flag-icon-hu",
        "ルーマニア王国": "flag-icon-ro",
        "フィンランド": "flag-icon-fi",
        "ブルガリア王国": "flag-icon-bg",
        "タイ": "flag-icon-th",
        "ユーゴスラビア王国": "flag-icon-rs"
    };

    return countries.map(country => `
        <li>
            <span class="flag-icon ${countryFlags[country]}"></span>
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
            document.getElementById('year-submenu').style.display = 'none';
        }
    });

    // 年代メニューボタンのイベントリスナー
    const yearMenuButton = document.getElementById('year-menu-button');
    const yearSubmenu = document.getElementById('year-submenu');
    yearMenuButton.addEventListener('click', function(event) {
        event.stopPropagation();
        if (yearSubmenu.style.display === 'none' || yearSubmenu.style.display === '') {
            yearSubmenu.style.display = 'block';
        } else {
            yearSubmenu.style.display = 'none';
        }
    });

    // 年代ボタンのイベントリスナー
    const btn1938 = document.getElementById('btn-1938');
    const btn1945 = document.getElementById('btn-1945');
    const btn2024 = document.getElementById('btn-2024');

    function updateButtonStates(activeButton) {
        [btn1938, btn1945, btn2024].forEach(btn => {
            btn.classList.remove('active');
            btn.classList.remove('inactive');
        });
        if (isMapVisible) {
            activeButton.classList.add('active');
        } else {
            activeButton.classList.add('inactive');
        }
    }

    if (btn1938 && btn1945 && btn2024) {
        btn1938.addEventListener('click', () => {
            if (currentYear === 1938) {
                isMapVisible = !isMapVisible;
                toggleMapVisibility();
                updateButtonStates(btn1938);
            } else {
                currentYear = 1938;
                isMapVisible = true;
                updateButtonStates(btn1938);
                loadBorders(1938);
            }
        });

        btn1945.addEventListener('click', () => {
            if (currentYear === 1945) {
                isMapVisible = !isMapVisible;
                toggleMapVisibility();
                updateButtonStates(btn1945);
            } else {
                currentYear = 1945;
                isMapVisible = true;
                updateButtonStates(btn1945);
                loadBorders(1945);
            }
        });

        btn2024.addEventListener('click', () => {
            if (currentYear === 2024) {
                isMapVisible = !isMapVisible;
                toggleMapVisibility();
                updateButtonStates(btn2024);
            } else {
                currentYear = 2024;
                isMapVisible = true;
                updateButtonStates(btn2024);
                loadBorders(2024);
            }
        });
    }

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

    // 陣営色切り替えボタンのイベントリスナー
    document.getElementById('faction-button').addEventListener('click', function() {
        const countriesPopup = document.getElementById('countries-popup');
        const overlay = document.querySelector('.overlay');
        
        // 国リストを更新
        document.getElementById('allied-major').innerHTML = createCountryList(["アメリカ合衆国", "イギリス連邦", "ソビエト連邦", "中華民国", "フランス共和国"]);
        document.getElementById('allied-others').innerHTML = createCountryList(["カナダ", "オーストラリア", "ニュージーランド", "インド", "南アフリカ"]);
        document.getElementById('axis-major').innerHTML = createCountryList(["ドイツ国", "イタリア王国", "大日本帝国"]);
        document.getElementById('axis-others').innerHTML = createCountryList(["ハンガリー王国", "ルーマニア王国", "フィンランド", "ブルガリア王国", "タイ", "ユーゴスラビア王国"]);
        
        // ポップアップを表示
        countriesPopup.style.display = 'block';
        overlay.style.display = 'block';

        // 閉じるボタンのイベントリスナー
        const closeBtn = countriesPopup.querySelector('.close-btn');
        closeBtn.onclick = function() {
            countriesPopup.style.display = 'none';
            overlay.style.display = 'none';
        };

        // オーバーレイクリックで閉じる
        overlay.onclick = function() {
            countriesPopup.style.display = 'none';
            overlay.style.display = 'none';
        };
    });

    // 地図を開くボタンのイベントリスナー
    document.getElementById('open-map-button').addEventListener('click', function() {
        document.getElementById('welcome-popup').style.display = 'none';
        document.getElementById('map').style.display = 'block';
        this.style.display = 'none';
        map.resize();
        initializeData();
    });
} 