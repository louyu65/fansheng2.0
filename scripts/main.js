let currentPage = 1;
const pageSize = 10;
let userIp = '';

// 获取用户 IP
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

// 鼠标轨迹效果
document.addEventListener('DOMContentLoaded', () => {
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
        
        // 延长动画时间
        requestAnimationFrame(() => {
            dot.style.transform = `scale(${scale * 0.3}) rotate(${Math.random() * 720}deg)`;
            dot.style.opacity = '0';
        });
        
        // 延长消失时间
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
            
            // 根据速度调整轨迹点的生成
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
        
        // 检查是否需要重置计数
        if (currentTime - lastClickTime > CLICK_RESET_TIME) {
            clickCount = 0;
        }
        
        // 更新点击信息
        clickCount++;
        lastClickTime = currentTime;
        
        // 创建点击数字效果
        const numberElement = document.createElement('div');
        numberElement.className = 'click-number';
        numberElement.textContent = clickCount;
        numberElement.style.left = e.clientX + 'px';
        numberElement.style.top = e.clientY + 'px';
        
        // 生成更丰富的渐变色
        const hue1 = Math.random() * 360;
        const hue2 = (hue1 + 120) % 360;
        const hue3 = (hue1 + 240) % 360;
        const saturation = 80 + Math.random() * 20;
        const lightness = 60 + Math.random() * 15;
        numberElement.style.background = `linear-gradient(135deg, 
            hsl(${hue1}, ${saturation}%, ${lightness}%), 
            hsl(${hue2}, ${saturation - 10}%, ${lightness + 5}%),
            hsl(${hue3}, ${saturation + 5}%, ${lightness - 5}%))`;        numberElement.style.webkitBackgroundClip = 'text';
        numberElement.style.webkitTextFillColor = 'transparent';
        numberElement.style.webkitBackgroundClip = 'text';
        numberElement.style.webkitTextFillColor = 'transparent';
        
        // 生成更自然的上升动画参数
        const force = 40 + Math.random() * 60; // 控制上升高度
        const lateralForce = (Math.random() - 0.5) * 40; // 控制左右偏移
        
        // 设置初始状态和动画属性
        numberElement.style.transform = 'translate(0, 0) scale(0.5)';
        numberElement.style.opacity = '0.4';
        numberElement.style.transition = 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)';
        
        // 添加到页面
        document.body.appendChild(numberElement);
        
        // 触发动画，使用CSS变量实现上升消失效果
        requestAnimationFrame(() => {
            numberElement.style.setProperty('--offset-x', `${lateralForce}px`);
            numberElement.style.setProperty('--offset-y', `${-force}px`);
            numberElement.style.animation = 'numberFloat 0.8s cubic-bezier(0.23, 1, 0.32, 1) forwards';
            numberElement.style.transform = `translate(${lateralForce}px, ${-force}px) scale(1.1)`;
            numberElement.style.opacity = '0';
        });
        
        // 移除元素
        setTimeout(() => numberElement.remove(), 800);
    });
});

// 搜索商品
async function searchProducts(keyword) {
    try {
        const url =`https://fanli.aigc.louyu.tech/?keyword=${encodeURIComponent(keyword)}&page_size=${pageSize}&page_no=${currentPage}&userIp=${userIp}`;
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
        const products = data.tbk_dg_material_optional_upgrade_response.result_list.map_data;
        displayProducts(products);
    } catch (error) {
        console.error('搜索失败:', error);
        alert('搜索失败: ' + error.message);
    }
}

