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
    
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });

    document.addEventListener('mousedown', () => {
        cursor.style.transform = 'scale(0.8)';
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
                <div class="product-image-slider" style="width: ${images.length * 100}%;height: auto;">
                    ${images.map(img => `
                        <img src="${img}" alt="${basicInfo.title}" class="product-image">
                    `).join('')}
                </div>
                <div class="slider-dots">
                    ${images.map((_, index) => `
                        <div class="slider-dot ${index === 0 ? 'active' : ''}"></div>
                    `).join('')}
                </div>
            </div>
            <div class="product-info">
                <h3 class="product-title">${basicInfo.title}</h3>
                <div class="product-price">
                    <span class="original-price">¥${priceInfo.reserve_price}</span>
                    <span class="discount-price">¥${priceInfo.zk_final_price}</span>
                    ${priceInfo.final_promotion_price ? `<span class="promotion-price">促销价: ¥${priceInfo.final_promotion_price}</span>` : ''}
                </div>
                <div class="product-meta">
                    <div class="product-meta-item">
                        <i class="icon-shop"></i>
                        <span>${basicInfo.shop_title}</span>
                    </div>
                    <div class="product-meta-item">
                        <i class="icon-location"></i>
                        <span>${basicInfo.provcity}</span>
                    </div>
                    <div class="product-meta-item">
                        <i class="icon-brand"></i>
                        <span>${basicInfo.brand_name || '无品牌'}</span>
                    </div>
                    <div class="product-meta-item">
                        <i class="icon-shipping"></i>
                        <span>${basicInfo.real_post_fee === '0.00' ? '包邮' : `运费:¥${basicInfo.real_post_fee}`}</span>
                    </div>
                </div>
                <div class="promotion-tags">
                    ${priceInfo.promotion_tag_list?.promotion_tag_map_data?.map(tag => 
                        `<span class="tag">${tag.tag_name}</span>`
                    ).join('') || ''}
                </div>
                <a href="${publishInfo.click_url}" target="_blank" class="buy-button">立即购买</a>
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
                    // 在视口内，开始自动轮播
                    startAutoplay();
                } else {
                    // 不在视口内，停止自动轮播
                    stopAutoplay();
                }
            });
        }, { threshold: [0.2, 0.4, 0.6, 0.8] });

        // 观察当前商品元素
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
                // 点击切换后重置自动轮播计时器
                stopAutoplay();
                startAutoplay();
            });
        });

        // 鼠标悬停时暂停自动轮播
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
                <div class="detail-price">
                    <div class="price-item">原价: ¥${priceInfo.reserve_price}</div>
                    <div class="price-item">优惠价: ¥${priceInfo.zk_final_price}</div>
                    ${priceInfo.final_promotion_price ? `<div class="price-item">促销价: ¥${priceInfo.final_promotion_price}</div>` : ''}
                </div>
                <div class="detail-meta">
                    <div>店铺：${basicInfo.shop_title}</div>
                    <div>品牌：${basicInfo.brand_name || '无品牌'}</div>
                    <div>发货地：${basicInfo.provcity}</div>
                    <div>运费：${basicInfo.real_post_fee === '0.00' ? '包邮' : `¥${basicInfo.real_post_fee}`}</div>
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

document.addEventListener('DOMContentLoaded', () => {
    // 创建红包特效
    document.addEventListener('mousemove', (e) => {
        const packet = document.createElement('div');
        packet.className = 'red-packet';
        packet.style.width = Math.random() * 20 + 10 + 'px';
        packet.style.height = packet.style.width;
        packet.style.left = e.clientX + 'px';
        packet.style.top = e.clientY + 'px';
        
        // 设置随机移动方向和旋转角度
        const moveX = (Math.random() - 0.5) * 100;
        const moveY = Math.random() * 100 + 50;
        const rotate = (Math.random() - 0.5) * 360;
        
        packet.style.setProperty('--moveX', moveX + 'px');
        packet.style.setProperty('--moveY', moveY + 'px');
        packet.style.setProperty('--rotate', rotate + 'deg');
        
        document.body.appendChild(packet);
        
        // 动画结束后移除元素
        packet.addEventListener('animationend', () => {
            packet.remove();
        });
    });
});

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