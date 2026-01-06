// API 配置
const API_BASE_URL = 'http://localhost:5000';
const API_ENDPOINTS = {
    HEALTH: '/api/health',
    PARSE: '/api/parse',
    FORMAT: '/api/format'
};

// DOM 元素
const jsonInput = document.getElementById('jsonInput');
const jsonOutput = document.getElementById('jsonOutput');
const parseBtn = document.getElementById('parseBtn');
const formatBtn = document.getElementById('formatBtn');
const sampleBtn = document.getElementById('sampleBtn');
const clearBtn = document.getElementById('clearBtn');
const copyBtn = document.getElementById('copyBtn');
const charCount = document.getElementById('charCount');
const errorContainer = document.getElementById('errorContainer');
const resultContainer = document.getElementById('resultContainer');
const emptyState = document.getElementById('emptyState');
const errorTitle = document.getElementById('errorTitle');
const errorMessage = document.getElementById('errorMessage');
const dataType = document.getElementById('dataType');
const dataLength = document.getElementById('dataLength');
const originalLength = document.getElementById('originalLength');
const parsedLength = document.getElementById('parsedLength');
const statusIcon = document.getElementById('statusIcon');
const statusText = document.getElementById('statusText');
const notification = document.getElementById('notification');
const notificationText = document.getElementById('notificationText');
const prettyOption = document.getElementById('prettyOption');
const validateOption = document.getElementById('validateOption');

// 示例 JSON 数据
const SAMPLE_JSON = {
    "application": "JSON Parser Tool",
    "version": "1.0.0",
    "author": {
        "name": "John Doe",
        "email": "john@example.com",
        "role": "Developer"
    },
    "features": [
        "JSON parsing",
        "Format validation",
        "Syntax highlighting",
        "Statistics"
    ],
    "status": "active",
    "settings": {
        "autoFormat": true,
        "theme": "light",
        "notifications": true
    },
    "statistics": {
        "totalParses": 1500,
        "successRate": 99.8,
        "averageResponseTime": 120
    }
};

// 初始化函数
function init() {
    // 设置事件监听器
    jsonInput.addEventListener('input', updateCharCount);
    parseBtn.addEventListener('click', parseJson);
    formatBtn.addEventListener('click', formatJson);
    sampleBtn.addEventListener('click', loadSample);
    clearBtn.addEventListener('click', clearInput);
    copyBtn.addEventListener('click', copyResult);
    
    // 初始字符数统计
    updateCharCount();
    
    // 检查 API 状态
    checkApiStatus();
    
    // 设置 API URL 显示
    document.getElementById('apiUrl').textContent = API_BASE_URL;
}

// 更新字符数统计
function updateCharCount() {
    const text = jsonInput.value;
    charCount.textContent = text.length;
    charCount.style.color = text.length > 10000 ? '#dc3545' : '#6c757d';
}

