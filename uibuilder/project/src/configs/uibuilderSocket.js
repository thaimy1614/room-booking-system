/* global uibuilder */
const subscribers = {};

const uibuilderSocket = {
    init() {
        if (this.socket) return;
        const checkUibuilder = setInterval(() => {
            if (window.uibuilder) {
                clearInterval(checkUibuilder);
                console.log('uibuilder is available:', uibuilder);
                uibuilder.start({
                    ioNamespace: '/project',
                    ioPath: '/uibuilder/vendor/socket.io',
                    serverUrl: process.env.NODE_ENV === 'production' ? window.location.origin : 'http://localhost:1880',
                });
                uibuilder.send({ topic: 'test', payload: 'Hello from React' });
                uibuilder.onChange('msg', (msg) => {
                    const topic = msg.topic || 'default';
                    console.log('uibuilderSocket received msg:', topic);
                });
                uibuilder.debug = true;
            }
        }, 100);
        setTimeout(() => { }, 500);
    },

    subscribe(topic, callback) {
        if (!subscribers[topic]) {
            subscribers[topic] = [];
        }
        subscribers[topic].push(callback);
        return () => {
            subscribers[topic] = subscribers[topic].filter((cb) => cb !== callback);
            if (subscribers[topic].length === 0) {
                delete subscribers[topic];
            }
        };
    },

    send(msg) {
        if (this.socket && this.isConnected) {
            uibuilder.send(msg);
        } else {
            console.warn('Socket not connected. Cannot send message:', msg);
        }
    },
};

uibuilderSocket.init();

export default uibuilderSocket;