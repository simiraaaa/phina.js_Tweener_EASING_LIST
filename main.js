

// グローバルに展開
phina.globalize();

// 残像の細かさ
var TIME = 500;

// 遅さ
var SPEED = 60;


var SIZE = 64;

var SCALE = 5;


var LINE_WIDTH = 2 * SCALE;

/*
 * メインシーン
 */
phina.define('MainScene', {
  // 継承
  superClass: 'CanvasScene',

  // 初期化
  init: function(o) {
    this.superInit(o);
    this.backgroundColor="#ccc";
    var layer = this.layer = CanvasElement().addChildTo(this);
    // var graphs = this.graphs = CanvasElement().addChildTo(this);
    // var dummyLayer = this.dummyLayer = CanvasElement().addChildTo(this);
    
    //layer.scaleX = 
    //graphs.scaleX = 
    //dummyLayer.scaleX = 
    layer.scaleY = 
    // graphs.scaleY =
    // dummyLayer.scaleY = 
    0.95;
    
    //layer.x = dummyLayer.x = graphs.x = o.width * 0.05;
    layer.y =
    // dummyLayer.y =
    // graphs.y =
    o.height * 0.05;
    
    var X = 40;
    var Y = 2;
    var COL = 6;
    var gridY = Grid({
      width:o.height,
      columns:COL,
    });
    
    var easings = [];
    for(var k in Tween.EASING){
      easings.push(k);
    }
    
    var self = this;
    easings.forEach(function(e,i){
      var x =X+(i/COL|0)*130;
      var y =Y + gridY.span(i%COL);
      
      GraphGroup(e)
      .addChildTo(layer)
      .setPosition(x, y)
      .setScale(1 / SCALE)
      .on('pointend',function(e){
        this.large ? this.toSmall() : this.toLarge();
      });
      
    });
    
    Label({
      text:"phina.js easing list",
      fontSize:30,
      baseline:"top",
      align:"left",
      fill:"lime",
      stroke: 'black',
      strokeWidth:8,
    }).addChildTo(this).setPosition(4,2);
    
    Label({
      text:"Click graph to enlarge!",
      fontSize:28,
      baseline:"top",
      fill:"aqua",
      stroke: 'black',
      strokeWidth:8,
    }).addChildTo(this).setPosition(o.width/2,2);
    
  },
  
  onenter:function(e){
    document.body.removeChild(document.getElementById('mes'));
    document.body.appendChild(e.app.domElement);
  }

});


phina.define('TweenerByFPS',{
  superClass:phina.accessory.Tweener,
  
  init:function(target){
    this.superInit(target);
  },
  
  _updateTween: function(app) {
    var tween = this._tween;
    // var time = app.ticker.deltaTime;
    var time = 1;

    tween.forward(time);
    this.flare('tween');

    if (tween.time >= tween.duration) {
      delete this._tween;
      this._tween = null;
      this._update = this._updateTask;
    }
  },
  
  seek: function(time) {
    this.time = Math.clamp(time, 0, this.duration);
    var rate = this.easing(this.time, 0, 1, this.duration);
    
    for(var key in this.beginProps){
      this.target[key] = this.beginProps[key] + rate * this.changeProps[key];
    }

    return this;
  },
});

phina.app.Element.prototype.getter('tweenerF', function() {
  if (!this._tweenerF) {
    this._tweenerF = TweenerByFPS().attachTo(this);
  }
  return this._tweenerF;
});


phina.define('GraphGroup',{
  superClass:CanvasElement,
  
  init:function(easing){
    this.superInit();
    this.easing = easing;
    
    var back = this.bg = RectangleShape({
      fill:"white",
      padding:0,
      stroke:false,
      width:SIZE*1.8*1.5*SCALE,
      height:SIZE*1.8*SCALE,
      cornerRadius:SCALE * SIZE / 4 * 1.8 ,
    }).addChildTo(this);
    
    back.x = SIZE * SCALE / 2;
    back.y = SIZE * SCALE /1.5;
    
    back.alpha=0;
    
    var g = this.g =  TweenGraph(easing).addChildTo(this);
    
    var c = this.c =  TweenCircle(easing).addChildTo(this);
    //c.createOrbit();
    c.x = LINE_WIDTH;
    var t = this.t =  TweenTriangle(easing).addChildTo(this);
    
    this.interactive = true;
    this.setOrigin(0,0);
    this.width = this.height = SIZE * SCALE;
    
    this.setTweenTime();
    
  },
  
  setTweenTime:function(time){
    time = time ||SPEED;
    function set(t){t.duration = SPEED;}
    var c = this.c;
    c.circ.fill = 'red';
    c.circ.radius = 2 * SCALE;
    c.circ.tweenerF._tasks.forEach(set);
    c.circ.t2._tasks.forEach(set);

    c.orbit = Sprite(o).addChildTo(c).setOrigin(0, 0.25);
    c.orbit.x = -SCALE;
    c.circ.addChildTo(c);
    
    this.t.tri.tweenerF._tasks.forEach(set);
    
  },
  
  toLarge:function(){
    this.addChildTo(this.parent);
    this.__x = this.__x || this.x;
    this.__y = this.__y || this.y;
    var scale = 5 / SCALE;
    this.tweenerF.clear()
    .to({
      scaleX:scale,
      scaleY:scale,
      x:480 - SIZE * 5 / 2,
      y:320 - SIZE * 5 / 2 - SIZE,
    }, SPEED, this.easing);
    
    this.bg.tweenerF.clear().to({alpha:0.8},SPEED,this.easing);
    
    this.large = true;
    
  },
  
  toSmall:function(){
    
    this.tweenerF.clear()
    .to({
      scaleX:1/SCALE,
      scaleY:1/SCALE,
      x:this.__x,
      y:this.__y,
    }, SPEED, this.easing);
    
    this.bg.tweenerF.clear().to({alpha:0},SPEED,this.easing);
    
    this.large = false;
  }
  
});

