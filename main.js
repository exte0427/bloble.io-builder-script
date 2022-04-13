//unitList units units.filter(e=>e.owner === player.sid)

// delete the ad
document.getElementById(`smallAdContainer`).remove();

// add bloble-builder ui
const newDiv = document.createElement('div');
newDiv.innerHTML = `<div style="position: absolute;z-index:100;left:50%;bottom:24px" id="emergency"><strong style="color:red">Emergency Mode On!</strong></div>`;
document.body.appendChild(newDiv);
document.getElementById(`emergency`).style.visibility = `hidden`;

// unit control
function moveSelUnits() {
    if (selUnits.length) {
        let a = player.x + targetDst * MathCOS(targetDir) + camX;
        let d = player.y + targetDst * MathSIN(targetDir) + camY;
        let c = 1;
        if (c && 1 < selUnits.length)
            for (var b = 0; b < users.length; ++b)
                if (UTILS.pointInCircle(a, d, users[b].x, users[b].y, users[b].size)) {
                    c = 0;
                    break;
                }
        let g = -1;
        if (c)
            for (b = 0; b < units.length; ++b)
                if (units[b].onScreen && units[b].owner != player.sid && UTILS.pointInCircle(a, d, units[b].x, units[b].y, units[b].size)) {
                    c = 0; g = units[b].id; break
                }
        1 == selUnits.length && (c = 0);
        for (const thisSel of selUnits)
            socket.emit("5", UTILS.roundToTwo(a), UTILS.roundToTwo(d), [thisSel.id], c, g);

    }
}

// unit
const getBuilding = () => {
    return units.filter(e => e.owner === player.sid && e.type !== 1);
}
const getUnit = () => {
    return units.filter(e => e.type === 1);
}
const sellUnit = (nowUnit) => {
    socket.emit("3", [nowUnit.id]);
}
const makeUnit = (nowUnit) => {
    const x = player.x - nowUnit.x;
    const y = player.y - nowUnit.y;
    socket.emit("1", UTILS.roundToTwo(nowUnit.dir), UTILS.roundToTwo(Math.sqrt(x * x + y * y)), unitList.indexOf(unitList.find(e => e.uPath[0] === nowUnit.uPath[0])));
}
const upUnit = (lastUnit) => {
    const realUnit = getBuilding().find(e => (Math.abs(e.x - lastUnit.x) < 20 && Math.abs(e.y - lastUnit.y) < 20));
    for (let i = 1; i < lastUnit.uPath.length; i++) {
        console.log("4", realUnit.id, lastUnit.uPath[i]);
        socket.emit("4", realUnit.id, lastUnit.uPath[i]);
    }
}

// base
let savedBase = [];
const saveBase = () => {
    savedBase = getBuilding();
}
const setBase = () => {
    const makeList = [];
    const thisData = getBuilding();

    delOne.map(element => {
        makeList.push(element);
        sellUnit(thisData.find(e => (Math.abs(e.x - element.x) < 20 && Math.abs(e.y - element.y) < 20)));
    });
    makeList.map(e => makeUnit(e));
    setTimeout(() => {
        makeList.map(e => upUnit(e));
    }, 400);
}

// emergency mode
const time = 0.05;
let emergency = false;

let nowData = [];
let lastData = [];

const startEm = () => {
    // save base
    saveBase();

    emergency = true;
    delOne = [];
}
const endEm = () => {
    emergency = false;
    // return first base
    setBase();
    delOne = [];
}
let delOne = [];
setInterval(() => {
    if (emergency) {
        nowData = getBuilding();
        savedBase.map(e => makeUnit({ x: e.x, y: e.y, dir: e.dir, uPath: [1] }));

        //attacked
        if (nowData !== lastData) {

            lastData.map(element => {
                if (nowData.find(e => (Math.abs(e.x - element.x) < 20 && Math.abs(e.y - element.y) < 20)) === undefined && delOne.find(e => (Math.abs(e.x - element.x) < 20 && Math.abs(e.y - element.y) < 20)) === undefined)
                    delOne.push(element);
            });
        }

        lastData = nowData;
    }
}, time * 1000);

const dis = 730;
let timer = 0;
setInterval(() => {
    const enemyList = getUnit().filter(e => e.owner !== player.sid).filter(e => (Math.abs(e.x - player.x) < 600 && Math.abs(e.y - player.y) < 600));
    if (timer <= 0) {
        if (enemyList.length === 0 && emergency === true) {
            timer = 1;
            console.log(`emergency mode end`);

            document.getElementById(`emergency`).style.visibility = `hidden`;
            document.getElementById(`unitList`).style.visibility = `visible`;
            endEm();
        }
        if (enemyList.length !== 0 && emergency === false) {
            timer = 1;
            console.log(`emergency mode start`);
            document.getElementById(`emergency`).style.visibility = `visible`;
            document.getElementById(`unitList`).style.visibility = `hidden`;
            startEm();
        }
    }
    if (timer > 0)
        timer--;
}, 1000);

//aft mode
