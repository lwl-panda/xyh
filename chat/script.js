let currentFriend = null; // 当前聊天对象
let messageLibrary = {};  // 动态加载的回复库

// 用户头像
const myAvatar = 'assets/images/微信图片_20250316155922.jpg';

/*
 * 动态加载回复库
 */
async function loadReplies() {
    try {
        // 同时加载所有回复库文件
        const [damageBroResponse, happyPandaResponse] = await Promise.all([
            fetch('assets/replies/damageBro.json'),
            fetch('assets/replies/happyPanda.json')
        ]);

        // 解析 JSON 数据
        messageLibrary.damageBro = await damageBroResponse.json();
        messageLibrary.happyPanda = await happyPandaResponse.json();

        console.log('回复库加载成功！');
    } catch (error) {
        console.error('回复库加载失败：', error);
    }
}

/*
 * 初始化本地存储
 * @param {string} friendId - 好友ID
 */
function initStorage(friendId) {
    if (!localStorage.getItem(friendId + '-chat')) {
        localStorage.setItem(friendId + '-chat', JSON.stringify([])); // 创建空聊天记录
    }
}

/*
 * 进入聊天界面
 * @param {string} friendId - 好友ID
 */
function enterChat(friendId) {
    currentFriend = friendId;

    // 切换界面
    document.getElementById('contactsContainer').style.display = 'none';
    document.getElementById('chatContainer').style.display = 'flex';

    // 更新头部信息
    const friend = messageLibrary[friendId];
    document.getElementById('currentName').textContent = friend.name;

    // 加载历史记录
    initStorage(friendId);
    loadHistory(friendId);
}

/*
 * 返回联系人列表
 */
function showContacts() {
    document.getElementById('contactsContainer').style.display = 'block';
    document.getElementById('chatContainer').style.display = 'none';
    currentFriend = null;
}

/*
 * 加载历史消息
 * @param {string} friendId - 好友ID
 */
function loadHistory(friendId) {
    const history = JSON.parse(localStorage.getItem(friendId + '-chat')) || [];
    const area = document.getElementById('messageArea');
    area.innerHTML = ''; // 清空现有消息

    let lastTime = null;
    history.forEach(msg => {
        // 超过5分钟间隔显示时间戳
        if (lastTime && (msg.time - lastTime) > 5 * 60 * 1000) {
            addTimeToUI(lastTime);
        }
        addMessageToUI(msg.text, msg.type, msg.time, false);
        lastTime = msg.time;
    });
    area.scrollTop = area.scrollHeight; // 自动滚动到底部
}

/*
 * 发送消息
 */
function sendMessage() {
    const input = document.getElementById('messageInput');
    const message = input.value.trim();
    if (!message) return;

    // 检测用户输入是否为“lwl”
    if (message === 'lwl') {
        toggleAdmin();
        input.value = '';
        return;
    }

    // 检测用户输入是否为“计算器”
    if (message === "计算器") {
        // 跳转到计算器页面
        window.location.href = '../calculator/index.html'; // 修改为正确的路径
        return; // 结束函数，不再执行后续逻辑
    }

    // 检测用户输入是否为“雷达图”
    if (message === "雷达图") {
        // 跳转到雷达图页面
        window.location.href = '../lei_da_tu/index.html'; // 修改为正确的路径
        return; // 结束函数，不再执行后续逻辑
    }

    // 检测用户输入是否为“xyh”
    if (message === "...") {
        // 跳转到生日页面
        window.location.href = '../happy-birthday-main/index.html'; // 修改为正确的路径
        return; // 结束函数，不再执行后续逻辑
    }

    // 原有逻辑：处理普通消息
    saveMessage(message, 'my'); // 保存用户消息
    setTimeout(() => {
        const response = generateResponse(message); // 生成回复
        saveMessage(response, 'friend'); // 保存好友回复
    }, 800 + Math.random() * 1200); // 模拟思考延迟

    input.value = ''; // 清空输入框
}

/*
 * 生成自动回复
 * @param {string} message - 用户输入内容
 * @returns {string} 生成的回复内容
 */
