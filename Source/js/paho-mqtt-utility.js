var client = null;
var connected = false;
var onCont = null;
var onRecv = null;




function connect(ip, port, user, pass, clientId, onCont1,onReceive1) {
    onCont = onCont1;
    onRecv = onReceive1;
    client = new Paho.Client(ip, Number(port), clientId);
    client.onConnectionLost = onConnectionLost;
    client.onMessageArrived = onMessageArrived;
    client.onConnected = onConnected;

    var options = {
        invocationContext: { host: ip, port: port, path: client.path, clientId: clientId },
        timeout: 3,
        keepAliveInterval: 60,
        cleanSession: true,
        useSSL: false,
        reconnect: true,
        onSuccess: onConnect,
        onFailure: onFail
    };



    if (user.length > 0) {
        options.userName = user;
    }

    if (pass.length > 0) {
        options.password = pass;
    }

    client.connect(options);

}

function connect2(ip, port, user, pass, clientId, onCont1,onReceive1) {
    onCont = onCont1;
    onRecv = onReceive1;
    client = new Paho.Client(ip, Number(port), clientId);
    client.onConnectionLost = onConnectionLost;
    client.onMessageArrived = onMessageArrived;
    client.onConnected = onConnected;

    var options = {
        invocationContext: { host: ip, port: port, path: client.path, clientId: clientId },
        timeout: 3,
        keepAliveInterval: 60,
        cleanSession: true,
        useSSL: false,
        reconnect: true,
        onSuccess: onConnect,
        onFailure: onFail
    };



    if (user.length > 0) {
        options.userName = user;
    }

    if (pass.length > 0) {
        options.password = pass;
    }

    client.connect(options);

}

function disconnect() {
    logMessage("INFO", "Disconnecting from Server.");
    client.disconnect();
    connected = false;
}




/*ע��https://www.jianshu.com/p/701ef52c62fd
* sendMsg��retainҪ��Ϊfalse
* ������Ϣ��һ����������־��retained flag����Ϊtrue����ͨMQTT��Ϣ��broker�������������QoS���������һ��������Ϣ���������߶�������ʱ�������յ�������Ϣ��broker��Ϊÿ�����Ᵽ��һ��������Ϣ��
* ����һ�ֺܼ򵥵ķ�����ɾ��ĳ������ı�����Ϣ��ֻ��Ҫ����һ�����ֽڵı�����Ϣ�����������Ϣ�����⡣broker����ɾ��������Ϣ�����Ҷ�����Ҳ�������յ�������Ϣ����Ϊÿ���µı�����Ϣ���Ḳ����һ��;*/
function sendMsg(topic1, msg1, qos1, retain1) {
    var topic = topic1;
    var qos = qos1;
    var message = msg1;
    var retain = retain1;
    logMessage("INFO", "Publishing Message: [Topic: ", topic, ", Payload: ", message, ", QoS: ", qos, ", Retain: ", retain, "]");
    message = new Paho.Message(message);
    message.destinationName = topic;
    message.qos = Number(qos);
    message.retained = retain;
    client.send(message);
}


function subscribe(topic1, qos1) {
    var topic = topic1;
    var qos = qos1;
    logMessage("INFO", "Subscribing to: [Topic: ", topic, ", QoS: ", qos, "]");
    if(qos1!=''&&qos1!=undefined){
    	client.subscribe(topic, { qos: Number(qos) });
    }else{
    	client.subscribe(topic);
    }
}

function unsubscribe(topic1) {
    var topic = topic1;
    logMessage("INFO", "Unsubscribing: [Topic: ", topic, "]");
    client.unsubscribe(topic, {
        onSuccess: unsubscribeSuccess,
        onFailure: unsubscribeFailure,
        invocationContext: { topic: topic }
    });
}


function unsubscribeSuccess(context) {
    logMessage("INFO", "Unsubscribed. [Topic: ", context.invocationContext.topic, "]");
}

function unsubscribeFailure(context) {
    logMessage("ERROR", "Failed to unsubscribe. [Topic: ", context.invocationContext.topic, ", Error: ", context.errorMessage, "]");
}


// called when the client connects
function onConnect(context) {
    // Once a connection has been made, make a subscription and send a message.
    var connectionString = context.invocationContext.host + ":" + context.invocationContext.port + context.invocationContext.path;
    logMessage("INFO", "Connection Success ", "[URI: ", connectionString, ", ID: ", context.invocationContext.clientId, "]");
    connected = true;
}


function onConnected(reconnect, uri) {
    // Once a connection has been made, make a subscription and send a message.
    logMessage("INFO", "Client Has now connected: [Reconnected: ", reconnect, ", URI: ", uri, "]");
    connected = true;

    if (onCont) {
        onCont(connected);
    }

}

function onFail(context) {
    logMessage("ERROR", "Failed to connect. [Error Message: ", context.errorMessage, "]");
    connected = false;
}

// called when the client loses its connection
function onConnectionLost(responseObject) {
    if (responseObject.errorCode !== 0) {
        logMessage("INFO", "Connection Lost. [Error Message: ", responseObject.errorMessage, "]");
    }
    connected = false;
}

// called when a message arrives
function onMessageArrived(message) {
    logMessage("INFO", "Message Recieved: [Topic: ", message.destinationName, ", Payload: ", message.payloadString, ", QoS: ", message.qos, ", Retained: ", message.retained, ", Duplicate: ", message.duplicate, "]");
    var messageTime = new Date().toISOString();
    var msg = safeTagsRegex(message.payloadString);
    ////alert(msg);
    if (onRecv) {
        onRecv(message);
    }
}

function logMessage(type, ...content) {

    var date = new Date();
    var timeString = date.toUTCString();
    var logMessage = timeString + " - " + type + " - " + content.join("");

    if (type === "INFO") {
        // console.info(logMessage);
    } else if (type === "ERROR") {
        console.error(logMessage);
    } else {
        console.log(logMessage);
    }
}

// Just in case someone sends html
function safeTagsRegex(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").
        replace(/>/g, "&gt;");
}
