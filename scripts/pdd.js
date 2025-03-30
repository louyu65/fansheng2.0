let currentPage = 1;
let pageSize = 20;
let userIp = '';
let searchId = ''

// 获取用户IP
async function getUserIp() {
    try {
        const response = await fetch('https://myip.aigc.louyu.tech');
        const ip = await response.text();
        userIp = ip;
    } catch (error) {
        console.error('获取IP失败:', error);
        userIp = '';
    }
}

// 显示加载动画
function showLoading() {
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.innerHTML = '<div class="loading-spinner"></div>';
    document.body.appendChild(overlay);
    setTimeout(() => overlay.classList.add('active'), 0);
    return overlay;
}

// 隐藏加载动画
function hideLoading(overlay) {
    overlay.classList.remove('active');
    setTimeout(() => overlay.remove(), 300);
}

// 显示商品详情
function showProductDetail(product) {
    const modal = document.getElementById('productModal');
    const detailContainer = document.getElementById('productDetail');
    const images = product.goods_image_url ? [product.goods_image_url] : [];

    detailContainer.innerHTML = `
        <div class="detail-header">
            <img src="${product.goods_image_url}" alt="${product.goods_name}" class="detail-image">
            <div class="detail-info">
                <h2>${product.goods_name}</h2>
                ${product.goods_desc ? `<p class="goods-desc">${product.goods_desc}</p>` : ''}
                <div class="price-section">
                    <div class="price-group">
                        <span class="discount-price">¥${product.min_group_price / 100}</span>
                        <span class="original-price">¥${product.min_normal_price / 100}</span>
                        ${product.promotion_rate ? `<span class="commission-rate">佣金: ${product.promotion_rate/10}%</span>` : ''}
                        ${product.activity_promotion_rate ? `<span class="activity-commission-rate">活动佣金: ${product.activity_promotion_rate/10}%</span>` : ''}
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
               
                <a href="${product.goods_sign}" target="_blank" class="buy-button" onclick="handleCopyUrlButtonClick(event, '${product.goods_sign}')">复制链接</a>
                <a href="${product.goods_sign}" target="_blank"  class="buy-button" onclick="handleBuyButtonClick(event, '${product.goods_sign}')">立即购买</a>  
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

// 获取店铺类型描述
function getMerchantType(type) {
    const types = {
        1: '个人',
        2: '企业',
        3: '旗舰店',
        4: '专卖店',
        5: '专营店',
        6: '普通店'
    };
    return types[type] || '未知';
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
        101: '大促搜索池',
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

function getServiceTagName(tag) {
    const serviceTags = {
        1: '全场包邮',
        2: '七天退换',
        3: '退货包运费',
        9: '坏果包赔',
        12: '24小时发货',
        13: '48小时发货',
        15: '假一罚十',
        24: '极速退款',
        25: '品质保障'
    };
    return serviceTags[tag] || '';
}

function formatDate(timestamp) {
    const date = new Date(timestamp * 1000);
    return `${date.getMonth() + 1}/${date.getDate()}`;
}

// 展示商品列表
function displayProducts(products) {
    const productList = document.getElementById('productList');
    productList.innerHTML = '';

    if (!products || products.length === 0) {
        productList.innerHTML = `
            <div class="empty-search-container">
                <span class="empty-search-icon">🔍</span>
                <div class="empty-search-message">
                    <h3>暂无搜索结果</h3>
                    <p>我们没有找到符合条件的商品，您可以尝试：</p>
                    <ul>
                        <li>检查输入的关键词是否正确</li>
                        <li>尝试使用其他关键词</li>
                        <li>调整筛选条件</li>
                    </ul>
                </div>
            </div>
        `;
        return;
    }

    products.forEach(product => {
        const productElement = document.createElement('div');
        productElement.className = 'product-item';
        productElement.innerHTML = `
            <div class="product-image-container">
                <img src="${product.goods_thumbnail_url}" alt="${product.goods_name}" class="product-image">
            </div>
            <div class="product-info">
                <div class="basic-info">
                    <div class="title-section">
                        <h2 class="product-title">${product.goods_name}</h2>
                        <div class="category-info">
                            <span class="category-tag">${product.category_name}</span>
                        </div>
                    </div>
                    <div class="meta-section">
                        <div class="shop-info">
                            ${product.brand_name ? `<span class="brand-info prominent"><i class="icon-brand"></i>${product.brand_name}</span>` : ''}
                            <span class="seller-type"><i class="icon-seller"></i>${getMerchantType(product.merchant_type)}</span>
                            <span><i class="icon-shop"></i>${product.mall_name}</span>
                        </div>
                        <div class="service-tags">
                            ${product.service_tags?.map(tag => 
                                `<span class="service-tag">${getServiceTagName(tag)}</span>`
                            ).join('') || ''}
                        </div>
                        <div class="shipping-sales-info">
                            <span class="prominent">销量: ${product.sales_tip}</span>
                            ${product.desc_txt ? `<span class="desc-score">描述: ${product.desc_txt}</span>` : ''}
                            ${product.lgst_txt ? `<span class="lgst-score">物流: ${product.lgst_txt}</span>` : ''}
                            ${product.serv_txt ? `<span class="serv-score">服务: ${product.serv_txt}</span>` : ''}
                        </div>
                    </div>
                </div>
                <div class="promotion-section">
                    <div class="promotion-tags">
                        ${product.unified_tags?.map(tag => 
                            `<span class="tag">${tag}</span>`
                        ).join('') || ''}
                        ${product.activity_type ? `<span class="tag activity-tag">${getActivityTypeName(product.activity_type)}</span>` : ''}
                        ${product.subsidy_goods_type ? `<span class="tag subsidy-tag">${getSubsidyTypeName(product.subsidy_goods_type)}</span>` : ''}
                    </div>
                    <div class="price-action-container">
                        <div class="price-info">
                            <div class="price-group">
                                <span class="discount-price">¥${product.min_group_price / 100}</span>
                                <span class="original-price">¥${product.min_normal_price / 100}</span>
                                ${product.promotion_rate ? `<span class="commission-rate">佣金: ${product.promotion_rate/10}%</span>` : ''}
                            </div>
                            <div class="promotion-info">
                                ${product.has_coupon ? `
                                    <div class="promotion-path">
                                        <span class="coupon-tag">优惠券</span>
                                        <span class="coupon-value">¥${product.coupon_discount / 100}</span>
                                        ${product.coupon_start_time ? `<span class="coupon-time">${formatDate(product.coupon_start_time)}-${formatDate(product.coupon_end_time)}</span>` : ''}
                                    </div>
                                ` : ''}
                                ${product.has_mall_coupon ? `
                                    <div class="promotion-path">
                                        <span class="mall-coupon-tag">店铺券</span>
                                        <span class="mall-coupon-value">¥${product.mall_coupon_discount_pct / 100}</span>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                        <div class="action-buttons">
                            <a href="${product.goods_sign}" target="_blank" class="buy-button" onclick="handleCopyUrlButtonClick(event, '${product.goods_sign}')">复制链接</a>
                            <a href="${product.goods_sign}" target="_blank"  class="buy-button" onclick="handleBuyButtonClick(event, '${product.goods_sign}')">立即购买</a>
                        </div>
                    </div>
                </div>
            </div>
        `;

        productElement.addEventListener('click', () => showProductDetail(product));
        productList.appendChild(productElement);
    });
}

