const endpointServerHost  = "https://fanli.aigc.louyu.tech"
const getIpserver  = "https://myip.aigc.louyu.tech"



async function getUserIp() {
    try {
        const response = await fetch(getIpserver);
        const ip = await response.text();
        userIp = ip;
    } catch (error) {
        console.error('获取IP失败:', error);
        userIp = '';
    }
}