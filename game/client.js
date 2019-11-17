const swfobject = require('swfobject');
const remote = require('electron').remote;

const html = document.querySelector('html');
const containerDiv = document.getElementById("container");

const gameDiv = document.getElementById("game");

const chatDiv = document.getElementById("chat");
const chatMessagesDiv = document.getElementById("chatMessages");
const chatMFormDiv = document.getElementById("chatForm");
const chatFormMessage = document.getElementById("chatFormMessage");

const locationDiv = document.getElementById("location");
const locationNameDiv = document.getElementById("locationName");
const locationUsersDiv = document.getElementById("locationUsers");

let pageTitle = document.title;

let locationName;
let locationUsers;
let chatLogin;
let tzDiv = document.getElementById("tz");

let autologinLogin = "";
let autologinPassword = "";

const smileList = ["acid", "admins", "agree", "ahtung", "air", "angel", "balance", "ban", "barman", "barman2", "barman6", "bayan", "bee", "beer", "boks", "boogi", "broken", "budo", "bulldog", "bye", "cbulldog", "celebrity", "chupa", "conf", "congr", "congr_lester", "congr_ny", "cop", "cowb", "crazy", "crazylol", "crazynuts", "crazyny", "crazystupid", "croco", "cry", "cry2", "crzswans", "csotona", "deer", "despair", "die", "die2", "dietopor", "digger", "divin", "dkn", "doctor", "dont", "dry", "duel", "dunno", "evil", "FAQ", "FAQ2", "farewell", "fire", "flashka", "flower4", "flowers", "fly", "flyhigh", "fresh", "friday", "frown", "ftopky", "gcrazy", "gems", "gent", "godig", "godig2", "gold", "goodbad", "greedy", "grenade", "grust", "gun", "guns", "haljavy", "happy", "heart", "hehe", "hehehe", "hehehe7", "hello", "help", "here", "heyo", "hi", "hnb", "horse", "hug", "hug2", "hul", "idea", "idea2", "imhere", "index.html", "jaw", "jeer", "joy", "king", "kiss3", "kluv", "kopat", "kruger", "kulich", "kult", "lady", "lady2", "late", "laugh", "lesom", "lick", "loser", "love", "m60", "mad", "maddog", "maniac", "mar", "megabojan", "metal", "metals", "miner", "mol", "monstr", "mosk", "naem", "naezd", "nail", "nerv", "newyear", "no", "noadm", "nobody", "nocrazy", "nonaim", "nun", "nunu", "obm", "ok", "old", "organic", "pester", "piar", "polem", "polimers", "polymers", "ponder", "popaberegu", "popcorn", "poshl", "poshl2", "preved", "priva", "privet", "protest", "proud", "pyk", "radic", "rambo", "red", "rev", "robbery", "rocket", "rose", "row", "rtfm", "rupor", "rzhynimagy", "sad", "sdaus", "serenade", "shuffle", "shy", "silic", "silicon", "sleep", "smile", "smoke", "smoke2", "smut", "snowfight", "soska", "sotona", "spot", "stalk", "Stalkfire", "stalkno", "stalkprivet", "stfriday", "stich", "stich2", "str", "stupid", "stupid2", "susel", "swans", "tango", "tongue", "tongue2", "toothpick", "tost", "tyt", "umn", "ups", "uzi", "vantuz", "venom", "vgazenvagen", "vharmont", "wait", "wall", "wedding", "what", "wink", "work", "wow", "wow2", "yes", "yessir", "zachot", "zhara"];

const proList = 				// Названия профессий
    ["Без профессии",
        "Корсар",
        "Сталкер",
        "Старатель",
        "Инженер",
        "Наемник",
        "Торговец",
        "Патрульный",
        "Штурмовик",
        "Специалист",
        "Журналист",
        "Чиновник",
        "Псионик",
        "Каторжник",
        "Пси-кинет",
        "Пси-медиум",
        "Пси-лидер",
        "Полиморф",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "Грузовой робот",
        "Десантный робот",
        "Боевой робот",
        "",
        "Дилер"];

