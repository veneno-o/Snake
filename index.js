var sw = 20, //方块的宽
    sh = 20, //方块的高
    row = 30, //行
    col = 30; //列
var snack = null; //蛇的实例
var food = null; //水果的实例
/**
 * 
 * @param {*} x 方块x坐标
 * @param {*} y 方块y坐标
 * @param {*} className 方块类名
 */
function Square(x, y, className) {
    this.x = sw * x;
    this.y = sh * y;
    this.class = className;
    this.viewContent = document.createElement('div');
    this.parent = document.getElementById('snackWrap');
    if(className == 'snackBody'){
        //background-image: linear-gradient(to right, #ffecd2 0%, #fcb69f 100%);
        this.viewContent.style.background = 'lightGreen';
    }
}
/**
 * new一个方块对象
 */
Square.prototype.create = function () {
    this.viewContent.style.width = sw + 'px';
    this.viewContent.style.height = sh + 'px';

    this.viewContent.className = this.class;
    this.viewContent.style.position = 'absolute';
    this.viewContent.style.left = this.x + 'px';
    this.viewContent.style.top = this.y + 'px';

    this.parent.appendChild(this.viewContent);
}
/**
 * 移除方块
 */
Square.prototype.remove = function () {
    this.parent.removeChild(this.viewContent);
}
/**
 * 蛇对象s
 */
function Snack() {
    this.head = null; //蛇头
    this.tail = null; //蛇尾
    this.pos = []; //蛇各部位的位置信息[[蛇头],[蛇尾],[蛇尾]]
    this.directionNumber = { //前进的方向
        left: {
            x: -1,
            y: 0,
            rotate: 180
        },
        right: {
            x: 1,
            y: 0,
            rotate: 0
        },
        top: {
            x: 0,
            y: -1,
            rotate: -90
        },
        bottom: {
            x: 0,
            y: 1,
            rotate: 90
        }
    };
}
Snack.prototype.init = function () {
    var snackHead = new Square(2, 0, 'snackHead'); //创建蛇头
    snackHead.create();
    this.head = snackHead;
    var snackTail1 = new Square(1, 0, 'snackBody'); //创建蛇身
    snackTail1.create();
    var snackTail2 = new Square(0, 0, 'snackBody'); //创建蛇尾
    snackTail2.create();
    this.tail = snackTail2;
    this.pos.push([2, 0]);
    this.pos.push([1, 0]);
    this.pos.push([0, 0]);
    this.direct = this.directionNumber.right; //蛇默认向右走

    //利用链表将蛇看作一个整体，便于移动
    snackHead.prev = null;
    snackHead.next = snackTail1;
    snackTail1.prev = snackHead;
    snackTail1.next = snackTail2;
    snackTail2.prev = snackTail1;
    snackTail2.next = null;
}

/**
 * 根据蛇头下个位置判断接下来要做的事
 */