// 搜索商品
async function searchProducts(keyword) {
    const loadingOverlay = showLoading();
    try {
        const startPrice = document.getElementById('startPrice')?.value || '';
        const endPrice = document.getElementById('endPrice')?.value || '';
        const sortType = document.getElementById('sortSelect')?.value || '0';
        const isBrandGoods = document.getElementById('isBrandGoods')?.checked || false;
        const withCoupon = document.getElementById('withCoupon')?.checked || false;
        const merchantType = document.getElementById('merchantType')?.value || '';

        // 构建价格范围参数
        let rangeList = [];
        if (startPrice && endPrice) {
            rangeList.push({
                range_id: 0,
                range_from: startPrice * 100,
                range_to: endPrice * 100
            });
        }

        const url = `https://fanli.aigc.louyu.tech/pddproductsearch?keyword=${encodeURIComponent(keyword)}&page_size=${pageSize}&page_no=${currentPage}&sort_type=${sortType}&with_coupon=${withCoupon}&range_list=${encodeURIComponent(JSON.stringify(rangeList))}&is_brand_goods=${isBrandGoods}&merchant_type=${merchantType}`;

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
        const products = data?.goods_search_response?.goods_list || [];
        searchId = data?.goods_search_response?.search_id || '';
        displayProducts(products);
    } catch (error) {
        console.error('搜索失败:', error);
        displayProducts([]);
    } finally {
        hideLoading(loadingOverlay);
    }
}