function generateResponse(message) {
    const friend = messageLibrary[currentFriend];
    // 根据好友类型配置表情符号
    const emojis = currentFriend === 'happyPanda' ?
        ["❤️", "✨", "🌈", "🎉", "🤗"] :
        ["🙄", "💩", "👎", "🤦♂️"];

    // 关键词匹配优先级高于通用回复
    for (const key of Object.keys(friend.keywords)) {
        if (new RegExp(key).test(message)) {
            return randomSelect(friend.keywords[key]);
        }
    }
    // 通用回复拼接表情符号
    return randomSelect(friend.general) + randomSelect(emojis);
}

/*
 * 随机选择数组元素
 * @param {Array} arr - 数组
 * @returns {any} 随机元素
 */
function randomSelect(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

/*
 * 保存消息到本地存储
 * @param {string} text - 消息内容
 * @param {'my'|'friend'} type - 消息类型
 */
function saveMessage(text, type) {
    const msg = {
        text,
        type,
        time: Date.now() // 时间戳
    };

    const history = JSON.parse(localStorage.getItem(currentFriend + '-chat')) || [];
    // 时间间隔检查
    const lastMessage = history[history.length - 1];
    if (lastMessage && (msg.time - lastMessage.time) > 5 * 60 * 1000) {
        addTimeToUI(lastMessage.time);
    }

    history.push(msg);
    localStorage.setItem(currentFriend + '-chat', JSON.stringify(history));
    addMessageToUI(text, type, msg.time, true);
}

/*
 * 添加消息到界面
 * @param {string} text - 消息内容
 * @param {'my'|'friend'} type - 消息类型
 * @param {number} time - 时间戳
 * @param {boolean} isNew - 是否是新消息
 */
function addMessageToUI(text, type, time, isNew) {
    const area = document.getElementById('messageArea');
    const friend = messageLibrary[currentFriend];

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;

    const avatar = document.createElement('img');
    avatar.src = type === 'friend' ? friend.avatar : myAvatar;
    avatar.className = 'message-avatar';

    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    bubble.innerHTML = text;

    if (type === 'friend') {
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(bubble);
    } else {
        messageDiv.appendChild(bubble);
        messageDiv.appendChild(avatar);
    }

    area.appendChild(messageDiv);

    if (isNew) {
        area.scrollTop = area.scrollHeight;
    }
}

/*
 * 添加时间到界面
 * @param {number} time - 时间戳
 */
function addTimeToUI(time) {
    const area = document.getElementById('messageArea');
    const timeDiv = document.createElement('div');
    timeDiv.className = 'message-time';
    timeDiv.textContent = formatTime(time);
    area.appendChild(timeDiv);
}

/*
 * 时间格式化
 * @param {number} timestamp - 时间戳
 * @returns {string} 格式化后的时间
 */
function formatTime(timestamp) {
    const date = new Date(timestamp);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}

/*
 * 回车发送消息
 * @param {Event} e - 键盘事件
 */
function handleEnter(e) {
    if (e.key === 'Enter') sendMessage();
}

/*
 * 管理界面：刷新列表
 */
function refreshLists() {
    const friend = document.getElementById('selectFriend').value;
    const friendData = messageLibrary[friend];

    // 刷新关键词列表
    const keywordList = document.getElementById('keywordList');
    keywordList.innerHTML = '';
    Object.keys(friendData.keywords).forEach(key => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span style="color:blue">${key}</span> →
            ${friendData.keywords[key].join(', ')}
            <button onclick="deleteKeyword('${friend}', '${key}')">删除</button>
        `;
        keywordList.appendChild(li);
    });

    // 刷新通用回复列表
    const generalList = document.getElementById('generalList');
    generalList.innerHTML = '';
    friendData.general.forEach((reply, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            ${reply}
            <button onclick="deleteGeneral('${friend}', ${index})">删除</button>
        `;
        generalList.appendChild(li);
    });
}