// 检查 API 状态
async function checkApiStatus() {
    try {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.HEALTH}`);
        
        if (response.ok) {
            statusIcon.className = 'status-icon online';
            statusIcon.innerHTML = '<i class="fas fa-circle"></i>';
            statusText.textContent = 'API 状态: 在线';
        } else {
            throw new Error('API 响应异常');
        }
    } catch (error) {
        statusIcon.className = 'status-icon offline';
        statusIcon.innerHTML = '<i class="fas fa-circle"></i>';
        statusText.textContent = 'API 状态: 离线';
        console.error('API 状态检查失败:', error);
    }
}

// 解析 JSON
async function parseJson() {
    const jsonString = jsonInput.value.trim();
    
    if (!jsonString) {
        showError('输入错误', '请输入 JSON 字符串');
        return;
    }
    
    // 显示加载状态
    parseBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 解析中...';
    parseBtn.disabled = true;
    
    try {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.PARSE}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                json_string: jsonString,
                options: {
                    pretty: prettyOption.checked,
                    validate: validateOption.checked
                }
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showResult(data);
        } else {
            showError('解析失败', data.error || '未知错误');
        }
    } catch (error) {
        showError('请求失败', '无法连接到 API 服务器，请检查后端是否运行');
        console.error('解析请求失败:', error);
    } finally {
        // 恢复按钮状态
        parseBtn.innerHTML = '<i class="fas fa-play"></i> 解析 JSON';
        parseBtn.disabled = false;
    }
}

// 格式化 JSON
async function formatJson() {
    const jsonString = jsonInput.value.trim();
    
    if (!jsonString) {
        showError('输入错误', '请输入 JSON 字符串');
        return;
    }
    
    // 显示加载状态
    formatBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 格式化中...';
    formatBtn.disabled = true;
    
    try {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.FORMAT}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                json_string: jsonString
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // 将格式化后的 JSON 放回输入框
            jsonInput.value = data.formatted;
            updateCharCount();
            showNotification('JSON 格式化完成');
        } else {
            showError('格式化失败', data.error || '未知错误');
        }
    } catch (error) {
        showError('请求失败', '无法连接到 API 服务器');
        console.error('格式化请求失败:', error);
    } finally {
        // 恢复按钮状态
        formatBtn.innerHTML = '<i class="fas fa-indent"></i> 格式化';
        formatBtn.disabled = false;
    }
}

// 显示解析结果
function showResult(data) {
    // 隐藏错误和空状态
    errorContainer.classList.add('hidden');
    emptyState.classList.add('hidden');
    
    // 显示结果容器
    resultContainer.classList.remove('hidden');
    
    // 更新统计信息
    if (data.stats) {
        dataType.textContent = data.stats.type;
        dataLength.textContent = data.stats.length;
    }
    
    originalLength.textContent = data.original_length || '-';
    parsedLength.textContent = data.parsed_length || '-';
    
    // 显示解析结果
    const resultJson = JSON.stringify(data.result, null, 2);
    jsonOutput.textContent = resultJson;
    
    // 启用复制按钮
    copyBtn.disabled = false;
    
    // 显示成功通知
    showNotification('JSON 解析成功');
}

// 显示错误信息
function showError(title, message) {
    // 隐藏结果和空状态
    resultContainer.classList.add('hidden');
    emptyState.classList.add('hidden');
    
    // 显示错误容器
    errorContainer.classList.remove('hidden');
    
    // 更新错误信息
    errorTitle.textContent = title;
    errorMessage.textContent = message;
    
    // 禁用复制按钮
    copyBtn.disabled = true;
}

// 加载示例 JSON
function loadSample() {
    const sampleString = JSON.stringify(SAMPLE_JSON, null, 2);
    jsonInput.value = sampleString;
    updateCharCount();
    showNotification('示例 JSON 已加载');
}

// 清空输入
function clearInput() {
    jsonInput.value = '';
    updateCharCount();
    
    // 隐藏所有结果
    errorContainer.classList.add('hidden');
    resultContainer.classList.add('hidden');
    emptyState.classList.remove('hidden');
    
    // 禁用复制按钮
    copyBtn.disabled = true;
    
    showNotification('输入已清空');
}

// 复制结果到剪贴板
function copyResult() {
    const resultText = jsonOutput.textContent;
    
    if (!resultText) {
        showNotification('没有可复制的内容', true);
        return;
    }
    
    navigator.clipboard.writeText(resultText)
        .then(() => {
            showNotification('结果已复制到剪贴板');
        })
        .catch(err => {
            console.error('复制失败:', err);
            showNotification('复制失败，请手动复制', true);
        });
}

// 显示通知
function showNotification(message, isError = false) {
    notificationText.textContent = message;
    
    if (isError) {
        notification.style.backgroundColor = '#dc3545';
    } else {
        notification.style.backgroundColor = '#28a745';
    }
    
    notification.classList.remove('hidden');
    
    // 3秒后自动隐藏
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 3000);
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);