const rankList = [
    "Рядовой",
    "Младший сержант",
    "Сержант",
    "Старший сержант",
    "Младший лейтенант",
    "Лейтенант",
    "Старший лейтенант",
    "Капитан",
    "Майор",
    "Подполковник",
    "Полковник",
    "Генерал-майор",
    "Генерал-лейтенант",
    "Генерал-полковник",
    "Маршал",
    "Командор",
    "Генералиссимус",
    "Миротворец",
];
const rankNum = [
    0,
    20,
    60,
    120,
    250,
    600,
    1100,
    1800,
    2500,
    3200,
    4000,
    5000,
    6000,
    7200,
    10000,
    15000,
    30000,
    50000,
    750000,
];

function rankIndex(absrank) {
    var i = 0;
    for (var j = 1; j < rankNum.length; j++) {
        if (absrank < rankNum[j]) {
            i = j - 1;
            break;
        }
    }
    return i;
}

const flashvars =
    {
        "language": "ru",
        "WORLD_ID": "1"
    };
const params =
    {
        "swLiveConnect": "true",
        "allowScriptAccess": "always",
        "menu": "false"
    };

swfobject.embedSWF("tz.swf", "tz", "100%", "100%", "8", null, flashvars, params);

const ro = new ResizeObserver(entries => {
    for (let entry of entries) {
        let cs = window.getComputedStyle(entry.target);
        TZresizeStage(cs.width);
        if (entry.target.handleResize)
            entry.target.handleResize(entry);
    }
});

/*
    var so = new SWFObject("tz.swf?vers=" + vers, "tz", "100%", "100%", "8", "#333333");
    so.addVariable("language", "ru");
    so.addVariable("WORLD_ID", 1);

    if (document.URL.indexOf("reg=1") != -1) {
        so.addVariable("regscreen", "1");
    }*/
/*
    if (reg_url && reg_url['login'] && reg_url['password']) {
        so.addVariable("root_login", reg_url['login']);
        so.addVariable("root_password", reg_url['password']);
    }*/

document.addEventListener('visibilitychange', function () {
    if (!document.hidden) {
        html.style.width = "99.9%";

        setTimeout(function () {
            html.style.width = "100%";
        }, 1000);
    }
});

function recieveFromFlash(data) {

    var command = data[0];

    var ztmp = new Array();
    for (var i = 1; i < data.length; i++) {
        ztmp.push(data[i]);
    }
    var arr = ztmp[0].split('	');

    console.log(command);
    console.log(arr);
    switch (command) {
        case "Start":
            ChatStart(ztmp[1]);
            break;
        case "Stop":
            ChatStop();
            break;
        case "restart_client":
            RestartClient();
            break;
        case "R":
            ChatR(arr);
            break;
        case "A":
            ChatA(ztmp[0]);
            break;
        case "D":
            ChatD(ztmp[0]);
            break;
        case "S":
            ChatS(arr);
            break;
        case "fullscreen":
            tzDiv = document.getElementById("tz");
            if (autologinLogin !== "" && autologinPassword !== "") {
                TZautologin(autologinLogin, autologinPassword);

                autologinLogin = "";
                autologinPassword = "";
            }
            ro.observe(tzDiv);
            break;
        default:
            console.log("UHANDLED " + command);
            break
    }
}

function RestartClient() {
    ChatStop();
    tzDiv.data += '';
}

function ChatStart(login) {
    chatLogin = login;
    containerDiv.classList.add("chat");
}

function ChatStop() {
    containerDiv.classList.remove("chat");
}

function ChatR(arr) {
    locationName = arr[0];

    locationUsers = new Map();
    arr[1].split(",").forEach(function (user) {
        if (user === "") {
            return;
        }
        let userSplit = user.split("/");
        locationUsers.set(userSplit[4], userSplit);
    });

    DrawLocationName();
    DrawLocationUsers();
    ClearChat();
}