phina.define('TweenGraph',{
  
  superClass:CanvasElement,
  
  init:function(easing){
    this.superInit();
    
    var background = Sprite(TweenGraph.graph).addChildTo(this);
    background.origin.set(0,0);
    var label = Label({
      text:easing,
      fontSize:26 * SCALE,
      fontStyle:"Arial",
      fontWeight:'bold',
      baseline:'top',
      align:"center",
      padding:0,
    }).addChildTo(this);
    label.scaleX=0.7;
    label._render();
    var h = background.height;
    var w = background.width;
    label.y = h;
    label.x = w/2;
  },
  
  _static:{
    graph:(function(){
      var cv = phina.graphics.Canvas();
      var SIZE = window.SIZE*SCALE;
      var lw = LINE_WIDTH;
      cv.setSize(SIZE + lw, SIZE + lw);
      var c = cv.context;
      c.lineWidth = lw;
      lw/=2;
      c.beginPath();
      c.moveTo(SIZE,lw);
      c.lineTo(lw,lw);
      c.lineTo(lw,SIZE);
      c.lineTo(SIZE,SIZE);
      //c.closePath();
      c.stroke();
      return cv;
    })()
  }
  
});

phina.define('TweenCircle',{
  superClass:CanvasElement,
  //time:90,
  init:function(easing){
    this.superInit();
    var circ = CircleShape({
      fill:"#f75",
      stroke:false,
      radius:1 * SCALE,
      padding:0,
    }).addChildTo(this);
    
    circ.t2 = TweenerByFPS().attachTo(circ);
    this.circ = circ;
    this.easing = easing;
    this.setTweener();
  },
  
  setTweener:function(time){
    var w,h,
    circ=this.circ,
    easing=this.easing;
    w=h=TweenGraph.graph.width - LINE_WIDTH;
    circ.y = h - 2;
    circ.x = 0;
    time = time||TIME;
    circ.t2.clear().by({
      x:w - LINE_WIDTH,
    },TIME).set({x:0}).setLoop(true);
    
    circ.tweenerF.clear().by({
      y:-h + LINE_WIDTH,
    },TIME,easing)
    //.wait(200)
    .set({y:circ.y})
    .setLoop(true);
  },
  
  // 残像を作る。別APPのシーンを強制更新
  createOrbit: function(){
    parent.location.hash = "";
    var app=TweenCircle._app;
    var scene = app.currentScene;
    app.backgroundColor = "rgba(0,0,0,0)";
    scene.backgroundColor="rgba(0,0,0,0)";
    var w = app.canvas.width; 
    var h = app.canvas.height;
    scene.canvas.context.clearRect(0,0,w,h);
    app.canvas.context.clearRect(0,0,w,h);
    
    var layer = scene.layer || (scene.layer = CanvasElement().addChildTo(scene));
    layer.y=h/4;
    layer.x=SCALE;
    this.circ.addChildTo(layer);
    
    TIME.times(function(){
      app._loop();
    });
    
    var o = phina.graphics.Canvas();
    o.setSize(w,h);
    
    o.context.drawImage(app.domElement,0,0,w,h);
    this.orbit = Sprite(o).addChildTo(this).setOrigin(0,0.25);
    this.orbit.x = -SCALE;
    this.circ.addChildTo(this);
    
    var a = document.createElement('a');
    
    var url = o.domElement.toDataURL('image/png');
    a.href = url;
    a.download = this.easing +".png";
    a.click();
    
    // はみ出る
    //if("easeInElastic"===this.easing)open(o.domElement.toDataURL('image/png'));
  },
  
  _static:{
    _app:CanvasApp({
      width:(SIZE + 2) * SCALE,
      height:SIZE * 2 * SCALE,
      fit:false,
      domElement:document.createElement("canvas")
    }),
    
  }
  
});

phina.define('TweenTriangle',{
  superClass:CanvasElement,
  init:function(easing){
    this.superInit();
    var t = TriangleShape({
      fill:'#7af',//'#39f',
      stroke:false,
      padding:0,
      radius:8 * SCALE,
    }).addChildTo(this);
    t.origin.set(0,0.5);
    t.rotation= - 90;
    var w,h;
    w=h=TweenGraph.graph.width - LINE_WIDTH;
    
    t.y = h + 8*SCALE;
    t.x = w + 8*SCALE;
    t.tweenerF.by({y: -h + LINE_WIDTH},TIME,easing)
    .set({y: t.y})
    .setLoop(true);
    
    this.tri = t;
  }
});

/*
 * メイン処理
 */
phina.main(function() {
  

  (window.requestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.msRequestAnimationFrame || 
  function(func){
    return setTimeout(func,33);
  }
  )(function(){
    // アプリケーションを生成

    var asset = {};
    for (var k in Tween.EASING) {
      asset[k] = "assets/" + k + '.png';
    }
    var app = GameApp({
      startLabel: 'main', // MainScene から開始
      height:640,
      width: 960,
      assets:{image:asset},
      domElement:document.createElement('canvas')
    });
    
  
    app.fps=60;
    
    //app.enableStats();
  
    // 実行
    app.run();
  });
  // document.body.appendChild(TweenCircle._app.domElement);
});

