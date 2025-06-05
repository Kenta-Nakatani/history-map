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

// イベントを日付に変換する関数
function eventToDate(event) {
    const year = parseInt(event.year) || 0;
    const month = parseInt(event.month) || 1;
    const day = parseInt(event.day) || 1;
    return new Date(year, month - 1, day);
}

// 日付を0-100の範囲に正規化する関数
function normalizeDate(date, startDate, endDate) {
    const totalDays = (endDate - startDate) / (1000 * 60 * 60 * 24);
    const daysFromStart = (date - startDate) / (1000 * 60 * 60 * 24);
    return (daysFromStart / totalDays) * 100;
}

// イベントをグループ化する関数
function groupEventsByDate(events) {
    const groups = [];
    let currentGroup = [];
    const THREE_MONTHS_MS = 90 * 24 * 60 * 60 * 1000; // 90日をミリ秒に変換

    events.forEach((event, index) => {
        const eventDate = eventToDate(event);
        
        if (currentGroup.length === 0) {
            currentGroup.push({ event, date: eventDate, index });
        } else {
            const firstDateInGroup = eventToDate(currentGroup[0].event);
            if (Math.abs(eventDate - firstDateInGroup) <= THREE_MONTHS_MS) {
                currentGroup.push({ event, date: eventDate, index });
            } else {
                groups.push(currentGroup);
                currentGroup = [{ event, date: eventDate, index }];
            }
        }
    });

    if (currentGroup.length > 0) {
        groups.push(currentGroup);
    }

    return groups;
}

// タイムラインのイベントドットを更新する関数
function updateTimelineEvents() {
    const timelineEvents = document.getElementById('timeline-events');
    timelineEvents.innerHTML = '';

    if (events.length === 0) return;

    const startDate = eventToDate(events[0]);
    const endDate = eventToDate(events[events.length - 1]);
    const eventGroups = groupEventsByDate(events);

    eventGroups.forEach(group => {
        group.forEach(({ event, index }, groupIndex) => {
            const date = eventToDate(event);
            const position = normalizeDate(date, startDate, endDate);
            
            const dot = document.createElement('div');
            dot.className = 'event-dot';
            dot.style.left = `${position}%`;
            
            // グループ内の位置に応じて上下に分散
            if (group.length > 1) {
                const offset = (groupIndex - (group.length - 1) / 2) * 20; // 20pxずつ上下に分散
                dot.style.top = `calc(50% + ${offset}px)`;
            } else {
                dot.style.top = '50%';
            }
            
            // ツールチップを追加
            dot.title = `${event.year}年${event.month}月${event.day || 1}日: ${event.title || 'タイトルなし'}`;
            
            timelineEvents.appendChild(dot);
        });
    });
}

// 最も近いイベントのインデックスを取得する関数
function findNearestEventIndex(value) {
    const startDate = eventToDate(events[0]);
    const endDate = eventToDate(events[events.length - 1]);
    const targetDate = new Date(startDate.getTime() + (endDate - startDate) * (value / 100));

    let nearestIndex = 0;
    let minDiff = Infinity;

    events.forEach((event, index) => {
        const eventDate = eventToDate(event);
        const diff = Math.abs(eventDate - targetDate);
        if (diff < minDiff) {
            minDiff = diff;
            nearestIndex = index;
        }
    });

    return nearestIndex;
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
            const dateA = eventToDate(a);
            const dateB = eventToDate(b);
            return dateA - dateB;
        });

        // タイムラインのイベントドットを更新
        updateTimelineEvents();

        // スライダーの最大値を設定
        const slider = document.getElementById('slider');
        slider.max = 100;

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
        li.setAttribute('data-description', event.description || '');
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