// 初始化页面
async function initializePage() {
    await getUserIp();

    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const prevPageButton = document.getElementById('prevPage');
    const nextPageButton = document.getElementById('nextPage');
    const listViewButton = document.getElementById('listView');
    const gridViewButton = document.getElementById('gridView');

    // 搜索按钮点击事件
    searchButton.addEventListener('click', () => {
        currentPage = 1;
        searchProducts(searchInput.value);
    });

    // 回车搜索
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            currentPage = 1;
            searchProducts(searchInput.value);
        }
    });

    // 分页按钮点击事件
    prevPageButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            document.getElementById('currentPage').textContent = currentPage;
            searchProducts(searchInput.value);
        }
    });

    nextPageButton.addEventListener('click', () => {
        currentPage++;
        document.getElementById('currentPage').textContent = currentPage;
        searchProducts(searchInput.value);
    });

    // 视图切换
    listViewButton.addEventListener('click', () => {
        document.getElementById('productList').className = 'product-list list-view';
        listViewButton.classList.add('active');
        gridViewButton.classList.remove('active');
    });

    gridViewButton.addEventListener('click', () => {
        document.getElementById('productList').className = 'product-list grid-view';
        gridViewButton.classList.add('active');
        listViewButton.classList.remove('active');
    });

    // 筛选条件变化时重新搜索
    const filterElements = [
        'sortSelect', 'startPrice', 'endPrice', 'isBrandGoods',
        'withCoupon', 'merchantType'
    ];

    filterElements.forEach(elementId => {
        const element = document.getElementById(elementId);
        if (element) {
            element.addEventListener('change', () => {
                currentPage = 1;
                document.getElementById('currentPage').textContent = currentPage;
                searchProducts(searchInput.value);
            });
        }
    });

    // 初始搜索
    searchProducts(searchInput.value);
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    initializePage();

    // 鼠标轨迹效果
    let lastX = 0;
    let lastY = 0;
    let lastTimestamp = 0;
    
    function createTrailDot(x, y, speed) {
        const dot = document.createElement('div');
        dot.className = 'trail-dot';
        dot.style.left = x + 'px';
        dot.style.top = y + 'px';
        
        // 根据速度调整大小和透明度
        const scale = Math.max(0.4, Math.min(1.2, 1 - speed / 800));
        const opacity = Math.max(0.4, Math.min(1, 1 - speed / 800));
        
        // 生成渐变色
        const hue = (Date.now() / 20) % 360;
        const saturation = Math.min(100, speed * 3 + 70);
        const lightness = Math.max(50, Math.min(80, 100 - speed * 1.5));
        
        dot.style.transform = `scale(${scale}) rotate(${Math.random() * 360}deg)`;
        dot.style.opacity = opacity;
        dot.style.background = `linear-gradient(135deg, 
            hsla(${hue}, ${saturation}%, ${lightness}%, ${opacity}), 
            hsla(${(hue + 45) % 360}, ${saturation - 10}%, ${lightness + 5}%, ${opacity * 0.7})`;
        dot.style.boxShadow = `0 0 ${8 * scale}px rgba(255, 71, 87, ${opacity * 0.5})`;
        
        document.body.appendChild(dot);
        
        requestAnimationFrame(() => {
            dot.style.transform = `scale(${scale * 0.3}) rotate(${Math.random() * 720}deg)`;
            dot.style.opacity = '0';
        });
        
        setTimeout(() => dot.remove(), 1200);
    }
    
    document.addEventListener('mousemove', (e) => {
        const currentTime = Date.now();
        const deltaTime = currentTime - lastTimestamp;
        
        if (deltaTime > 0) {
            const speed = Math.sqrt(
                Math.pow(e.clientX - lastX, 2) + 
                Math.pow(e.clientY - lastY, 2)
            ) / deltaTime;
            
            const minInterval = speed > 1 ? 8 : 16;
            if (deltaTime > minInterval) {
                createTrailDot(e.clientX, e.clientY, speed);
            }
        }
        
        lastX = e.clientX;
        lastY = e.clientY;
        lastTimestamp = currentTime;
    });
    
    // 点击计数相关变量
    let clickCount = 0;
    let lastClickTime = 0;
    const CLICK_RESET_TIME = 10000; // 10秒重置时间

    document.addEventListener('mousedown', (e) => {
        const currentTime = Date.now();
        
        if (currentTime - lastClickTime > CLICK_RESET_TIME) {
            clickCount = 0;
        }
        
        clickCount++;
        lastClickTime = currentTime;
        
        const numberElement = document.createElement('div');
        numberElement.className = 'click-number';
        numberElement.textContent = clickCount;
        numberElement.style.left = e.clientX + 'px';
        numberElement.style.top = e.clientY + 'px';
        
        const hue1 = Math.random() * 360;
        const hue2 = (hue1 + 120) % 360;
        const hue3 = (hue1 + 240) % 360;
        const saturation = 80 + Math.random() * 20;
        const lightness = 60 + Math.random() * 15;
        numberElement.style.background = `linear-gradient(135deg, 
            hsl(${hue1}, ${saturation}%, ${lightness}%), 
            hsl(${hue2}, ${saturation - 10}%, ${lightness + 5}%),
            hsl(${hue3}, ${saturation + 5}%, ${lightness - 5}%))`;
        numberElement.style.webkitBackgroundClip = 'text';
        numberElement.style.webkitTextFillColor = 'transparent';
        
        const force = 40 + Math.random() * 60;
        const lateralForce = (Math.random() - 0.5) * 40;
        
        numberElement.style.transform = 'translate(0, 0) scale(0.5)';
        numberElement.style.opacity = '0.4';
        numberElement.style.transition = 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)';
        
        document.body.appendChild(numberElement);
        
        requestAnimationFrame(() => {
            numberElement.style.setProperty('--offset-x', `${lateralForce}px`);
            numberElement.style.setProperty('--offset-y', `${-force}px`);
            numberElement.style.animation = 'numberFloat 0.8s cubic-bezier(0.23, 1, 0.32, 1) forwards';
            numberElement.style.transform = `translate(${lateralForce}px, ${-force}px) scale(1.1)`;
            numberElement.style.opacity = '0';
        });
        
        setTimeout(() => numberElement.remove(), 800);
    });

    // 添加光标效果
    const cursorElement = document.createElement('div');
    cursorElement.className = 'cursor';
    document.body.appendChild(cursorElement);
    
    const cursor = cursorElement;
    
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });
});