Snack.prototype.getNextPos = function () {
    var nextPos = [ //得到将要移动到下一个位置的坐标
        this.head.x / sw + this.direct.x,
        this.head.y / sh + this.direct.y
    ]
    //1.如果下个位置是墙->die
    if (nextPos[0] < 0 || nextPos[1] < 0 || nextPos[0] >= row || nextPos[1] >= col) {
        this.strategies.die.call(this)
        return;
    }
    //2.如果下个位置是自己->die
    var exit = false;
    this.pos.forEach(function (pos) {
        if (pos[0] == nextPos[0] && pos[1] == nextPos[1]) {
            exit = true;
        }
    })
    if (exit) {
        this.strategies.die.call(this)
        return;
    }
    //3.如果下个位置是水果->eat
    console.log(nextPos, food);
    if (nextPos[0] == food.pos[0] && nextPos[1] == food.pos[1]) {
        this.strategies.eat.call(this, nextPos);
    }
    //4.如果下个位置什么都没有->contious
    this.strategies.move.call(this, nextPos, false);
}
//定义移动后该做的使
Snack.prototype.strategies = {
    move: function (nextPos, isEat) {
        //利用视觉欺骗将蛇头删除
        //，在将移到的位置处添加新蛇头，旧蛇头处添加蛇身

        //创建蛇的新身体
        var newSnackTail = new Square(this.head.x / sw, this.head.y / sh, 'snackBody');
        newSnackTail.create();

        //利用链表将新蛇尾跟老蛇尾连接
        this.head.next.prev = newSnackTail;
        newSnackTail.next = this.head.next;

        // console.log(nextPos);
        var newSnackHead = new Square(nextPos[0], nextPos[1], 'snackHead')
        newSnackHead.create();

        //利用链表将新蛇头跟新蛇尾连接
        newSnackHead.prev = null;
        newSnackHead.next = newSnackTail;
        newSnackTail.prev = newSnackHead;

        //移除老蛇头
        this.head.viewContent.remove();
        this.head = newSnackHead;

        //判断是否需要删除蛇尾
        if (!isEat) { //如果需要删除蛇尾
            this.tail.prev.next = null; //改变倒数第二个指针的指向
            this.tail.viewContent.remove(); //移除蛇尾
            this.tail = this.tail.prev; //更新蛇尾

            this.pos.pop(); //更新蛇尾坐标
        }

        //更新蛇的坐标
        this.pos.splice(0, 0, nextPos);
        newSnackHead.viewContent.style.transform = 'rotate(' + this.direct.rotate + 'deg)';

    },
    eat: function (nextPos) {
        this.strategies.move.call(this, nextPos, true);
        createFood();
        game.score++;
    },
    die: function () {
        game.over();
    }
}

snack = new Snack();

//创建食物
function createFood() {
    //判断水果是否出现在蛇身里
    var isCover = false;

    while (!isCover) {
        var x = Math.floor(Math.random() * row);
        var y = Math.floor(Math.random() * col);
        snack.pos.forEach(function (pos) {
            if (pos[0] != x || pos[1] != y)
                isCover = true;
        })
    }
    var foodDom = document.querySelector('.food');
    if(foodDom){//如果存在
        foodDom.style.left = x*sw +'px';
        foodDom.style.top = y*sh +'px';
    }else{//如果不存在
        food = new Square(x, y, 'food');
        food.create();
    }
    food.pos = [x, y]; //存储水果的位置信息
    return;

}

function Game() {
    this.timer = null;
    this.score = 0;
}
Game.prototype.init = function () {
    snack.init();
    createFood();

    snack.getNextPos();
    document.onkeydown = function (ev) {
        if (ev.keyCode == 37 && snack.direct != snack.directionNumber.right) {
            snack.direct = snack.directionNumber.left;
        } else if (ev.keyCode == 38 && snack.direct != snack.directionNumber.bottom) {
            snack.direct = snack.directionNumber.top;
        } else if (ev.keyCode == 39 && snack.direct != snack.directionNumber.left) {
            snack.direct = snack.directionNumber.right;
        } else if (ev.keyCode == 40 && snack.direct != snack.directionNumber.top) {
            snack.direct = snack.directionNumber.bottom;
        }
    }
    this.start();

}
//定义游戏规则
Game.prototype.start = function () {
    this.timer = setInterval(function () {
        snack.getNextPos();
    }, 200)
}
Game.prototype.pause = function(){
    clearInterval(this.timer);
}
Game.prototype.over = function(){
    clearInterval(this.timer)
    alert('你的得分为'+this.score);
    //回到初始状态
    history.go(0) 
    // location.reload(true);(官方不建议使用)
}
var pauseBtn = document.querySelector('.pauseBtn'); 
document.querySelector('#snackWrap').onclick = function(){
    clearInterval(game.timer);
    pauseBtn.style.display = 'block';
    pauseBtn.childNodes[0].onclick = function(){
        pauseBtn.style.display = 'none';
        game.timer = setInterval(function () {
            snack.getNextPos();
        }, 200)
    }
}

document.querySelector('.startBtn button').onclick = function () {
    this.parentNode.style.display = 'none';
    game.init(); //开始游戏
}
var game = new Game();