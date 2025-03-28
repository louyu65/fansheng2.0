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
                    </div>
                    <div class="meta-section">
                        <div class="shop-info">
                            <span><i class="icon-shop"></i>${basicInfo.shop_title}</span>
                            <span><i class="icon-brand"></i>${basicInfo.brand_name || '无品牌'}</span>
                        </div>
                        <div class="shipping-sales-info">
                            <span><i class="icon-location"></i>${basicInfo.provcity}</span>
                            <span><i class="icon-shipping"></i>${basicInfo.real_post_fee === '0.00' ? '包邮' : `¥${basicInfo.real_post_fee}`}</span>
                            <span>年销量: ${basicInfo.annual_vol || 0}</span>
                            <span>月销量: ${basicInfo.volume || 0}</span>
                        </div>
                    </div>
                </div>
                <div class="promotion-section">
                    <div class="price-info">
                        <div class="price-group">
                            <span class="discount-price">¥${priceInfo.zk_final_price}</span>
                            <span class="original-price">¥${priceInfo.reserve_price}</span>
                            ${priceInfo.final_promotion_price ? `<span class="promotion-price">促销价: ¥${priceInfo.final_promotion_price}</span>` : ''}
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
                <div class="category-info">
                    <span class="category-tag">${basicInfo.category_name}</span>
                    <span class="category-tag">${basicInfo.level_one_category_name}</span>
                </div>
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
                    <div>年销量：${basicInfo.annual_vol || 0}</div>
                    <div>30天销量：${basicInfo.volume || 0}</div>
                </div>
                <div class="promotion-info">
                    ${priceInfo.final_promotion_path_list?.final_promotion_path_map_data?.map(path => 
                        `<div class="promotion-path">${path.promotion_title}: ${path.promotion_desc}</div>`
                    ).join('') || ''}
                    ${priceInfo.more_promotion_list?.more_promotion_map_data?.map(promo => 
                        `<div class="more-promotion">${promo.promotion_title}: ${promo.promotion_desc}</div>`
                    ).join('') || ''}
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

// 添加鼠标拖拽红包效果
document.addEventListener('DOMContentLoaded', () => {
    const cursor = document.querySelector('.cursor');
    let isMouseDown = false;
    let lastMouseX = 0;
    let lastMouseY = 0;
    let redPackets = [];

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