//直接购买
async function handleBuyButtonClick(event, goods_sign) {
    event.preventDefault();
    event.stopPropagation();

   let clickUrl =  await getProductUrl(goods_sign)
    if(clickUrl){
        window.open(clickUrl, '_blank');
    }else{
        alert('获取商品链接失败')
    }
    
}
//复制链接
async function handleCopyUrlButtonClick(event, goods_sign) {
    event.preventDefault();
    event.stopPropagation();

    let clickUrl =  await getProductUrl(goods_sign)
    if(!clickUrl){
        alert('获取商品链接失败')
        return;
    }
    try {
        await navigator.clipboard.writeText(clickUrl);
        
        // 创建提示框
        const toast = document.createElement('div');
        toast.className = 'copy-toast';
        toast.textContent = '链接已复制';
        document.body.appendChild(toast);

        // 显示提示框
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        // 3秒后移除提示框
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 1200);

        // 打开链接
       // window.open(clickUrl, '_blank');
    } catch (error) {
        console.error('复制链接失败:', error);
        alert('复制链接失败，请稍后重试');
    }
}
async function getProductUrl(goods_sign) {
    try {
        const url = `https://fanli.aigc.louyu.tech/pddproducturlcreate?goods_sign_list=["${goods_sign}"]${searchId ? `&search_id=${searchId}` : ''}`;
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
        return shortUrl || null;
    } catch (error) {
        console.error('获取商品链接失败:', error);
        return null;
    }
}

// 在displayProducts函数中修改buy-button的部分
//<a href="javascript:void(0)" class="buy-button" onclick="handleBuyButtonClick(event, '${product.goods_sign}')">立即购买</a>