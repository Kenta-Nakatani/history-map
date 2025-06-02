// イベントデータを保持する変数
let events = [];

// Google Sheets APIの設定
const sheetNames = ['kentamap'];
const spreadsheetId = '1AZgfYRfWLtVXH7rx7BeEPmbmdy7EfnGDbAwi6bMSNsU';
const apiKey = 'AIzaSyAj_tQf-bp0v3j6Pl8S7HQVO5I-D5WI0GQ';

// データを取得する関数
async function fetchData(sheetName) {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}?key=${apiKey}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        console.log('Fetched data:', data);
        const rows = data.values;
        if (!rows || rows.length === 0) {
            console.error('No data found in sheet');
            return [];
        }
        const headers = rows.shift();
        return rows.map(row => {
            const event = {};
            headers.forEach((header, index) => {
                event[header] = row[index] || '';
            });
            return event;
        });
    } catch (error) {
        console.error('Error fetching data:', error);
        return [];
    }
}

// データを初期化する関数
async function initializeData() {
    try {
        events = await fetchData(sheetNames[0]);
        console.log('Initialized events:', events);

        if (events.length === 0) {
            console.error('No events found');
            return;
        }

        // イベントを年代順にソート
        events.sort((a, b) => {
            const yearA = parseInt(a.year) || 0;
            const yearB = parseInt(b.year) || 0;
            if (yearA !== yearB) {
                return yearA - yearB;
            }
            return (parseInt(a.month) || 0) - (parseInt(b.month) || 0);
        });

        // スライダーの最大値を設定
        const slider = document.getElementById('slider');
        slider.max = events.length - 1;

        // 最初のイベントを表示
        showEvent(0);
    } catch (error) {
        console.error('Error initializing data:', error);
    }
}

// イベントを表示する関数
function showEvent(index) {
    const event = events[index];
    const latitude = parseFloat(event.latitude);
    const longitude = parseFloat(event.longitude);

    if (isNaN(longitude) || isNaN(latitude)) {
        console.error(`無効な緯度経度: (${event.longitude}, ${event.latitude})`);
        return;
    }

    flyToLocation(longitude, latitude);
    updateMarker(longitude, latitude);

    const detailsContainer = document.getElementById('details');
    detailsContainer.style.display = 'block';
    detailsContainer.innerHTML = `
        <button class="close-btn">閉じる</button>
        <h3>${event.title || 'タイトルなし'}</h3>
        ${event.imageUrl ? `<img src="${event.imageUrl}" alt="${event.title || 'イベント画像'}">` : ''}
        <p style="margin-top: 20px;">${event.description || '説明なし'}</p>
        <p style="margin-top: 20px;">${event.context || '文脈なし'}</p>
    `;

    detailsContainer.querySelector('.close-btn').addEventListener('click', () => {
        detailsContainer.style.display = 'none';
    });

    // 日付表示を更新
    const dateWindow = document.getElementById('date-window');
    dateWindow.textContent = `${event.month || '??'}月${event.year || '????'}年`;
}

// イベント一覧を更新する関数
function updateEventList() {
    const eventList = document.getElementById('event-list');
    eventList.innerHTML = '';
    events.forEach((event, index) => {
        const li = document.createElement('li');
        li.className = 'event-item';
        li.innerHTML = `
            <div class="event-date">${event.year || '????'}年${event.month || '??'}月</div>
            <div class="event-title">${event.title || 'タイトルなし'}</div>
        `;
        li.addEventListener('click', () => {
            showEvent(index);
            document.getElementById('events-panel').classList.remove('visible');
        });
        eventList.appendChild(li);
    });
} 