// 显示商品列表
// 添加光标效果
document.addEventListener('DOMContentLoaded', () => {
    const cursor = document.querySelector('.cursor');
    let lastX = 0;
    let lastY = 0;
    let lastTimestamp = 0;
    
    function createTrailDot(x, y, speed) {
        const dot = document.createElement('div');
        dot.className = 'trail-dot';
        dot.style.left = x + 'px';
        dot.style.top = y + 'px';
        
        // 根据速度调整大小和透明度
        const scale = Math.max(0.3, Math.min(1, 1 - speed / 1000));
        const opacity = Math.max(0.2, Math.min(0.8, 1 - speed / 1000));
        
        dot.style.transform = `scale(${scale})`;
        dot.style.opacity = opacity;
        
        // 添加渐变色
        const hue = (Date.now() / 30) % 360;
        dot.style.backgroundColor = `hsla(${hue}, 80%, 60%, ${opacity})`;
        
        document.body.appendChild(dot);
        
        // 动画效果
        setTimeout(() => {
            dot.style.transform = `scale(0)`;
            dot.style.opacity = '0';
        }, 50);
        
        // 移除元素
        setTimeout(() => dot.remove(), 1000);
    }
    
    document.addEventListener('mousemove', (e) => {
        const currentTime = Date.now();
        const deltaTime = currentTime - lastTimestamp;
        
        if (deltaTime > 0) {
            const speed = Math.sqrt(
                Math.pow(e.clientX - lastX, 2) + 
                Math.pow(e.clientY - lastY, 2)
            ) / deltaTime;
            
            // 调整轨迹点的生成条件，降低速度阈值，减少时间间隔要求
            if (speed > 0 && deltaTime > 16) {
                createTrailDot(e.clientX, e.clientY, speed);
            }
            
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        }
        
        lastX = e.clientX;
        lastY = e.clientY;
        lastTimestamp = currentTime;
    });
    
    document.addEventListener('mousedown', (e) => {
        cursor.style.transform = 'scale(0.8)';
        
        // 创建爆炸效果
        for (let i = 0; i < 8; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = e.clientX + 'px';
            particle.style.top = e.clientY + 'px';
            
            // 随机运动方向
            const angle = (i / 8) * Math.PI * 2;
            const velocity = 2 + Math.random() * 2;
            particle.style.transform = `translate(${Math.cos(angle) * 50}px, ${Math.sin(angle) * 50}px)`;
            
            document.body.appendChild(particle);
            setTimeout(() => particle.remove(), 800);
        }
        
        // 创建红包效果
        const redPacket = document.createElement('div');
        redPacket.className = 'red-packet';
        redPacket.style.left = e.clientX + 'px';
        redPacket.style.top = e.clientY + 'px';
        document.body.appendChild(redPacket);
        setTimeout(() => redPacket.remove(), 500);
    });
    
    document.addEventListener('mouseup', () => {
        cursor.style.transform = 'scale(1)';
    });
});