// 在 loadReplies 函数中添加 localStorage 合并逻辑
async function loadReplies() {
    try {
        // 加载默认回复库
        const [damageBroResponse, happyPandaResponse] = await Promise.all([
            fetch('assets/replies/damageBro.json'),
            fetch('assets/replies/happyPanda.json')
        ]);

        // 解析默认数据
        const defaultReplies = {
            damageBro: await damageBroResponse.json(),
            happyPanda: await happyPandaResponse.json()
        };

        // 加载用户自定义回复
        const customReplies = JSON.parse(localStorage.getItem('customReplies')) || {};

        // 合并默认回复和用户自定义回复
        messageLibrary.damageBro = mergeReplies(defaultReplies.damageBro, customReplies.damageBro);
        messageLibrary.happyPanda = mergeReplies(defaultReplies.happyPanda, customReplies.happyPanda);

        console.log('回复库加载成功！');
    } catch (error) {
        console.error('回复库加载失败：', error);
    }
}

// 合并回复的逻辑（用户自定义内容覆盖默认内容）
function mergeReplies(defaultData, customData = {}) {
    return {
        general: [...(defaultData.general || []), ...(customData.general || [])],
        keywords: { ...(defaultData.keywords || {}), ...(customData.keywords || {}) },
        avatar: defaultData.avatar // 保持默认头像
    };
}

// 修改添加回复函数，添加保存到 localStorage 的逻辑
function addKeywordReply() {
    const friend = document.getElementById('selectFriend').value;
    const key = document.getElementById('newKeyword').value.trim();
    const reply = document.getElementById('newReply').value.trim();

    if (!key || !reply) return alert('请填写完整');

    // 更新内存中的数据
    if (!messageLibrary[friend].keywords[key]) {
        messageLibrary[friend].keywords[key] = [];
    }
    messageLibrary[friend].keywords[key].push(reply);

    // 保存到 localStorage
    saveCustomReplies();
    alert('关键词回复添加成功！');
}

function addGeneralReply() {
    const friend = document.getElementById('selectFriend').value;
    const reply = document.getElementById('newGeneralReply').value.trim();

    if (!reply) return alert('请输入内容');

    // 更新内存中的数据
    messageLibrary[friend].general.push(reply);

    // 保存到 localStorage
    saveCustomReplies();
    alert('通用回复添加成功！');
}

// 将用户自定义回复保存到 localStorage
function saveCustomReplies() {
    const customReplies = {
        damageBro: {
            general: messageLibrary.damageBro.general,
            keywords: messageLibrary.damageBro.keywords
        },
        happyPanda: {
            general: messageLibrary.happyPanda.general,
            keywords: messageLibrary.happyPanda.keywords
        }
    };
    localStorage.setItem('customReplies', JSON.stringify(customReplies));
}

// 添加 toggleAdmin 函数（在文件末尾添加）
function toggleAdmin() {
    const panel = document.getElementById('adminInterface');
    const adminPanel = document.getElementById('adminPanel');

    // 切换显示状态
    if (panel.style.display === 'none') {
        panel.style.display = 'block';
        adminPanel.style.display = 'block';
    } else {
        panel.style.display = 'none';
        adminPanel.style.display = 'none';
    }
}

// 删除不再需要的旧管理功能函数
// 移除以下函数：
// - refreshLists()
// - deleteKeyword()
// - deleteGeneral()

// 添加输入框聚焦时的滚动逻辑
document.querySelectorAll('input').forEach(input => {
    input.addEventListener('focus', () => {
        setTimeout(() => {
            input.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
    });
});

// 添加输入框聚焦时的滚动逻辑
document.querySelectorAll('input').forEach(input => {
    input.addEventListener('focus', () => {
        setTimeout(() => {
            input.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
    });
});

// 初始化手势操作
function initSwipe() {
    const adminPanel = document.getElementById('adminInterface');
    const hammer = new Hammer(adminPanel);
    hammer.on('swipedown', () => toggleAdmin());
}
// 在 load 事件中调用
window.addEventListener('load', () => {
    initSwipe();
});