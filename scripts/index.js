// 商品推荐轮播功能
async function fetchRecommendations() {
    try {
        const response = await fetch(endpointServerHost+'/pddproductrecommend', {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Accept': 'application/json',
                'origin': 'http://taobao.aigc.louyu.tech'
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data.goods_basic_detail_response.list;
    } catch (error) {
        console.error('Error fetching recommendations:', error);
        return [];
    }
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
        <img src="${product.goods_thumbnail_url}" alt="${product.goods_name}" style="width: 100%; height: 200px; object-fit: cover;">
        <div class="product-info" style="padding: 15px; height: 200px; display: flex; flex-direction: column;">
            <div class="promotion-tags" style="margin-bottom: 8px; min-height: 28px;">
                ${product.unified_tags?.map(tag => 
                    `<span class="tag" style="display: inline-block; padding: 2px 6px; margin-right: 4px; margin-bottom: 4px; background: #fff1f0; color: #ff4757; border-radius: 4px; font-size: 12px;">${tag}</span>`
                ).join('') || ''}
                ${product.activity_type && product.activity_type !== 0 ? `<span class="activity-tag" style="display: inline-block; padding: 2px 6px; margin-right: 4px; margin-bottom: 4px; background: #fff7e6; color: #ff9f43; border-radius: 4px; font-size: 12px;">${getActivityTypeName(product.activity_type)}</span>` : ''}
                ${product.subsidy_goods_type ? `<span class="subsidy-tag" style="display: inline-block; padding: 2px 6px; margin-right: 4px; margin-bottom: 4px; background: #f0f5ff; color: #2d98da; border-radius: 4px; font-size: 12px;">${getSubsidyTypeName(product.subsidy_goods_type)}</span>` : ''}
            </div>
            <h4 style="margin: 0 0 10px; font-size: 14px; height: 42px; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">
                ${product.goods_name}
            </h4>
            <div style="color: #ff4757; font-weight: bold; font-size: 16px; margin-bottom: 5px;">¥${(product.min_group_price / 100).toFixed(2)}</div>
            <div style="color: #666; font-size: 12px; margin-bottom: 10px;">销量: ${product.sales_tip}</div>
            <div class="action-buttons" style="margin-top: auto;">
                <a href="javascript:void(0)" class="buy-button" onclick="event.stopPropagation(); handleCopyUrlButtonClick(event, '${product.goods_sign}')" style="margin-right: 8px;">复制链接</a>
                <a href="javascript:void(0)" class="buy-button" onclick="event.stopPropagation(); handleBuyButtonClick(event, '${product.goods_sign}')">立即购买</a>
            </div>
        </div>
    `;

    card.addEventListener('click', () => showProductDetail(product));
    return card.outerHTML;
}

function getActivityTypeName(type) {
    const activityTypes = {
        0: '无活动',
        1: '秒杀',
        3: '限量折扣',
        12: '限时折扣',
        13: '大促活动',
        14: '名品折扣',
        15: '品牌清仓',
        16: '食品超市',
        17: '一元幸运团',
        21: '9块9',
        24: '幸运半价购',
        25: '定金预售',
        101: '大促搜索池'
    };
    return activityTypes[type] || '特殊活动';
}

function getSubsidyTypeName(type) {
    const subsidyTypes = {
        0: '无补贴',
        1: '千万补贴',
        4: '千万神券',
        6: '佣金翻倍'
    };
    return subsidyTypes[type] || '其他补贴';
}

function formatDate(timestamp) {
    const date = new Date(timestamp * 1000);
    return `${date.getMonth() + 1}.${date.getDate()}`;
}

function getServiceTagName(tag) {
    const serviceTags = {
        '1': '全场包邮',
        '2': '限时发货',
        '4': '退货包运费',
        '8': '24小时发货',
        '16': '48小时发货',
        '32': '退货无忧',
        '64': '包邮退',
        '128': '全国包邮',
        '256': '假一赔十',
        '512': '闪电退款',
        '1024': '七天无理由退换',
        '2048': '退货补运费',
        '4096': '送货入户',
        '8192': '送货上门'
    };
    return serviceTags[tag] || '';
}

function getMerchantType(type) {
    const merchantTypes = {
        1: '个人',
        2: '企业',
        3: '旗舰店',
        4: '专卖店',
        5: '专营店',
        6: '普通店'
    };
    return merchantTypes[type] || '其他';
}

function showProductDetail(product) {
    const modal = document.getElementById('productModal');
    const detailContainer = document.getElementById('productDetail');

    detailContainer.innerHTML = `
        <div class="detail-header">
            <img src="${product.goods_image_url || product.goods_thumbnail_url}" alt="${product.goods_name}" class="detail-image">
            <div class="detail-info">
                <h2>${product.goods_name}</h2>
                ${product.goods_desc ? `<p class="goods-desc">${product.goods_desc}</p>` : ''}
                <div class="price-section">
                    <div class="price-group">
                        <span class="discount-price">¥${product.min_group_price / 100}</span>
                        <span class="original-price">¥${product.min_normal_price / 100}</span>
                        ${product.promotion_rate ? `<span class="commission-rate">佣金: ${product.promotion_rate/10}%</span>` : ''}
                    </div>
                    <div class="promotion-info">
                        ${product.has_coupon ? `
                            <div class="coupon-info">
                                <span class="coupon-tag">优惠券</span>
                                <span class="coupon-value">¥${product.coupon_discount / 100}</span>
                                ${product.coupon_start_time ? `<span class="coupon-time">${formatDate(product.coupon_start_time)}-${formatDate(product.coupon_end_time)}</span>` : ''}
                                <span class="coupon-condition">满${product.coupon_min_order_amount/100}元可用</span>
                            </div>
                        ` : ''}
                        ${product.has_mall_coupon ? `
                            <div class="mall-coupon-info">
                                <span class="mall-coupon-tag">店铺券</span>
                                <span class="mall-coupon-value">¥${product.mall_coupon_discount_pct/100}</span>
                                <span class="mall-coupon-condition">满${product.mall_coupon_min_order_amount/100}元可用</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
                <div class="shop-info">
                    <span class="shop-name">${product.mall_name}</span>
                    <span class="shop-type">${getMerchantType(product.merchant_type)}</span>
                    ${product.brand_name ? `<span class="brand-name">品牌: ${product.brand_name}</span>` : ''}
                </div>
                <div class="rating-info">
                    ${product.desc_txt ? `<span class="desc-score">描述: ${product.desc_txt}</span>` : ''}
                    ${product.lgst_txt ? `<span class="lgst-score">物流: ${product.lgst_txt}</span>` : ''}
                    ${product.serv_txt ? `<span class="serv-score">服务: ${product.serv_txt}</span>` : ''}
                </div>
                <div class="sales-info">
                    <span>销量: ${product.sales_tip}</span>
                </div>
                <div class="activity-info">
                    ${product.activity_type ? `<span class="activity-tag">${getActivityTypeName(product.activity_type)}</span>` : ''}
                    ${product.subsidy_goods_type ? `<span class="subsidy-tag">${getSubsidyTypeName(product.subsidy_goods_type)}</span>` : ''}
                </div>
                <div class="service-tags">
                    ${product.service_tags?.map(tag => `<span class="service-tag">${getServiceTagName(tag)}</span>`).join('') || ''}
                </div>
                <div class="tag-section">
                    ${product.unified_tags?.map(tag => `<span class="tag">${tag}</span>`).join('') || ''}
                </div>
                <div class="action-buttons">
                    <a href="javascript:void(0)" class="buy-button" onclick="handleCopyUrlButtonClick(event, '${product.goods_sign}')">复制链接</a>
                    <a href="javascript:void(0)" class="buy-button" onclick="handleBuyButtonClick(event, '${product.goods_sign}')">立即购买</a>
                </div>
            </div>
        </div>
    `;

    modal.style.display = 'block';

    const closeBtn = document.querySelector('.close');
    closeBtn.onclick = function() {
        modal.style.display = 'none';
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }
}

async function handleCopyUrlButtonClick(event, goods_sign) {
    event.preventDefault();
    try {
        const url = `https://fanli.aigc.louyu.tech/pddproducturlcreate?goods_sign_list=["${goods_sign}"]`;
        const response = await fetch(url, {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Accept': 'application/json',
                'origin': 'http://taobao.aigc.louyu.tech'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const shortUrl = data?.goods_promotion_url_generate_response?.goods_promotion_url_list?.[0]?.short_url;
        if (shortUrl) {
            await navigator.clipboard.writeText(shortUrl);
            alert('链接已复制到剪贴板！');
        } else {
            throw new Error('获取商品链接失败');
        }
    } catch (error) {
        console.error('复制链接失败:', error);
        alert('复制链接失败，请稍后重试');
    }
}

async function handleBuyButtonClick(event, goods_sign) {
    event.preventDefault();
    try {
        const url = `https://fanli.aigc.louyu.tech/pddproducturlcreate?goods_sign_list=["${goods_sign}"]`;
        const response = await fetch(url, {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Accept': 'application/json',
                'origin': 'http://taobao.aigc.louyu.tech'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const shortUrl = data?.goods_promotion_url_generate_response?.goods_promotion_url_list?.[0]?.short_url;
        if (shortUrl) {
            window.open(shortUrl, '_blank');
        } else {
            throw new Error('获取商品链接失败');
        }
    } catch (error) {
        console.error('打开商品链接失败:', error);
        alert('打开商品链接失败，请稍后重试');
    }
}

async function initCarousel() {
    const products = await fetchRecommendations();
    const slide = document.querySelector('.carousel-slide');
    const productsPerSlide = 3;
    let currentIndex = 0;

    function updateSlide() {
        const visibleProducts = products.slice(currentIndex, currentIndex + productsPerSlide);
        slide.innerHTML = visibleProducts.map(createProductCard).join('');
    }

    document.querySelector('.carousel-button.prev').addEventListener('click', () => {
        currentIndex = Math.max(0, currentIndex - productsPerSlide);
        updateSlide();
    });

    document.querySelector('.carousel-button.next').addEventListener('click', () => {
        currentIndex = Math.min(products.length - productsPerSlide, currentIndex + productsPerSlide);
        updateSlide();
    });

    updateSlide();
}

// AI助手功能
const aiAssistant = document.getElementById('aiAssistant');
const chatWindow = document.getElementById('chatWindow');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendMessage = document.getElementById('sendMessage');

aiAssistant.addEventListener('click', () => {
    chatWindow.classList.toggle('active');
    
    // 如果对话框被打开，添加欢迎消息
    if (chatWindow.classList.contains('active')) {
        // 创建AI欢迎消息
        const aiMessageDiv = document.createElement('div');
        aiMessageDiv.style.margin = '10px 0';
        const aiMessageContent = document.createElement('div');
        aiMessageContent.style.background = '#f1f1f1';
        aiMessageContent.style.color = '#333';
        aiMessageContent.style.padding = '8px 12px';
        aiMessageContent.style.borderRadius = '15px 15px 15px 0';
        aiMessageContent.style.display = 'inline-block';
        aiMessageContent.style.maxWidth = '80%';
        aiMessageContent.textContent = '我是AI小管家（Qwen大模型），有什么可以帮到您？';
        aiMessageDiv.appendChild(aiMessageContent);
        chatMessages.appendChild(aiMessageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
});

async function handleUserMessage(message) {
    // 添加用户消息到聊天窗口
    const userMessageDiv = document.createElement('div');
    userMessageDiv.style.textAlign = 'right';
    userMessageDiv.style.margin = '10px 0';
    userMessageDiv.innerHTML = `
        <div style="background: #ff4757; color: white; padding: 8px 12px; border-radius: 15px 15px 0 15px; display: inline-block; max-width: 80%;">
            ${message}
        </div>
    `;
    chatMessages.appendChild(userMessageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    try {
        // 创建AI回复的消息容器
        const aiMessageDiv = document.createElement('div');
        aiMessageDiv.style.margin = '10px 0';
        const aiMessageContent = document.createElement('div');
        aiMessageContent.style.background = '#f1f1f1';
        aiMessageContent.style.color = '#333';
        aiMessageContent.style.padding = '8px 12px';
        aiMessageContent.style.borderRadius = '15px 15px 15px 0';
        aiMessageContent.style.display = 'inline-block';
        aiMessageContent.style.maxWidth = '80%';
        aiMessageDiv.appendChild(aiMessageContent);
        chatMessages.appendChild(aiMessageDiv);

        // 发送请求到OpenAI接口
        const response = await fetch(endpointServerHost+'/openai/chat/stream', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: [{role: "user", content: message}]
            })
        });

        if (!response.ok) throw new Error('网络响应不正常');

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        // 读取流式响应
        while (true) {
            const {done, value} = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value);
            // 解析数据流
            const lines = chunk.split('\n').filter(line => line.trim() !== '');
            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const content = line.slice(5).trim();
                    if (content === '[DONE]') continue;
                    try {
                        const jsonData = JSON.parse(content);
                        if (jsonData.choices && jsonData.choices[0].delta.content) {
                            aiMessageContent.textContent += jsonData.choices[0].delta.content;
                            chatMessages.scrollTop = chatMessages.scrollHeight;
                        }
                    } catch (e) {
                        console.error('解析响应数据出错:', e);
                    }
                }
            }
        }
    } catch (error) {
        console.error('AI回复出错:', error);
        const errorDiv = document.createElement('div');
        errorDiv.style.margin = '10px 0';
        errorDiv.style.color = 'red';
        errorDiv.textContent = '抱歉，AI助手暂时无法回复，请稍后再试。';
        chatMessages.appendChild(errorDiv);
    }
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

sendMessage.addEventListener('click', () => {
    const message = chatInput.value.trim();
    if (message) {
        handleUserMessage(message);
        chatInput.value = '';
    }
});

chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const message = chatInput.value.trim();
        if (message) {
            handleUserMessage(message);
            chatInput.value = '';
        }
    }
});

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    initCarousel();
});