// 修改显示商品列表的函数
function displayProducts(products) {
    const productList = document.getElementById('productList');
    productList.innerHTML = '';

    products.forEach(product => {
        const basicInfo = product.item_basic_info;
        const priceInfo = product.price_promotion_info;
        const publishInfo = product.publish_info;
        const images = basicInfo.small_images?.string || [];
        
        const productElement = document.createElement('div');
        productElement.className = 'product-item';
        productElement.innerHTML = `
            <div class="product-image-container">
                <div class="product-image-slider" style="width: ${images.length * 100}%;height: auto;display: flex;">
                    ${images.map(img => `
                        <img src="${img}" alt="${basicInfo.title}" class="product-image" style="width: ${100 / images.length}%;flex: 0 0 ${100 / images.length}%;">
                    `).join('')}
                </div>
                <div class="slider-dots">
                    ${images.map((_, index) => `
                        <div class="slider-dot ${index === 0 ? 'active' : ''}"></div>
                    `).join('')}
                </div>
                <div class="promotion-tags image-tags">
                    ${priceInfo.promotion_tag_list?.promotion_tag_map_data?.map(tag => 
                        `<span class="tag">${tag.tag_name}</span>`
                    ).join('') || ''}
                </div>
            </div>
            <div class="product-info">
                <div class="basic-info">
                    <div class="title-section">
                        <h2 class="product-title">${basicInfo.title}</h2>
                        <h3 class="product-subtitle">${basicInfo.short_title}</h3>
                        <div class="category-info">
                            <span class="category-tag">${basicInfo.category_name}</span>
                            <span class="category-tag">${basicInfo.level_one_category_name}</span>
                        </div>
                    </div>
                    <div class="meta-section">
                        <div class="shop-info">
                            ${basicInfo.brand_name ? `<span class="brand-info prominent"><i class="icon-brand"></i>${basicInfo.brand_name}</span>` : `<span><i class="icon-brand"></i>无品牌</span>`}
                    
                            <span class="seller-type ${basicInfo.user_type === 1 ? 'tmall' : basicInfo.user_type === 3 ? 'special' : 'taobao'}"><i class="icon-seller"></i>${basicInfo.user_type === 1 ? '天猫' : basicInfo.user_type === 3 ? '特价版' : '淘宝'}</span>
                            <span><i class="icon-shop"></i>${basicInfo.shop_title}</span>
                        </div>
                        <div class="shipping-sales-info">
                            <span><i class="icon-location"></i>${basicInfo.provcity}</span>
                            <span><i class="icon-shipping"></i>${basicInfo.real_post_fee === '0.00' ? '包邮' : `¥${basicInfo.real_post_fee}`}</span>
                            <span class="${Number(basicInfo.annual_vol) > 100 ? 'prominent' : ''}">年销量: ${basicInfo.annual_vol || 0}</span>
                            <span class="${Number(basicInfo.volume) > 50 ? 'prominent' : ''}">月销量: ${basicInfo.volume || 0}</span>
                        </div>
                    </div>
                </div>
                <div class="promotion-section">
                    <div class="price-info">
                        <div class="price-group">
                            <span class="discount-price">¥${priceInfo.zk_final_price}</span>
                            <span class="original-price">¥${priceInfo.reserve_price}</span>
                            ${priceInfo.final_promotion_price ? `<span class="promotion-price">促销价: ¥${priceInfo.final_promotion_price}</span>` : ''}
                            ${priceInfo.predict_rounding_up_price ? `<span class="rounding-price">凑单价: ¥${priceInfo.predict_rounding_up_price}<span class="rounding-desc">${priceInfo.predict_rounding_up_price_desc}</span></span>` : ''}
                        </div>
                        <div class="promotion-info">
                            ${priceInfo.final_promotion_path_list?.final_promotion_path_map_data?.map(path => 
                                `<div class="promotion-path">${path.promotion_title}: ${path.promotion_desc}</div>`
                            ).join('') || ''}
                            ${priceInfo.more_promotion_list?.more_promotion_map_data?.map(promo => 
                                `<div class="more-promotion">${promo.promotion_title}: ${promo.promotion_desc}</div>`
                            ).join('') || ''}
                        </div>
                    </div>
                    <a href="${publishInfo.click_url}" target="_blank" class="buy-button">立即购买</a>
                </div>
            </div>
        `;

        // 添加图片轮播功能
        const slider = productElement.querySelector('.product-image-slider');
        const dots = productElement.querySelectorAll('.slider-dot');
        let currentSlide = 0;
        let autoplayInterval;

        // 创建 Intersection Observer
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    startAutoplay();
                } else {
                    stopAutoplay();
                }
            });
        }, { threshold: [0.2, 0.4, 0.6, 0.8] });

        observer.observe(productElement);

        function startAutoplay() {
            if (!autoplayInterval && images.length > 1) {
                autoplayInterval = setInterval(() => {
                    currentSlide = (currentSlide + 1) % images.length;
                    updateSlider();
                }, 3000);
            }
        }

        function stopAutoplay() {
            if (autoplayInterval) {
                clearInterval(autoplayInterval);
                autoplayInterval = null;
            }
        }

        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                currentSlide = index;
                updateSlider();
                stopAutoplay();
                startAutoplay();
            });
        });

        productElement.addEventListener('mouseenter', stopAutoplay);
        productElement.addEventListener('mouseleave', startAutoplay);

        function updateSlider() {
            slider.style.transform = `translateX(-${currentSlide * (100 / images.length)}%)`;
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentSlide);
            });
        }

        productElement.addEventListener('click', () => showProductDetail(product));
        productList.appendChild(productElement);
    });
}