function ChatD(name) {
    locationUsers.delete(name)
    DrawLocationUsers();
}

function ChatA(user) {
    let userSplit = user.split("/");
    locationUsers.set(userSplit[4], userSplit);
    DrawLocationUsers();
}

function DrawLocationName() {
    let result = "";
    result += locationName;
    locationNameDiv.innerHTML = result;
}

function DrawLocationUsers() {
    let result = "";
    for (let [key, value] of locationUsers) {
        let battleId = value[0];
        let status = value[2];
        let clan = value[3];
        let login = value[4];
        let level = value[5];
        let rank = value[6];
        let aggr = value[8];
        let minlvl = Number(value[7] % 100) || 0;
        let maxlvl = Math.floor(Number(value[7]) / 100) || 0;
        let stake = Number(value[9]) || 0;

        let online = (value[2] & 1);
        let sleep = (value[2] & 2);
        let bandit = (value[2] & 4);
        let claim = (value[2] & 8);
        let battle = (value[2] & 16);
        let bot = (value[2] & 2048);
        let friend = (value[2] & 4096);
        let woman = (value[2] & 8192);
        let casino = (value[2] & 16384);
        let bloodbtl = (value[2] & 32768);
        let grp = (value[2] & 24) ? value[1] : 0;
        let pro = ((value[2] >> 5) & 63) || 0;


        let isMe = login === chatLogin;

        result += "<div class='locationUser " + (isMe ? "isMe" : "") + " " + (bot ? "isBot" : "") + "' onclick='WriteTo(\"" + login + "\")' oncontextmenu='TZgetUserInfo(\"" + login + "\")' title='" + value + "'>";

        let statusIcon = 0;

        switch (aggr) {
            case 1:
                statusIcon = 11;
                break;
            case 2:
                statusIcon = 12;
                break;
            case 3:
                statusIcon = 13;
                break;
        }

        if (bot) statusIcon = 10;

        result += "<span class='locationUserStatus'>";
        if (statusIcon !== 0) {
            result += "<img src='./i/status" + statusIcon + ".gif'>";
        }
        result += "</span>";
        result += "<span class='locationUserClan'>";
        if (clan !== "") {
            result += "<img src='./i/clans/" + clan + ".gif'>";
        }
        result += "</span>";

        result += "<span class='locationUserLogin'>" + login + "</span>";

        result += "<span class='locationUserLevel'>[" + level + "]</span>";

        result += "<span class='locationUserPro'><img src='./i/i" + pro + (woman ? "w" : "") + ".gif' alt='' title='" + proList[pro] + "'></span>";

        let ri = rankIndex(rank || 0);
        result += "<span class='locationUserRank'><img src='./i/rank/" + (+ri + 1) + ".gif' alt='' title='" + rankList[ri] + "'></span>";
        result += "</div>";
    }

    locationUsersDiv.innerHTML = result;
}