// 修改商品详情显示函数
function showProductDetail(product) {
    const modal = document.getElementById('productModal');
    const productDetail = document.getElementById('productDetail');
    const basicInfo = product.item_basic_info;
    const priceInfo = product.price_promotion_info;
    const publishInfo = product.publish_info;
    
    productDetail.innerHTML = `
        <div class="detail-header">
            <img src="${basicInfo.pict_url}" alt="${basicInfo.title}" class="detail-image">
            <div class="detail-info">
                <h2>${basicInfo.title}</h2>
                <h3>${basicInfo.short_title}</h3>
                <span class="seller-type ${basicInfo.user_type === 1 ? 'tmall' : basicInfo.user_type === 3 ? 'special' : 'taobao'}"><i class="icon-seller"></i>${basicInfo.user_type === 1 ? '天猫' : basicInfo.user_type === 3 ? '特价版' : '淘宝'}</span>
                <div class="category-info">
                    <span class="category-tag">${basicInfo.category_name}</span>
                    <span class="category-tag">${basicInfo.level_one_category_name}</span>
                </div>
                <div class="detail-price">
                    <div class="price-item">原价: ¥${priceInfo.reserve_price}</div>
                    <div class="price-item">优惠价: ¥${priceInfo.zk_final_price}</div>
                    ${priceInfo.final_promotion_price ? `<div class="price-item">促销价: ¥${priceInfo.final_promotion_price}</div>` : ''}
                    ${priceInfo.predict_rounding_up_price ? `<div class="price-item rounding-price">凑单价: ¥${priceInfo.predict_rounding_up_price}<span class="rounding-desc">${priceInfo.predict_rounding_up_price_desc}</span></div>` : ''}
                </div>
                <div class="detail-meta">
                
                    <div>店铺：${basicInfo.shop_title}</div>
                    <div>品牌：${basicInfo.brand_name || '无品牌'}</div>
                    <div>发货地：${basicInfo.provcity}</div>
                    <div>运费：${basicInfo.real_post_fee === '0.00' ? '包邮' : `¥${basicInfo.real_post_fee}`}</div>
                    <div>年销量：${basicInfo.annual_vol || 0}</div>
                    <div>30天销量：${basicInfo.volume || 0}</div>
                </div>
                <div class="promotion-info">
                    ${priceInfo.final_promotion_path_list?.final_promotion_path_map_data?.map(path => 
                        `<div class="promotion-path">${path.promotion_title}: ${path.promotion_desc}</div>`
                    ).join('') || ''}
                    ${priceInfo.more_promotion_list?.more_promotion_map_data?.length > 3 ? '<div class="more-promotion-ellipsis">...</div>' : ''}
                </div>
                <div class="promotion-tags">
                    ${priceInfo.promotion_tag_list?.promotion_tag_map_data?.map(tag => 
                        `<span class="tag">${tag.tag_name}</span>`
                    ).join('') || ''}
                </div>
                <a href="${publishInfo.click_url}" target="_blank" class="buy-button">立即购买</a>
            </div>
        </div>
        <div class="detail-gallery">
            ${basicInfo.small_images?.string?.map(img => 
                `<img src="${img}" alt="商品图片" class="gallery-image">`
            ).join('') || ''}
        </div>
    `;
    
    modal.style.display = 'block';
}

// 事件监听器
document.addEventListener('DOMContentLoaded', async () => {
    await getUserIp();

    const searchButton = document.getElementById('searchButton');
    const searchInput = document.getElementById('searchInput');
    const prevButton = document.getElementById('prevPage');
    const nextButton = document.getElementById('nextPage');
    const listViewButton = document.getElementById('listView');
    const gridViewButton = document.getElementById('gridView');

    // 添加搜索按钮点击事件
    searchButton.addEventListener('click', () => {
        const keyword = searchInput.value.trim();
        if (keyword) {
            searchProducts(keyword);
        }
    });

    // 添加回车键搜索功能
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const keyword = searchInput.value.trim();
            if (keyword) {
                searchProducts(keyword);
            }
        }
    });

    listViewButton.addEventListener('click', () => {
        productList.classList.remove('grid-view');
        productList.classList.add('list-view');
        listViewButton.classList.add('active');
        gridViewButton.classList.remove('active');
    });

    gridViewButton.addEventListener('click', () => {
        productList.classList.remove('list-view');
        productList.classList.add('grid-view');
        gridViewButton.classList.add('active');
        listViewButton.classList.remove('active');
    });
    // 添加模态框关闭功能
    const modal = document.getElementById('productModal');
    const closeBtn = document.querySelector('.close');

    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // 阻止商品项点击事件冒泡
    document.querySelectorAll('.buy-button').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    });
});

// 添加页面加载动画
function showLoading() {
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.innerHTML = '<div class="loading-spinner"></div>';
    document.body.appendChild(overlay);
    setTimeout(() => overlay.classList.add('active'), 0);
    return overlay;
}

function hideLoading(overlay) {
    overlay.classList.remove('active');
    setTimeout(() => overlay.remove(), 300);
}

// 修改搜索商品函数，添加加载动画
async function searchProducts(keyword) {
    const loadingOverlay = showLoading();
    try {
        // 获取筛选条件值
        const startPrice = document.getElementById('startPrice').value || '0';
        const endPrice = document.getElementById('endPrice').value || '100000';
        const isTmall = document.getElementById('isTmall').checked;
        const isOverseas = document.getElementById('isOverseas').checked;
        const sort = document.getElementById('sortSelect').value;
        const startDsr = document.getElementById('startDsr').value || '0';
        const hasCoupon = document.getElementById('hasCoupon').checked;
        const needFreeShipment = document.getElementById('needFreeShipment').checked;
        const includeGoodRate = document.getElementById('includeGoodRate').checked;
        const npxLevel = document.getElementById('npxLevel').value;

        const url =`https://fanli.aigc.louyu.tech/?keyword=${encodeURIComponent(keyword)}&page_size=${pageSize}&page_no=${currentPage}&userIp=${userIp}&startPrice=${startPrice}&endPrice=${endPrice}&isTmall=${isTmall}&isOverseas=${isOverseas}&sort=${sort}&start_dsr=${startDsr}&has_coupon=${hasCoupon}&need_free_shipment=${needFreeShipment}&include_good_rate=${includeGoodRate}&npx_level=${npxLevel}`;
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
        const products = data.tbk_dg_material_optional_upgrade_response.result_list.map_data;
        displayProducts(products);
    } catch (error) {
        console.error('搜索失败:', error);
        alert('搜索失败: ' + error.message);
    } finally {
        hideLoading(loadingOverlay);
    }
}

// 添加鼠标拖拽红包效果
document.addEventListener('DOMContentLoaded', () => {
    const cursor = document.querySelector('.cursor');
    let isMouseDown = false;
    let lastMouseX = 0;
    let lastMouseY = 0;

    function createRedPacket(x, y, velocityX, velocityY) {
        const redPacket = document.createElement('div');
        redPacket.className = 'red-packet';
        redPacket.style.left = x + 'px';
        redPacket.style.top = y + 'px';
        document.body.appendChild(redPacket);

        let opacity = 1;
        let scale = 1;
        let rotation = Math.random() * 360;

        function animate() {
            if (opacity <= 0) {
                redPacket.remove();
                return;
            }

            velocityY += 0.5; // 重力
            x += velocityX;
            y += velocityY;
            opacity -= 0.02;
            scale -= 0.02;
            rotation += 5;

            redPacket.style.transform = `translate(${x}px, ${y}px) rotate(${rotation}deg) scale(${scale})`;
            redPacket.style.opacity = opacity;

            requestAnimationFrame(animate);
        }

        animate();
        setTimeout(() => {
            explode(x, y);
        }, 500);
    }

    function explode(x, y) {
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const velocity = 10;
            const velocityX = Math.cos(angle) * velocity;
            const velocityY = Math.sin(angle) * velocity;
            createParticle(x, y, velocityX, velocityY);
        }
    }

    function createParticle(x, y, velocityX, velocityY) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        document.body.appendChild(particle);

        let opacity = 1;
        let scale = 1;

        function animate() {
            if (opacity <= 0) {
                particle.remove();
                return;
            }

            velocityY += 0.2; // 重力
            x += velocityX;
            y += velocityY;
            opacity -= 0.02;
            scale -= 0.02;

            particle.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
            particle.style.opacity = opacity;

            requestAnimationFrame(animate);
        }

        animate();
    }

    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';

        if (isMouseDown) {
            const velocityX = (e.clientX - lastMouseX) * 0.2;
            const velocityY = (e.clientY - lastMouseY) * 0.2;
            createRedPacket(e.clientX, e.clientY, velocityX, velocityY);
        }

        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
    });

    document.addEventListener('mousedown', () => {
        isMouseDown = true;
        cursor.style.transform = 'scale(0.8)';
    });

    document.addEventListener('mouseup', () => {
        isMouseDown = false;
        cursor.style.transform = 'scale(1)';
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const prevButton = document.getElementById('prevPage');
    const nextButton = document.getElementById('nextPage');
    const searchInput = document.getElementById('searchInput');

    // 添加翻页按钮事件
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            document.getElementById('currentPage').textContent = currentPage;
            const keyword = searchInput.value.trim();
            if (keyword) {
                searchProducts(keyword);
            }
        }
    });

    nextButton.addEventListener('click', () => {
        currentPage++;
        document.getElementById('currentPage').textContent = currentPage;
        const keyword = searchInput.value.trim();
        if (keyword) {
            searchProducts(keyword);
        }
    });
});