function ChatS(arr) {
    AddChatLine(arr[0], arr[1], arr[2] === "1", 0, arr[3] === "1");
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function AddChatLine(message, color, always, gs, hmtl) {
    let result = "";

    let messageId = 0;
    if (message.substr(8, 1) === ":") {
        messageId = parseInt(message.substr(0, 8), 16);
        message = message.substr(9);
    }

    let isPrivate = message.includes(" private [" + chatLogin + "]");
    let isToMe = message.includes(" to [" + chatLogin + "]");

    let logins = message.substr(5).match(/\[[^\]]*]/g);

    let fromLogin = "";
    for (const tempLoginTag of logins) {
        let tempLogin = tempLoginTag.slice(1, -1);
        if (fromLogin === "") {
            fromLogin = tempLogin;
        }
        message = message.replace(new RegExp(escapeRegExp(" private " + tempLoginTag), "g"), "<b class='chatLoginPrivate'> private <span class='chatLogin' onclick='WriteTo(\"" + tempLogin + "\")' oncontextmenu='TZgetUserInfo(\"" + tempLogin + "\")'>" + tempLoginTag + "</span></b>");
        message = message.replace(new RegExp(escapeRegExp(" to " + tempLoginTag), "g"), "<b> to <span class='chatLogin' onclick='WriteTo(\"" + tempLogin + "\")' oncontextmenu='TZgetUserInfo(\"" + tempLogin + "\")'>" + tempLoginTag + "</span></b>");
        message = message.replace(new RegExp(escapeRegExp(" " + tempLoginTag), "g"), " <b class='chatLogin' onclick='WriteTo(\"" + tempLogin + "\")' oncontextmenu='TZgetUserInfo(\"" + tempLogin + "\")'>" + tempLoginTag + "</b>");
    }

    smileList.forEach(function (smile) {
        message = message.replace(new RegExp(':' + smile + ':', "g"), "<img src='./i/smile/" + smile + ".gif' alt=''>");
    });

    let isFromMe = fromLogin === chatLogin;

    result += "<div class='chatMessage " + (always ? "always" : "") + " " + (isFromMe ? "fromme" : "") + " " + (isToMe ? "tome" : "") + " " + (isPrivate ? "private" : "") + "'>";
    result += "<span class='chaTtime'>" + message.substr(0, 5) + "</span> <span class='color-" + color + "'>" + message.substr(5) + "</span>";
    result += "</div>";

    if (always) {
        chatMessagesDiv.innerHTML = result + chatMessagesDiv.innerHTML;
    } else {
        chatMessagesDiv.innerHTML += result;
    }
    chatMessagesDiv.scrollTop = chatMessagesDiv.scrollHeight;

    if (isPrivate) {
        TZplaySound("private");
    }
}

function ClearChat() {
    [].forEach.call(chatMessagesDiv.querySelectorAll('.chatMessage'), function (e) {
        if (!e.classList.contains("always")) {
            e.parentNode.removeChild(e);
        }
    });
}

function SendMessage() {
    TZsendChat(chatFormMessage.value);
    chatFormMessage.value = '';
}

function WriteTo(login) {
    var to = 'to [' + login + '] ';
    var private = 'private [' + login + '] ';

    let curMessage = chatFormMessage.value;

    if (curMessage.includes(to)) {
        curMessage = curMessage.replace(to, private);
    } else if (curMessage.includes(private)) {
        curMessage = curMessage.replace(private, to);
    } else {
        curMessage = to + ' ' + curMessage;
    }

    chatFormMessage.value = curMessage;
}

function TZautologin(login, password) {
    tzDiv.SetVariable("_level0.skin_login.mc_login.login.text", login);
    tzDiv.SetVariable("_level0.skin_login.mc_login.psw.text", password);
    tzDiv.SetVariable("_level0.skin_login.mc_login.btn_enter.releasing", "");
}

function TZgameLogOut() {
    tzDiv.gameLogOut();
}

function TZexternalGetMassa() {
    return tzDiv.externalGetMassa();
}

function TZsendChat(s) {
    tzDiv.sendChat(s);
}

function TZgetUserInfo(login) {
    tzDiv.getUserInfo(login);
}

function TZlookBattle(battleid) {
    tzDiv.lookBattle(battleid);
}

function TZjoinBattle(battleid, side, bloodbtl) {
    tzDiv.joinBattle(battleid, side, bloodbtl);
}

function TZplaySound(s) {
    tzDiv.playSound(s);
}

function TZbrowserData(s) {
    tzDiv.browserData(s);
}

function TZcomplainMessage(s) {
    tzDiv.complainMessage(s);
}

function TZresizeStage(width) {
    tzDiv.resizeStage(width);
}

function toggleChat() {
    containerDiv.classList.toggle('chat');
}