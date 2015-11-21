(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Matter = require('matter-js')
var preload = require('preload-img')
var vkey = require('vkey')

var RESTITUTION = 0.9
var OFFSET = 1

var KEYS = [
  ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', null],
  [null, 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', '\\'],
  [null, 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', '\'', null],
  [null, null, 'Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/', null, null]
]

var WIDTH, HEIGHT, KEYS_X

function onResize () {
  WIDTH = Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
  HEIGHT = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)

  KEYS_X = {}
  KEYS.forEach(function (row) {
    row.forEach(function (letter, i) {
      if (!letter) return // ignore meta keys
      KEYS_X[letter] = ((i / row.length) + (0.5 / row.length)) * WIDTH
      preload(getImagePath(letter))
    })
  })

  var $canvas = document.querySelector('canvas')
  if ($canvas) {
    $canvas.width = WIDTH
    $canvas.height = HEIGHT
  }
}

onResize()
window.addEventListener('resize', onResize)

var engine = Matter.Engine.create(document.querySelector('.content'), {
  render: {
    options: {
      width: WIDTH,
      height: HEIGHT,
      background: '#222',
      renderer: 'webgl'
    }
  }
})

// No bounds on the world (for accurate physics)
engine.world.bounds.min.x = -Infinity
engine.world.bounds.min.y = -Infinity
engine.world.bounds.max.x = Infinity
engine.world.bounds.max.y = Infinity

// Show textures
engine.render.options.wireframes = false

engine.enableSleeping = true

// if (debug.enabled) {
//   engine.render.options.showCollisions = true
//   engine.render.options.showVelocity = true
//   engine.render.options.showAngleIndicator = true
// }

// Add static walls surrounding the world
Matter.World.add(engine.world, [
  // bottom (left)
  Matter.Bodies.rectangle(WIDTH / 4, HEIGHT + 30, WIDTH / 2, OFFSET, {
    angle: -0.1,
    isStatic: true,
    friction: 0.001,
    render: {
      visible: false
    }
  }),
  // bottom (right)
  Matter.Bodies.rectangle((WIDTH / 4) * 3, HEIGHT + 30, WIDTH / 2, OFFSET, {
    angle: 0.1,
    isStatic: true,
    friction: 0.001,
    render: {
      visible: false
    }
  }),
  // platform to catch letters that fall offscreen
  Matter.Bodies.rectangle(WIDTH / 2, HEIGHT + 100, WIDTH * 4, OFFSET, {
    isStatic: true,
    friction: 1, // letters should stop sliding with sleeping=true
    render: {
      visible: false
    }
  })
])

// run the engine
Matter.Engine.run(engine)

document.body.addEventListener('keydown', function (e) {
  var key = vkey[e.keyCode]

  if (key in KEYS_X) {
    addLetter(key, KEYS_X[key], HEIGHT - 30)
  }
}, false)


function addLetter (key, x, y) {
  playTypeSound()
  hideHelp()

  var body = Matter.Bodies.circle(x, y, 30, {
    restitution: RESTITUTION,
    friction: 0.001,
    render: {
      sprite: {
        texture: getImagePath(key)
      }
    }
  })

  var vector = {
    x: (Math.floor((Date.now() / 200) % 10) / 200) - 0.025,
    y: -1 * (HEIGHT / 3200)
  }

  Matter.Body.applyForce(body, body.position, vector)
  Matter.World.add(engine.world, [ body ])

  setTimeout(function() {
    Matter.World.remove(engine.world, body);
  }, 1000 + Math.random() * 5000);
}

function getImagePath (key) {
  if (key === '.') key = 'dot'
  if (key === '/') key = 'slash'
  if (key === '\\') key = 'backslash'
  return './img/' + key + '.png'
}

function playTypeSound () {
  var $audio = document.createElement('audio')
  $audio.src = './type.mp3'
  $audio.addEventListener('ended', function (e) {
    $audio.src = ''
  })
  $audio.play()
}

var helpHidden = false
var $help = document.querySelector('.help')

function hideHelp () {
  if (helpHidden) return
  helpHidden = true
  $help.style.display = 'none'
}

var touchActive = false
document.body.addEventListener('touchstart', function (e) {
  touchActive = true
  addTouchLetter(e)
  var interval = window.setInterval(function () {
    if (touchActive) addTouchLetter(e)
    else clearInterval(interval)
  }, 100)
})

function addTouchLetter (e) {
  var keys = Object.keys(KEYS_X)
  var key = keys[Math.floor(Math.random() * keys.length)]
  var x = e.touches[0].screenX
  var y = e.touches[0].screenY
  addLetter(key, x, y)
}

document.body.addEventListener('touchend', function (e) {
  console.log('')
  touchActive = false
})


window.addLetter = addLetter
window.engine = engine
window.Matter = Matter

},{"matter-js":2,"preload-img":3,"vkey":4}],2:[function(require,module,exports){
/**
* matter-0.8.0.min.js 0.8.0-alpha 2014-05-04
* http://brm.io/matter-js/
* License: MIT
*/

!function(){var a={},b={};!function(){var a=1;b.create=function(a){var b={id:o.nextId(),type:"body",label:"Body",angle:0,vertices:z.fromPath("L 0 0 L 40 0 L 40 40 L 0 40"),position:{x:0,y:0},force:{x:0,y:0},torque:0,positionImpulse:{x:0,y:0},constraintImpulse:{x:0,y:0,angle:0},speed:0,angularSpeed:0,velocity:{x:0,y:0},angularVelocity:0,isStatic:!1,isSleeping:!1,motion:0,sleepThreshold:60,density:.001,restitution:0,friction:.1,frictionAir:.01,groupId:0,slop:.05,timeScale:1,render:{visible:!0,sprite:{xScale:1,yScale:1},lineWidth:1.5}},d=o.extend(b,a);return c(d),d},b.nextGroupId=function(){return a++};var c=function(a){a.axes=a.axes||w.fromVertices(a.vertices),a.area=z.area(a.vertices),a.bounds=x.create(a.vertices),a.mass=a.mass||a.density*a.area,a.inverseMass=1/a.mass,a.inertia=a.inertia||z.inertia(a.vertices,a.mass),a.inverseInertia=1/a.inertia,a.positionPrev=a.positionPrev||{x:a.position.x,y:a.position.y},a.anglePrev=a.anglePrev||a.angle,a.render.fillStyle=a.render.fillStyle||(a.isStatic?"#eeeeee":o.choose(["#556270","#4ECDC4","#C7F464","#FF6B6B","#C44D58"])),a.render.strokeStyle=a.render.strokeStyle||o.shadeColor(a.render.fillStyle,-20),z.create(a.vertices,a);var c=z.centre(a.vertices);z.translate(a.vertices,a.position),z.translate(a.vertices,c,-1),z.rotate(a.vertices,a.angle,a.position),w.rotate(a.axes,a.angle),x.update(a.bounds,a.vertices,a.velocity),b.setStatic(a,a.isStatic),t.set(a,a.isSleeping)};b.setStatic=function(a,b){a.isStatic=b,b&&(a.restitution=0,a.friction=1,a.mass=a.inertia=a.density=1/0,a.inverseMass=a.inverseInertia=0,a.render.lineWidth=1,a.positionPrev.x=a.position.x,a.positionPrev.y=a.position.y,a.anglePrev=a.angle,a.angularVelocity=0,a.speed=0,a.angularSpeed=0,a.motion=0)},b.resetForcesAll=function(a){for(var b=0;b<a.length;b++){var c=a[b];c.force.x=0,c.force.y=0,c.torque=0}},b.applyGravityAll=function(a,b){for(var c=0;c<a.length;c++){var d=a[c];d.isStatic||d.isSleeping||(d.force.y+=d.mass*b.y*.001,d.force.x+=d.mass*b.x*.001)}},b.updateAll=function(a,c,d,e,f){for(var g=0;g<a.length;g++){var h=a[g];h.isStatic||h.isSleeping||h.bounds.max.x<f.min.x||h.bounds.min.x>f.max.x||h.bounds.max.y<f.min.y||h.bounds.min.y>f.max.y||b.update(h,c,d,e)}},b.update=function(a,b,c,d){var e=Math.pow(b*c*a.timeScale,2),f=1-a.frictionAir*c*a.timeScale,g=a.position.x-a.positionPrev.x,h=a.position.y-a.positionPrev.y;a.velocity.x=g*f*d+a.force.x/a.mass*e,a.velocity.y=h*f*d+a.force.y/a.mass*e,a.positionPrev.x=a.position.x,a.positionPrev.y=a.position.y,a.position.x+=a.velocity.x,a.position.y+=a.velocity.y,a.angularVelocity=(a.angle-a.anglePrev)*f*d+a.torque/a.inertia*e,a.anglePrev=a.angle,a.angle+=a.angularVelocity,a.speed=y.magnitude(a.velocity),a.angularSpeed=Math.abs(a.angularVelocity),z.translate(a.vertices,a.velocity),0!==a.angularVelocity&&(z.rotate(a.vertices,a.angularVelocity,a.position),w.rotate(a.axes,a.angularVelocity)),x.update(a.bounds,a.vertices,a.velocity)},b.applyForce=function(a,b,c){a.force.x+=c.x,a.force.y+=c.y;var d={x:b.x-a.position.x,y:b.y-a.position.y};a.torque+=(d.x*c.y-d.y*c.x)*a.inverseInertia},b.translate=function(a,b){a.positionPrev.x+=b.x,a.positionPrev.y+=b.y,a.position.x+=b.x,a.position.y+=b.y,z.translate(a.vertices,b),x.update(a.bounds,a.vertices,a.velocity)},b.rotate=function(a,b){a.anglePrev+=b,a.angle+=b,z.rotate(a.vertices,b,a.position),w.rotate(a.axes,b),x.update(a.bounds,a.vertices,a.velocity)},b.scale=function(a,b,c,d){z.scale(a.vertices,b,c,d),a.axes=w.fromVertices(a.vertices),a.area=z.area(a.vertices),a.mass=a.density*a.area,a.inverseMass=1/a.mass,z.translate(a.vertices,{x:-a.position.x,y:-a.position.y}),a.inertia=z.inertia(a.vertices,a.mass),a.inverseInertia=1/a.inertia,z.translate(a.vertices,{x:a.position.x,y:a.position.y}),x.update(a.bounds,a.vertices,a.velocity)}}();var c={};!function(){c.create=function(a){return o.extend({id:o.nextId(),type:"composite",parent:null,isModified:!1,bodies:[],constraints:[],composites:[],label:"Composite"},a)},c.setModified=function(a,b,d,e){if(a.isModified=b,d&&a.parent&&c.setModified(a.parent,b,d,e),e)for(var f=0;f<a.composites.length;f++){var g=a.composites[f];c.setModified(g,b,d,e)}},c.add=function(a,b){for(var d=[].concat(b),e=0;e<d.length;e++){var f=d[e];switch(f.type){case"body":c.addBody(a,f);break;case"constraint":c.addConstraint(a,f);break;case"composite":c.addComposite(a,f);break;case"mouseConstraint":c.addConstraint(a,f.constraint)}}return a},c.remove=function(a,b,d){for(var e=[].concat(b),f=0;f<e.length;f++){var g=e[f];switch(g.type){case"body":c.removeBody(a,g,d);break;case"constraint":c.removeConstraint(a,g,d);break;case"composite":c.removeComposite(a,g,d);break;case"mouseConstraint":c.removeConstraint(a,g.constraint)}}return a},c.addComposite=function(a,b){return a.composites.push(b),b.parent=a,c.setModified(a,!0,!0,!1),a},c.removeComposite=function(a,b,d){var e=a.composites.indexOf(b);if(-1!==e&&(c.removeCompositeAt(a,e),c.setModified(a,!0,!0,!1)),d)for(var f=0;f<a.composites.length;f++)c.removeComposite(a.composites[f],b,!0);return a},c.removeCompositeAt=function(a,b){return a.composites.splice(b,1),c.setModified(a,!0,!0,!1),a},c.addBody=function(a,b){return a.bodies.push(b),c.setModified(a,!0,!0,!1),a},c.removeBody=function(a,b,d){var e=a.bodies.indexOf(b);if(-1!==e&&(c.removeBodyAt(a,e),c.setModified(a,!0,!0,!1)),d)for(var f=0;f<a.composites.length;f++)c.removeBody(a.composites[f],b,!0);return a},c.removeBodyAt=function(a,b){return a.bodies.splice(b,1),c.setModified(a,!0,!0,!1),a},c.addConstraint=function(a,b){return a.constraints.push(b),c.setModified(a,!0,!0,!1),a},c.removeConstraint=function(a,b,d){var e=a.constraints.indexOf(b);if(-1!==e&&c.removeConstraintAt(a,e),d)for(var f=0;f<a.composites.length;f++)c.removeConstraint(a.composites[f],b,!0);return a},c.removeConstraintAt=function(a,b){return a.constraints.splice(b,1),c.setModified(a,!0,!0,!1),a},c.clear=function(a,b,d){if(d)for(var e=0;e<a.composites.length;e++)c.clear(a.composites[e],b,!0);return b?a.bodies=a.bodies.filter(function(a){return a.isStatic}):a.bodies.length=0,a.constraints.length=0,a.composites.length=0,c.setModified(a,!0,!0,!1),a},c.allBodies=function(a){for(var b=[].concat(a.bodies),d=0;d<a.composites.length;d++)b=b.concat(c.allBodies(a.composites[d]));return b},c.allConstraints=function(a){for(var b=[].concat(a.constraints),d=0;d<a.composites.length;d++)b=b.concat(c.allConstraints(a.composites[d]));return b},c.allComposites=function(a){for(var b=[].concat(a.composites),d=0;d<a.composites.length;d++)b=b.concat(c.allComposites(a.composites[d]));return b},c.get=function(a,b,d){var e,f;switch(d){case"body":e=c.allBodies(a);break;case"constraint":e=c.allConstraints(a);break;case"composite":e=c.allComposites(a).concat(a)}return e?(f=e.filter(function(a){return a.id.toString()===b.toString()}),0===f.length?null:f[0]):null},c.move=function(a,b,d){return c.remove(a,b),c.add(d,b),a},c.rebase=function(a){for(var b=c.allBodies(a).concat(c.allConstraints(a)).concat(c.allComposites(a)),d=0;d<b.length;d++)b[d].id=o.nextId();return c.setModified(a,!0,!0,!1),a}}();var d={};!function(){d.create=function(a){var b=c.create(),d={label:"World",gravity:{x:0,y:1},bounds:{min:{x:0,y:0},max:{x:800,y:600}}};return o.extend(b,d,a)}}();var e={};!function(){e.create=function(a){return{id:e.id(a),vertex:a,normalImpulse:0,tangentImpulse:0}},e.id=function(a){return a.body.id+"_"+a.index}}();var f={};!function(){f.collisions=function(a,b){for(var c=[],d=b.metrics,e=b.pairs.table,f=0;f<a.length;f++){var g=a[f][0],i=a[f][1];if(!(g.groupId&&i.groupId&&g.groupId===i.groupId||(g.isStatic||g.isSleeping)&&(i.isStatic||i.isSleeping)||(d.midphaseTests+=1,!x.overlaps(g.bounds,i.bounds)))){var j,k=h.id(g,i),m=e[k];j=m&&m.isActive?m.collision:null;var n=l.collides(g,i,j);d.narrowphaseTests+=1,n.reused&&(d.narrowReuseCount+=1),n.collided&&(c.push(n),d.narrowDetections+=1)}}return c},f.bruteForce=function(a,b){for(var c=[],d=b.metrics,e=b.pairs.table,f=0;f<a.length;f++)for(var g=f+1;g<a.length;g++){var i=a[f],j=a[g];if(!(i.groupId&&j.groupId&&i.groupId===j.groupId||(i.isStatic||i.isSleeping)&&(j.isStatic||j.isSleeping)||(d.midphaseTests+=1,!x.overlaps(i.bounds,j.bounds)))){var k,m=h.id(i,j),n=e[m];k=n&&n.isActive?n.collision:null;var o=l.collides(i,j,k);d.narrowphaseTests+=1,o.reused&&(d.narrowReuseCount+=1),o.collided&&(c.push(o),d.narrowDetections+=1)}}return c}}();var g={};!function(){g.create=function(a,b){return{buckets:{},pairs:{},pairsList:[],bucketWidth:a||48,bucketHeight:b||48}},g.update=function(c,g,h,k){var l,m,n,o,p,q=h.world,r=c.buckets,s=h.metrics,t=!1;for(s.broadphaseTests=0,l=0;l<g.length;l++){var u=g[l];if((!u.isSleeping||k)&&!(u.bounds.max.x<0||u.bounds.min.x>q.bounds.width||u.bounds.max.y<0||u.bounds.min.y>q.bounds.height)){var v=b(c,u);if(!u.region||v.id!==u.region.id||k){s.broadphaseTests+=1,(!u.region||k)&&(u.region=v);var w=a(v,u.region);for(m=w.startCol;m<=w.endCol;m++)for(n=w.startRow;n<=w.endRow;n++){p=d(m,n),o=r[p];var x=m>=v.startCol&&m<=v.endCol&&n>=v.startRow&&n<=v.endRow,y=m>=u.region.startCol&&m<=u.region.endCol&&n>=u.region.startRow&&n<=u.region.endRow;!x&&y&&y&&o&&i(c,o,u),(u.region===v||x&&!y||k)&&(o||(o=e(r,p)),f(c,o,u))}u.region=v,t=!0}}}t&&(c.pairsList=j(c))},g.clear=function(a){a.buckets={},a.pairs={},a.pairsList=[]};var a=function(a,b){var d=Math.min(a.startCol,b.startCol),e=Math.max(a.endCol,b.endCol),f=Math.min(a.startRow,b.startRow),g=Math.max(a.endRow,b.endRow);return c(d,e,f,g)},b=function(a,b){var d=b.bounds,e=Math.floor(d.min.x/a.bucketWidth),f=Math.floor(d.max.x/a.bucketWidth),g=Math.floor(d.min.y/a.bucketHeight),h=Math.floor(d.max.y/a.bucketHeight);return c(e,f,g,h)},c=function(a,b,c,d){return{id:a+","+b+","+c+","+d,startCol:a,endCol:b,startRow:c,endRow:d}},d=function(a,b){return a+","+b},e=function(a,b){var c=a[b]=[];return c},f=function(a,b,c){for(var d=0;d<b.length;d++){var e=b[d];if(!(c.id===e.id||c.isStatic&&e.isStatic)){var f=h.id(c,e),g=a.pairs[f];g?g[2]+=1:a.pairs[f]=[c,e,1]}}b.push(c)},i=function(a,b,c){b.splice(b.indexOf(c),1);for(var d=0;d<b.length;d++){var e=b[d],f=h.id(c,e),g=a.pairs[f];g&&(g[2]-=1)}},j=function(a){var b,c,d=[];b=o.keys(a.pairs);for(var e=0;e<b.length;e++)c=a.pairs[b[e]],c[2]>0?d.push(c):delete a.pairs[b[e]];return d}}();var h={};!function(){h.create=function(a,b){var c=a.bodyA,d=a.bodyB,e={id:h.id(c,d),bodyA:c,bodyB:d,contacts:{},activeContacts:[],separation:0,isActive:!0,timeCreated:b,timeUpdated:b,inverseMass:c.inverseMass+d.inverseMass,friction:Math.min(c.friction,d.friction),restitution:Math.max(c.restitution,d.restitution),slop:Math.max(c.slop,d.slop)};return h.update(e,a,b),e},h.update=function(a,b,c){var d=a.contacts,f=b.supports,g=a.activeContacts;if(a.collision=b,g.length=0,b.collided){for(var i=0;i<f.length;i++){var j=f[i],k=e.id(j),l=d[k];g.push(l?l:d[k]=e.create(j))}a.separation=b.depth,h.setActive(a,!0,c)}else a.isActive===!0&&h.setActive(a,!1,c)},h.setActive=function(a,b,c){b?(a.isActive=!0,a.timeUpdated=c):(a.isActive=!1,a.activeContacts.length=0)},h.id=function(a,b){return a.id<b.id?a.id+"_"+b.id:b.id+"_"+a.id}}();var i={};!function(){var a=1e3;i.create=function(a){return o.extend({table:{},list:[],collisionStart:[],collisionActive:[],collisionEnd:[]},a)},i.update=function(a,b,c){var d,e,f,g,i=a.list,j=a.table,k=a.collisionStart,l=a.collisionEnd,m=a.collisionActive,n=[];for(k.length=0,l.length=0,m.length=0,g=0;g<b.length;g++)d=b[g],d.collided&&(e=h.id(d.bodyA,d.bodyB),n.push(e),f=j[e],f?(f.isActive?m.push(f):k.push(f),h.update(f,d,c)):(f=h.create(d,c),j[e]=f,k.push(f),i.push(f)));for(g=0;g<i.length;g++)f=i[g],f.isActive&&-1===n.indexOf(f.id)&&(h.setActive(f,!1,c),l.push(f))},i.removeOld=function(b,c){var d,e,f,g,h=b.list,i=b.table,j=[];for(g=0;g<h.length;g++)d=h[g],e=d.collision,e.bodyA.isSleeping||e.bodyB.isSleeping?d.timeUpdated=c:c-d.timeUpdated>a&&j.push(g);for(g=0;g<j.length;g++)f=j[g]-g,d=h[f],delete i[d.id],h.splice(f,1)},i.clear=function(a){return a.table={},a.list.length=0,a.collisionStart.length=0,a.collisionActive.length=0,a.collisionEnd.length=0,a}}();var j={};!function(){j.ray=function(a,b,c,d){d=d||Number.MIN_VALUE;for(var e=y.angle(b,c),f=y.magnitude(y.sub(b,c)),g=.5*(c.x+b.x),h=.5*(c.y+b.y),i=u.rectangle(g,h,f,d,{angle:e}),j=[],k=0;k<a.length;k++){var m=a[k];if(x.overlaps(m.bounds,i.bounds)){var n=l.collides(m,i);n.collided&&(n.body=n.bodyA=n.bodyB=m,j.push(n))}}return j},j.region=function(a,b,c){for(var d=[],e=0;e<a.length;e++){var f=a[e],g=x.overlaps(f.bounds,b);(g&&!c||!g&&c)&&d.push(f)}return d}}();var k={};!function(){var a=4,b=.2,c=.6;k.solvePosition=function(a,c){var d,e,f,g,h,i,j,k,l;for(d=0;d<a.length;d++)e=a[d],e.isActive&&(f=e.collision,g=f.bodyA,h=f.bodyB,i=f.supports[0],j=f.supportCorrected,k=f.normal,l=y.sub(y.add(h.positionImpulse,i),y.add(g.positionImpulse,j)),e.separation=y.dot(k,l));for(d=0;d<a.length;d++)e=a[d],e.isActive&&(f=e.collision,g=f.bodyA,h=f.bodyB,k=f.normal,positionImpulse=(e.separation*b-e.slop)*c,(g.isStatic||h.isStatic)&&(positionImpulse*=2),g.isStatic||g.isSleeping||(g.positionImpulse.x+=k.x*positionImpulse,g.positionImpulse.y+=k.y*positionImpulse),h.isStatic||h.isSleeping||(h.positionImpulse.x-=k.x*positionImpulse,h.positionImpulse.y-=k.y*positionImpulse))},k.postSolvePosition=function(a){for(var b=0;b<a.length;b++){var d=a[b];(0!==d.positionImpulse.x||0!==d.positionImpulse.y)&&(d.position.x+=d.positionImpulse.x,d.position.y+=d.positionImpulse.y,d.positionPrev.x+=d.positionImpulse.x,d.positionPrev.y+=d.positionImpulse.y,z.translate(d.vertices,d.positionImpulse),x.update(d.bounds,d.vertices,d.velocity),d.positionImpulse.x*=c,d.positionImpulse.y*=c)}},k.preSolveVelocity=function(a){var b,c,d,e,f,g,h,i,j,k,l,m,n,o,p={};for(b=0;b<a.length;b++)if(d=a[b],d.isActive)for(e=d.activeContacts,f=d.collision,g=f.bodyA,h=f.bodyB,i=f.normal,j=f.tangent,c=0;c<e.length;c++)k=e[c],l=k.vertex,m=k.normalImpulse,n=k.tangentImpulse,p.x=i.x*m+j.x*n,p.y=i.y*m+j.y*n,g.isStatic||g.isSleeping||(o=y.sub(l,g.position),g.positionPrev.x+=p.x*g.inverseMass,g.positionPrev.y+=p.y*g.inverseMass,g.anglePrev+=y.cross(o,p)*g.inverseInertia),h.isStatic||h.isSleeping||(o=y.sub(l,h.position),h.positionPrev.x-=p.x*h.inverseMass,h.positionPrev.y-=p.y*h.inverseMass,h.anglePrev-=y.cross(o,p)*h.inverseInertia)},k.solveVelocity=function(b,c){for(var d={},e=c*c,f=0;f<b.length;f++){var g=b[f];if(g.isActive){var h=g.collision,i=h.bodyA,j=h.bodyB,k=h.normal,l=h.tangent,m=g.activeContacts,n=1/m.length;i.velocity.x=i.position.x-i.positionPrev.x,i.velocity.y=i.position.y-i.positionPrev.y,j.velocity.x=j.position.x-j.positionPrev.x,j.velocity.y=j.position.y-j.positionPrev.y,i.angularVelocity=i.angle-i.anglePrev,j.angularVelocity=j.angle-j.anglePrev;for(var p=0;p<m.length;p++){var q=m[p],r=q.vertex,s=y.sub(r,i.position),t=y.sub(r,j.position),u=y.add(i.velocity,y.mult(y.perp(s),i.angularVelocity)),v=y.add(j.velocity,y.mult(y.perp(t),j.angularVelocity)),w=y.sub(u,v),x=y.dot(k,w),z=y.dot(l,w),A=Math.abs(z),B=o.sign(z),C=(1+g.restitution)*x,D=o.clamp(g.separation+x,0,1),E=z;A>D*g.friction*e&&(E=D*g.friction*e*B);var F=y.cross(s,k),G=y.cross(t,k),H=n/(g.inverseMass+i.inverseInertia*F*F+j.inverseInertia*G*G);if(C*=H,E*=H,0>x&&x*x>a*e)q.normalImpulse=0,q.tangentImpulse=0;else{var I=q.normalImpulse;q.normalImpulse=Math.min(q.normalImpulse+C,0),C=q.normalImpulse-I;var J=q.tangentImpulse;q.tangentImpulse=o.clamp(q.tangentImpulse+E,-A,A),E=q.tangentImpulse-J}d.x=k.x*C+l.x*E,d.y=k.y*C+l.y*E,i.isStatic||i.isSleeping||(i.positionPrev.x+=d.x*i.inverseMass,i.positionPrev.y+=d.y*i.inverseMass,i.anglePrev+=y.cross(s,d)*i.inverseInertia),j.isStatic||j.isSleeping||(j.positionPrev.x-=d.x*j.inverseMass,j.positionPrev.y-=d.y*j.inverseMass,j.anglePrev-=y.cross(t,d)*j.inverseInertia)}}}}}();var l={};!function(){l.collides=function(b,d,e){var f,g,h,i,j=e,k=!1;if(j){var l=b.speed*b.speed+b.angularSpeed*b.angularSpeed+d.speed*d.speed+d.angularSpeed*d.angularSpeed;k=j&&j.collided&&.2>l,i=j}else i={collided:!1,bodyA:b,bodyB:d};if(j&&k){var m=[j.bodyA.axes[j.axisNumber]];if(h=a(j.bodyA.vertices,j.bodyB.vertices,m),i.reused=!0,h.overlap<=0)return i.collided=!1,i}else{if(f=a(b.vertices,d.vertices,b.axes),f.overlap<=0)return i.collided=!1,i;if(g=a(d.vertices,b.vertices,d.axes),g.overlap<=0)return i.collided=!1,i;f.overlap<g.overlap?(h=f,i.bodyA=b,i.bodyB=d):(h=g,i.bodyA=d,i.bodyB=b),i.axisNumber=h.axisNumber}i.collided=!0,i.normal=h.axis,i.depth=h.overlap,b=i.bodyA,d=i.bodyB,y.dot(i.normal,y.sub(d.position,b.position))>0&&(i.normal=y.neg(i.normal)),i.tangent=y.perp(i.normal),i.penetration={x:i.normal.x*i.depth,y:i.normal.y*i.depth};var n=c(b,d,i.normal),o=[n[0]];if(z.contains(b.vertices,n[1]))o.push(n[1]);else{var p=c(d,b,y.neg(i.normal));z.contains(d.vertices,p[0])&&o.push(p[0]),o.length<2&&z.contains(d.vertices,p[1])&&o.push(p[1])}return i.supports=o,i.supportCorrected=y.sub(n[0],i.penetration),i};var a=function(a,c,d){for(var e,f,g={},h={},i={overlap:Number.MAX_VALUE},j=0;j<d.length;j++){if(f=d[j],b(g,a,f),b(h,c,f),e=g.min<h.min?g.max-h.min:h.max-g.min,0>=e)return i.overlap=e,i;e<i.overlap&&(i.overlap=e,i.axis=f,i.axisNumber=j)}return i},b=function(a,b,c){for(var d=y.dot(b[0],c),e=d,f=1;f<b.length;f+=1){var g=y.dot(b[f],c);g>e?e=g:d>g&&(d=g)}a.min=d,a.max=e},c=function(a,b,c){for(var d,e,f=Number.MAX_VALUE,g={x:0,y:0},h=b.vertices,i=a.position,j=h[0],k=h[1],l=0;l<h.length;l++)e=h[l],g.x=e.x-i.x,g.y=e.y-i.y,d=-y.dot(c,g),f>d&&(f=d,j=e);var m=j.index-1>=0?j.index-1:h.length-1;e=h[m],g.x=e.x-i.x,g.y=e.y-i.y,f=-y.dot(c,g),k=e;var n=(j.index+1)%h.length;return e=h[n],g.x=e.x-i.x,g.y=e.y-i.y,d=-y.dot(c,g),f>d&&(f=d,k=e),[j,k]}}();var m={};!function(){var a=1e-6,b=.001;m.create=function(b){var c=b;c.bodyA&&!c.pointA&&(c.pointA={x:0,y:0}),c.bodyB&&!c.pointB&&(c.pointB={x:0,y:0});var d=c.bodyA?y.add(c.bodyA.position,c.pointA):c.pointA,e=c.bodyB?y.add(c.bodyB.position,c.pointB):c.pointB,f=y.magnitude(y.sub(d,e));c.length=c.length||f||a;var g={visible:!0,lineWidth:2,strokeStyle:"#666"};return c.render=o.extend(g,c.render),c.id=c.id||o.nextId(),c.label=c.label||"Constraint",c.type="constraint",c.stiffness=c.stiffness||1,c.angularStiffness=c.angularStiffness||0,c.angleA=c.bodyA?c.bodyA.angle:c.angleA,c.angleB=c.bodyB?c.bodyB.angle:c.angleB,c},m.solveAll=function(a,b){for(var c=0;c<a.length;c++)m.solve(a[c],b)},m.solve=function(c,d){var e=c.bodyA,f=c.bodyB,g=c.pointA,h=c.pointB;e&&!e.isStatic&&(c.pointA=y.rotate(g,e.angle-c.angleA),c.angleA=e.angle),f&&!f.isStatic&&(c.pointB=y.rotate(h,f.angle-c.angleB),c.angleB=f.angle);var i=g,j=h;if(e&&(i=y.add(e.position,g)),f&&(j=y.add(f.position,h)),i&&j){var k=y.sub(i,j),l=y.magnitude(k);0===l&&(l=a);var m=(l-c.length)/l,n=y.div(k,l),p=y.mult(k,.5*m*c.stiffness*d*d);if(!(Math.abs(1-l/c.length)<b*d)){var q,r,s,u,v,w,x,z;e&&!e.isStatic?(s={x:i.x-e.position.x+p.x,y:i.y-e.position.y+p.y},e.velocity.x=e.position.x-e.positionPrev.x,e.velocity.y=e.position.y-e.positionPrev.y,e.angularVelocity=e.angle-e.anglePrev,q=y.add(e.velocity,y.mult(y.perp(s),e.angularVelocity)),v=y.dot(s,n),x=e.inverseMass+e.inverseInertia*v*v):(q={x:0,y:0},x=e?e.inverseMass:0),f&&!f.isStatic?(u={x:j.x-f.position.x-p.x,y:j.y-f.position.y-p.y},f.velocity.x=f.position.x-f.positionPrev.x,f.velocity.y=f.position.y-f.positionPrev.y,f.angularVelocity=f.angle-f.anglePrev,r=y.add(f.velocity,y.mult(y.perp(u),f.angularVelocity)),w=y.dot(u,n),z=f.inverseMass+f.inverseInertia*w*w):(r={x:0,y:0},z=f?f.inverseMass:0);var A=y.sub(r,q),B=y.dot(n,A)/(x+z);B>0&&(B=0);var C,D={x:n.x*B,y:n.y*B};e&&!e.isStatic&&(C=y.cross(s,D)*e.inverseInertia*(1-c.angularStiffness),t.set(e,!1),C=o.clamp(C,-.01,.01),e.constraintImpulse.x-=p.x,e.constraintImpulse.y-=p.y,e.constraintImpulse.angle+=C,e.position.x-=p.x,e.position.y-=p.y,e.angle+=C),f&&!f.isStatic&&(C=y.cross(u,D)*f.inverseInertia*(1-c.angularStiffness),t.set(f,!1),C=o.clamp(C,-.01,.01),f.constraintImpulse.x+=p.x,f.constraintImpulse.y+=p.y,f.constraintImpulse.angle-=C,f.position.x+=p.x,f.position.y+=p.y,f.angle-=C)}}},m.postSolveAll=function(a){for(var b=0;b<a.length;b++){var c=a[b],d=c.constraintImpulse;z.translate(c.vertices,d),0!==d.angle&&(z.rotate(c.vertices,d.angle,c.position),w.rotate(c.axes,d.angle),d.angle=0),x.update(c.bounds,c.vertices),d.x=0,d.y=0}}}();var n={};!function(){n.create=function(a,b){var d=a.input.mouse,e=m.create({label:"Mouse Constraint",pointA:d.position,pointB:{x:0,y:0},length:.01,stiffness:.1,angularStiffness:1,render:{strokeStyle:"#90EE90",lineWidth:3}}),f={type:"mouseConstraint",mouse:d,dragBody:null,dragPoint:null,constraint:e},g=o.extend(f,b);return q.on(a,"tick",function(){var b=c.allBodies(a.world);n.update(g,b)}),g},n.update=function(a,b){var c=a.mouse,d=a.constraint;if(0===c.button){if(!d.bodyB)for(var e=0;e<b.length;e++){var f=b[e];x.contains(f.bounds,c.position)&&z.contains(f.vertices,c.position)&&(d.pointA=c.position,d.bodyB=f,d.pointB={x:c.position.x-f.position.x,y:c.position.y-f.position.y},d.angleB=f.angle,t.set(f,!1))}}else d.bodyB=null,d.pointB=null;d.bodyB&&(t.set(d.bodyB,!1),d.pointA=c.position)}}();var o={};!function(){o._nextId=0,o.extend=function(a,b){var c,d,e;"boolean"==typeof b?(c=2,e=b):(c=1,e=!0),d=Array.prototype.slice.call(arguments,c);for(var f=0;f<d.length;f++){var g=d[f];if(g)for(var h in g)e&&g[h]&&g[h].constructor===Object?a[h]&&a[h].constructor!==Object?a[h]=g[h]:(a[h]=a[h]||{},o.extend(a[h],e,g[h])):a[h]=g[h]}return a},o.clone=function(a,b){return o.extend({},b,a)},o.keys=function(a){if(Object.keys)return Object.keys(a);var b=[];for(var c in a)b.push(c);return b},o.values=function(a){var b=[];if(Object.keys){for(var c=Object.keys(a),d=0;d<c.length;d++)b.push(a[c[d]]);return b}for(var e in a)b.push(a[e]);return b},o.shadeColor=function(a,b){var c=parseInt(a.slice(1),16),d=Math.round(2.55*b),e=(c>>16)+d,f=(c>>8&255)+d,g=(255&c)+d;return"#"+(16777216+65536*(255>e?1>e?0:e:255)+256*(255>f?1>f?0:f:255)+(255>g?1>g?0:g:255)).toString(16).slice(1)},o.shuffle=function(a){for(var b=a.length-1;b>0;b--){var c=Math.floor(Math.random()*(b+1)),d=a[b];a[b]=a[c],a[c]=d}return a},o.choose=function(a){return a[Math.floor(Math.random()*a.length)]},o.isElement=function(a){try{return a instanceof HTMLElement}catch(b){return"object"==typeof a&&1===a.nodeType&&"object"==typeof a.style&&"object"==typeof a.ownerDocument}},o.clamp=function(a,b,c){return b>a?b:a>c?c:a},o.sign=function(a){return 0>a?-1:1},o.now=function(){var a=window.performance;return a?(a.now=a.now||a.webkitNow||a.msNow||a.oNow||a.mozNow,+a.now()):+new Date},o.random=function(a,b){return a+Math.random()*(b-a)},o.colorToNumber=function(a){return a=a.replace("#",""),3==a.length&&(a=a.charAt(0)+a.charAt(0)+a.charAt(1)+a.charAt(1)+a.charAt(2)+a.charAt(2)),parseInt(a,16)},o.log=function(a,b){if(console&&console.log){var c;switch(b){case"warn":c="color: coral";break;case"error":c="color: red"}console.log("%c [Matter] "+b+": "+a,c)}},o.nextId=function(){return o._nextId++}}();var p={};!function(){var a=60,e=a,h=1e3/a,j=window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.msRequestAnimationFrame||function(a){window.setTimeout(function(){a(o.now())},h)};p.create=function(b,c){c=o.isElement(b)?c:b,b=o.isElement(b)?b:null;var e={enabled:!0,positionIterations:6,velocityIterations:4,constraintIterations:2,enableSleeping:!1,timeScale:1,input:{},events:[],timing:{fps:a,timestamp:0,delta:h,correction:1,deltaMin:1e3/a,deltaMax:1e3/(.5*a),timeScale:1,isFixed:!1},render:{element:b,controller:A}},j=o.extend(e,c);return j.render=j.render.controller.create(j.render),j.world=d.create(j.world),j.pairs=i.create(),j.metrics=j.metrics||r.create(),j.input.mouse=j.input.mouse||s.create(j.render.canvas),j.broadphase=j.broadphase||{current:"grid",grid:{controller:g,instance:g.create(),detector:f.collisions},bruteForce:{detector:f.bruteForce}},j},p.run=function(a){var b,c=0,d=0,f=[],g=1;!function h(i){if(j(h),a.enabled){var k,m,o=a.timing,r={timestamp:i};q.trigger(a,"beforeTick",r),o.isFixed?k=o.delta:(k=i-b||o.delta,b=i,f.push(k),f=f.slice(-e),k=Math.min.apply(null,f),k=k<o.deltaMin?o.deltaMin:k,k=k>o.deltaMax?o.deltaMax:k,m=k/o.delta,o.delta=k),0!==g&&(m*=o.timeScale/g),0===o.timeScale&&(m=0),g=o.timeScale,d+=1,i-c>=1e3&&(o.fps=d*((i-c)/1e3),c=i,d=0),q.trigger(a,"tick",r),a.world.isModified&&a.render.controller.clear(a.render),p.update(a,k,m),n(a),l(a),p.render(a),q.trigger(a,"afterTick",r)}}()},p.update=function(a,d,e){e="undefined"!=typeof e?e:1;var f,g=a.world,h=a.timing,j=a.broadphase[a.broadphase.current],l=[];h.timestamp+=d*h.timeScale,h.correction=e;var n={timestamp:a.timing.timestamp};q.trigger(a,"beforeUpdate",n);var o=c.allBodies(g),p=c.allConstraints(g);for(r.reset(a.metrics),a.enableSleeping&&t.update(o),b.applyGravityAll(o,g.gravity),b.updateAll(o,d,h.timeScale,e,g.bounds),f=0;f<a.constraintIterations;f++)m.solveAll(p,h.timeScale);m.postSolveAll(o),j.controller?(g.isModified&&j.controller.clear(j.instance),j.controller.update(j.instance,o,a,g.isModified),l=j.instance.pairsList):l=o;var s=j.detector(l,a),u=a.pairs,v=h.timestamp;for(i.update(u,s,v),i.removeOld(u,v),a.enableSleeping&&t.afterCollisions(u.list),k.preSolveVelocity(u.list),f=0;f<a.velocityIterations;f++)k.solveVelocity(u.list,h.timeScale);for(f=0;f<a.positionIterations;f++)k.solvePosition(u.list,h.timeScale);return k.postSolvePosition(o),r.update(a.metrics,a),b.resetForcesAll(o),g.isModified&&c.setModified(g,!1,!1,!0),q.trigger(a,"afterUpdate",n),a},p.render=function(a){var b={timestamp:a.timing.timestamp};q.trigger(a,"beforeRender",b),a.render.controller.world(a),q.trigger(a,"afterRender",b)},p.merge=function(a,b){if(o.extend(a,b),b.world){a.world=b.world,p.clear(a);for(var d=c.allBodies(a.world),e=0;e<d.length;e++){var f=d[e];t.set(f,!1),f.id=o.nextId()}}},p.clear=function(a){var b=a.world;i.clear(a.pairs);var d=a.broadphase[a.broadphase.current];if(d.controller){var e=c.allBodies(b);d.controller.clear(d.instance),d.controller.update(d.instance,e,a,!0)}};var l=function(a){var b=a.input.mouse,c=b.sourceEvents;c.mousemove&&q.trigger(a,"mousemove",{mouse:b}),c.mousedown&&q.trigger(a,"mousedown",{mouse:b}),c.mouseup&&q.trigger(a,"mouseup",{mouse:b}),s.clearSourceEvents(b)},n=function(a){var b=a.pairs;b.collisionStart.length>0&&q.trigger(a,"collisionStart",{pairs:b.collisionStart}),b.collisionActive.length>0&&q.trigger(a,"collisionActive",{pairs:b.collisionActive}),b.collisionEnd.length>0&&q.trigger(a,"collisionEnd",{pairs:b.collisionEnd})}}();var q={};!function(){q.on=function(a,b,c){for(var d,e=b.split(" "),f=0;f<e.length;f++)d=e[f],a.events=a.events||{},a.events[d]=a.events[d]||[],a.events[d].push(c);return c},q.off=function(a,b,c){if(!b)return void(a.events={});"function"==typeof b&&(c=b,b=o.keys(a.events).join(" "));for(var d=b.split(" "),e=0;e<d.length;e++){var f=a.events[d[e]],g=[];if(c)for(var h=0;h<f.length;h++)f[h]!==c&&g.push(f[h]);a.events[d[e]]=g}},q.trigger=function(a,b,c){var d,e,f,g;if(a.events){c||(c={}),d=b.split(" ");for(var h=0;h<d.length;h++)if(e=d[h],f=a.events[e]){g=o.clone(c,!1),g.name=e,g.source=a;for(var i=0;i<f.length;i++)f[i].apply(a,[g])}}}}();var r={};!function(){r.create=function(){return{extended:!1,narrowDetections:0,narrowphaseTests:0,narrowReuse:0,narrowReuseCount:0,midphaseTests:0,broadphaseTests:0,narrowEff:1e-4,midEff:1e-4,broadEff:1e-4,collisions:0,buckets:0,bodies:0,pairs:0}},r.reset=function(a){a.extended&&(a.narrowDetections=0,a.narrowphaseTests=0,a.narrowReuse=0,a.narrowReuseCount=0,a.midphaseTests=0,a.broadphaseTests=0,a.narrowEff=0,a.midEff=0,a.broadEff=0,a.collisions=0,a.buckets=0,a.pairs=0,a.bodies=0)},r.update=function(a,b){if(a.extended){var d=b.world,e=(b.broadphase[b.broadphase.current],c.allBodies(d));a.collisions=a.narrowDetections,a.pairs=b.pairs.list.length,a.bodies=e.length,a.midEff=(a.narrowDetections/(a.midphaseTests||1)).toFixed(2),a.narrowEff=(a.narrowDetections/(a.narrowphaseTests||1)).toFixed(2),a.broadEff=(1-a.broadphaseTests/(e.length||1)).toFixed(2),a.narrowReuse=(a.narrowReuseCount/(a.narrowphaseTests||1)).toFixed(2)}}}();var s;!function(){s=function(b){var c=this;this.element=b||document.body,this.absolute={x:0,y:0},this.position={x:0,y:0},this.mousedownPosition={x:0,y:0},this.mouseupPosition={x:0,y:0},this.offset={x:0,y:0},this.scale={x:1,y:1},this.wheelDelta=0,this.button=-1,this.sourceEvents={mousemove:null,mousedown:null,mouseup:null,mousewheel:null},this.mousemove=function(b){var d=a(b,c.element),e=b.changedTouches;e&&(c.button=0,b.preventDefault()),c.absolute.x=d.x,c.absolute.y=d.y,c.position.x=c.absolute.x*c.scale.x+c.offset.x,c.position.y=c.absolute.y*c.scale.y+c.offset.y,c.sourceEvents.mousemove=b},this.mousedown=function(b){var d=a(b,c.element),e=b.changedTouches;e?(c.button=0,b.preventDefault()):c.button=b.button,c.absolute.x=d.x,c.absolute.y=d.y,c.position.x=c.absolute.x*c.scale.x+c.offset.x,c.position.y=c.absolute.y*c.scale.y+c.offset.y,c.mousedownPosition.x=c.position.x,c.mousedownPosition.y=c.position.y,c.sourceEvents.mousedown=b},this.mouseup=function(b){var d=a(b,c.element),e=b.changedTouches;e&&b.preventDefault(),c.button=-1,c.absolute.x=d.x,c.absolute.y=d.y,c.position.x=c.absolute.x*c.scale.x+c.offset.x,c.position.y=c.absolute.y*c.scale.y+c.offset.y,c.mouseupPosition.x=c.position.x,c.mouseupPosition.y=c.position.y,c.sourceEvents.mouseup=b},this.mousewheel=function(a){c.wheelDelta=Math.max(-1,Math.min(1,a.wheelDelta||-a.detail)),a.preventDefault()},s.setElement(c,c.element)},s.create=function(a){return new s(a)},s.setElement=function(a,b){a.element=b,b.addEventListener("mousemove",a.mousemove),b.addEventListener("mousedown",a.mousedown),b.addEventListener("mouseup",a.mouseup),b.addEventListener("mousewheel",a.mousewheel),b.addEventListener("DOMMouseScroll",a.mousewheel),b.addEventListener("touchmove",a.mousemove),b.addEventListener("touchstart",a.mousedown),b.addEventListener("touchend",a.mouseup)},s.clearSourceEvents=function(a){a.sourceEvents.mousemove=null,a.sourceEvents.mousedown=null,a.sourceEvents.mouseup=null,a.sourceEvents.mousewheel=null,a.wheelDelta=0},s.setOffset=function(a,b){a.offset.x=b.x,a.offset.y=b.y,a.position.x=a.absolute.x*a.scale.x+a.offset.x,a.position.y=a.absolute.y*a.scale.y+a.offset.y},s.setScale=function(a,b){a.scale.x=b.x,a.scale.y=b.y,a.position.x=a.absolute.x*a.scale.x+a.offset.x,a.position.y=a.absolute.y*a.scale.y+a.offset.y};var a=function(a,b){var c,d,e=b.getBoundingClientRect(),f=document.documentElement||document.body.parentNode||document.body,g=void 0!==window.pageXOffset?window.pageXOffset:f.scrollLeft,h=void 0!==window.pageYOffset?window.pageYOffset:f.scrollTop,i=a.changedTouches;return i?(c=i[0].pageX-e.left-g,d=i[0].pageY-e.top-h):(c=a.pageX-e.left-g,d=a.pageY-e.top-h),{x:c/(b.clientWidth/b.width),y:d/(b.clientHeight/b.height)}}}();var t={};!function(){var a=.18,b=.08,c=.9;t.update=function(a){for(var d=0;d<a.length;d++){var e=a[d],f=e.speed*e.speed+e.angularSpeed*e.angularSpeed;if(e.force.x>0||e.force.y>0)t.set(e,!1);else{var g=Math.min(e.motion,f),h=Math.max(e.motion,f);e.motion=c*g+(1-c)*h,e.sleepThreshold>0&&e.motion<b?(e.sleepCounter+=1,e.sleepCounter>=e.sleepThreshold&&t.set(e,!0)):e.sleepCounter>0&&(e.sleepCounter-=1)}}},t.afterCollisions=function(b){for(var c=0;c<b.length;c++){var d=b[c];if(d.isActive){var e=d.collision,f=e.bodyA,g=e.bodyB;if(!(f.isSleeping&&g.isSleeping||f.isStatic||g.isStatic)&&(f.isSleeping||g.isSleeping)){var h=f.isSleeping&&!f.isStatic?f:g,i=h===f?g:f;!h.isStatic&&i.motion>a&&t.set(h,!1)}}}},t.set=function(a,b){b?(a.isSleeping=!0,a.sleepCounter=a.sleepThreshold,a.positionImpulse.x=0,a.positionImpulse.y=0,a.positionPrev.x=a.position.x,a.positionPrev.y=a.position.y,a.anglePrev=a.angle,a.speed=0,a.angularSpeed=0,a.motion=0):(a.isSleeping=!1,a.sleepCounter=0)}}();var u={};!function(){u.rectangle=function(a,c,d,e,f){f=f||{};var g={label:"Rectangle Body",position:{x:a,y:c},vertices:z.fromPath("L 0 0 L "+d+" 0 L "+d+" "+e+" L 0 "+e)};if(f.chamfer){var h=f.chamfer;g.vertices=z.chamfer(g.vertices,h.radius,h.quality,h.qualityMin,h.qualityMax),delete f.chamfer}return b.create(o.extend({},g,f))},u.trapezoid=function(a,c,d,e,f,g){g=g||{},f*=.5;var h=(1-2*f)*d,i=d*f,j=i+h,k=j+i,l={label:"Trapezoid Body",position:{x:a,y:c},vertices:z.fromPath("L 0 0 L "+i+" "+-e+" L "+j+" "+-e+" L "+k+" 0")};
if(g.chamfer){var m=g.chamfer;l.vertices=z.chamfer(l.vertices,m.radius,m.quality,m.qualityMin,m.qualityMax),delete g.chamfer}return b.create(o.extend({},l,g))},u.circle=function(a,b,c,d,e){d=d||{},d.label="Circle Body",e=e||25;var f=Math.ceil(Math.max(10,Math.min(e,c)));return f%2===1&&(f+=1),d.circleRadius=c,u.polygon(a,b,f,c,d)},u.polygon=function(a,c,d,e,f){if(f=f||{},3>d)return u.circle(a,c,e,f);for(var g=2*Math.PI/d,h="",i=.5*g,j=0;d>j;j+=1){var k=i+j*g,l=Math.cos(k)*e,m=Math.sin(k)*e;h+="L "+l.toFixed(3)+" "+m.toFixed(3)+" "}var n={label:"Polygon Body",position:{x:a,y:c},vertices:z.fromPath(h)};if(f.chamfer){var p=f.chamfer;n.vertices=z.chamfer(n.vertices,p.radius,p.quality,p.qualityMin,p.qualityMax),delete f.chamfer}return b.create(o.extend({},n,f))}}();var v={};!function(){v.stack=function(a,d,e,f,g,h,i){for(var j,k=c.create({label:"Stack"}),l=a,m=d,n=0,o=0;f>o;o++){for(var p=0,q=0;e>q;q++){var r=i(l,m,q,o,j,n);if(r){var s=r.bounds.max.y-r.bounds.min.y,t=r.bounds.max.x-r.bounds.min.x;s>p&&(p=s),b.translate(r,{x:.5*t,y:.5*s}),l=r.bounds.max.x+g,c.addBody(k,r),j=r,n+=1}}m+=p+h,l=a}return k},v.chain=function(a,b,d,e,f,g){for(var h=a.bodies,i=1;i<h.length;i++){var j=h[i-1],k=h[i],l=j.bounds.max.y-j.bounds.min.y,n=j.bounds.max.x-j.bounds.min.x,p=k.bounds.max.y-k.bounds.min.y,q=k.bounds.max.x-k.bounds.min.x,r={bodyA:j,pointA:{x:n*b,y:l*d},bodyB:k,pointB:{x:q*e,y:p*f}},s=o.extend(r,g);c.addConstraint(a,m.create(s))}return a.label+=" Chain",a},v.mesh=function(a,b,d,e,f){var g,h,i,j,k,l=a.bodies;for(g=0;d>g;g++){for(h=0;b>h;h++)h>0&&(i=l[h-1+g*b],j=l[h+g*b],c.addConstraint(a,m.create(o.extend({bodyA:i,bodyB:j},f))));for(h=0;b>h;h++)g>0&&(i=l[h+(g-1)*b],j=l[h+g*b],c.addConstraint(a,m.create(o.extend({bodyA:i,bodyB:j},f))),e&&h>0&&(k=l[h-1+(g-1)*b],c.addConstraint(a,m.create(o.extend({bodyA:k,bodyB:j},f)))),e&&b-1>h&&(k=l[h+1+(g-1)*b],c.addConstraint(a,m.create(o.extend({bodyA:k,bodyB:j},f)))))}return a.label+=" Mesh",a},v.pyramid=function(a,c,d,e,f,g,h){return v.stack(a,c,d,e,f,g,function(c,g,i,j,k,l){var m=Math.min(e,Math.ceil(d/2)),n=k?k.bounds.max.x-k.bounds.min.x:0;if(!(j>m)){j=m-j;var o=j,p=d-1-j;if(!(o>i||i>p)){1===l&&b.translate(k,{x:(i+(d%2===1?1:-1))*n,y:0});var q=k?i*n:0;return h(a+q+i*f,g,i,j,k,l)}}})},v.newtonsCradle=function(a,b,d,e,f){for(var g=c.create({label:"Newtons Cradle"}),h=0;d>h;h++){var i=1.9,j=u.circle(a+h*e*i,b+f,e,{inertia:99999,restitution:1,friction:0,frictionAir:1e-4,slop:.01}),k=m.create({pointA:{x:a+h*e*i,y:b},bodyB:j});c.addBody(g,j),c.addConstraint(g,k)}return g},v.car=function(a,d,e,f,g){var h=b.nextGroupId(),i=-20,j=.5*-e+i,k=.5*e-i,l=0,n=c.create({label:"Car"}),o=u.trapezoid(a,d,e,f,.3,{groupId:h,friction:.01,chamfer:{radius:10}}),p=u.circle(a+j,d+l,g,{groupId:h,restitution:.5,friction:.9,density:.01}),q=u.circle(a+k,d+l,g,{groupId:h,restitution:.5,friction:.9,density:.01}),r=m.create({bodyA:o,pointA:{x:j,y:l},bodyB:p,stiffness:.5}),s=m.create({bodyA:o,pointA:{x:k,y:l},bodyB:q,stiffness:.5});return c.addBody(n,o),c.addBody(n,p),c.addBody(n,q),c.addConstraint(n,r),c.addConstraint(n,s),n},v.softBody=function(a,b,c,d,e,f,g,h,i,j){i=o.extend({inertia:1/0},i),j=o.extend({stiffness:.4},j);var k=v.stack(a,b,c,d,e,f,function(a,b){return u.circle(a,b,h,i)});return v.mesh(k,c,d,g,j),k.label="Soft Body",k}}();var w={};!function(){w.fromVertices=function(a){for(var b={},c=0;c<a.length;c++){var d=(c+1)%a.length,e=y.normalise({x:a[d].y-a[c].y,y:a[c].x-a[d].x}),f=0===e.y?1/0:e.x/e.y;f=f.toFixed(3).toString(),b[f]=e}return o.values(b)},w.rotate=function(a,b){if(0!==b)for(var c=Math.cos(b),d=Math.sin(b),e=0;e<a.length;e++){var f,g=a[e];f=g.x*c-g.y*d,g.y=g.x*d+g.y*c,g.x=f}}}();var x={};!function(){x.create=function(a){var b={min:{x:0,y:0},max:{x:0,y:0}};return a&&x.update(b,a),b},x.update=function(a,b,c){a.min.x=Number.MAX_VALUE,a.max.x=Number.MIN_VALUE,a.min.y=Number.MAX_VALUE,a.max.y=Number.MIN_VALUE;for(var d=0;d<b.length;d++){var e=b[d];e.x>a.max.x&&(a.max.x=e.x),e.x<a.min.x&&(a.min.x=e.x),e.y>a.max.y&&(a.max.y=e.y),e.y<a.min.y&&(a.min.y=e.y)}c&&(c.x>0?a.max.x+=c.x:a.min.x+=c.x,c.y>0?a.max.y+=c.y:a.min.y+=c.y)},x.contains=function(a,b){return b.x>=a.min.x&&b.x<=a.max.x&&b.y>=a.min.y&&b.y<=a.max.y},x.overlaps=function(a,b){return a.min.x<=b.max.x&&a.max.x>=b.min.x&&a.max.y>=b.min.y&&a.min.y<=b.max.y},x.translate=function(a,b){a.min.x+=b.x,a.max.x+=b.x,a.min.y+=b.y,a.max.y+=b.y},x.shift=function(a,b){var c=a.max.x-a.min.x,d=a.max.y-a.min.y;a.min.x=b.x,a.max.x=b.x+c,a.min.y=b.y,a.max.y=b.y+d}}();var y={};!function(){y.magnitude=function(a){return Math.sqrt(a.x*a.x+a.y*a.y)},y.magnitudeSquared=function(a){return a.x*a.x+a.y*a.y},y.rotate=function(a,b){var c=Math.cos(b),d=Math.sin(b);return{x:a.x*c-a.y*d,y:a.x*d+a.y*c}},y.rotateAbout=function(a,b,c){var d=Math.cos(b),e=Math.sin(b);return{x:c.x+((a.x-c.x)*d-(a.y-c.y)*e),y:c.y+((a.x-c.x)*e+(a.y-c.y)*d)}},y.normalise=function(a){var b=y.magnitude(a);return 0===b?{x:0,y:0}:{x:a.x/b,y:a.y/b}},y.dot=function(a,b){return a.x*b.x+a.y*b.y},y.cross=function(a,b){return a.x*b.y-a.y*b.x},y.add=function(a,b){return{x:a.x+b.x,y:a.y+b.y}},y.sub=function(a,b){return{x:a.x-b.x,y:a.y-b.y}},y.mult=function(a,b){return{x:a.x*b,y:a.y*b}},y.div=function(a,b){return{x:a.x/b,y:a.y/b}},y.perp=function(a,b){return b=b===!0?-1:1,{x:b*-a.y,y:b*a.x}},y.neg=function(a){return{x:-a.x,y:-a.y}},y.angle=function(a,b){return Math.atan2(b.y-a.y,b.x-a.x)}}();var z={};!function(){z.create=function(a,b){for(var c=0;c<a.length;c++)a[c].index=c,a[c].body=b},z.fromPath=function(a){var b=/L\s*([\-\d\.]*)\s*([\-\d\.]*)/gi,c=[];return a.replace(b,function(a,b,d){c.push({x:parseFloat(b,10),y:parseFloat(d,10)})}),c},z.centre=function(a){for(var b,c,d,e=z.area(a,!0),f={x:0,y:0},g=0;g<a.length;g++)d=(g+1)%a.length,b=y.cross(a[g],a[d]),c=y.mult(y.add(a[g],a[d]),b),f=y.add(f,c);return y.div(f,6*e)},z.area=function(a,b){for(var c=0,d=a.length-1,e=0;e<a.length;e++)c+=(a[d].x-a[e].x)*(a[d].y+a[e].y),d=e;return b?c/2:Math.abs(c)/2},z.inertia=function(a,b){for(var c,d,e=0,f=0,g=a,h=0;h<g.length;h++)d=(h+1)%g.length,c=Math.abs(y.cross(g[d],g[h])),e+=c*(y.dot(g[d],g[d])+y.dot(g[d],g[h])+y.dot(g[h],g[h])),f+=c;return b/6*(e/f)},z.translate=function(a,b,c){var d;if(c)for(d=0;d<a.length;d++)a[d].x+=b.x*c,a[d].y+=b.y*c;else for(d=0;d<a.length;d++)a[d].x+=b.x,a[d].y+=b.y},z.rotate=function(a,b,c){if(0!==b)for(var d=Math.cos(b),e=Math.sin(b),f=0;f<a.length;f++){var g=a[f],h=g.x-c.x,i=g.y-c.y;g.x=c.x+(h*d-i*e),g.y=c.y+(h*e+i*d)}},z.contains=function(a,b){for(var c=0;c<a.length;c++){var d=a[c],e=a[(c+1)%a.length];if((b.x-d.x)*(e.y-d.y)+(b.y-d.y)*(d.x-e.x)>0)return!1}return!0},z.scale=function(a,b,c,d){if(1===b&&1===c)return a;d=d||z.centre(a);for(var e,f,g=0;g<a.length;g++)e=a[g],f=y.sub(e,d),a[g].x=d.x+f.x*b,a[g].y=d.y+f.y*c;return a},z.chamfer=function(a,b,c,d,e){b=b||[8],b.length||(b=[b]),c="undefined"!=typeof c?c:-1,d=d||2,e=e||14;for(var f=(z.centre(a),[]),g=0;g<a.length;g++){var h=a[g-1>=0?g-1:a.length-1],i=a[g],j=a[(g+1)%a.length],k=b[g<b.length?g:b.length-1];if(0!==k){var l=y.normalise({x:i.y-h.y,y:h.x-i.x}),m=y.normalise({x:j.y-i.y,y:i.x-j.x}),n=Math.sqrt(2*Math.pow(k,2)),p=y.mult(o.clone(l),k),q=y.normalise(y.mult(y.add(l,m),.5)),r=y.sub(i,y.mult(q,n)),s=c;-1===c&&(s=1.75*Math.pow(k,.32)),s=o.clamp(s,d,e),s%2===1&&(s+=1);for(var t=Math.acos(y.dot(l,m)),u=t/s,v=0;s>v;v++)f.push(y.add(y.rotate(p,u*v),r))}else f.push(i)}return f}}();var A={};!function(){A.create=function(b){var c={controller:A,element:null,canvas:null,options:{width:800,height:600,background:"#fafafa",wireframeBackground:"#222",hasBounds:!1,enabled:!0,wireframes:!0,showSleeping:!0,showDebug:!1,showBroadphase:!1,showBounds:!1,showVelocity:!1,showCollisions:!1,showAxes:!1,showPositions:!1,showAngleIndicator:!1,showIds:!1,showShadows:!1}},d=o.extend(c,b);return d.canvas=d.canvas||a(d.options.width,d.options.height),d.context=d.canvas.getContext("2d"),d.textures={},d.bounds=d.bounds||{min:{x:0,y:0},max:{x:d.options.width,y:d.options.height}},A.setBackground(d,d.options.background),o.isElement(d.element)?d.element.appendChild(d.canvas):o.log('No "render.element" passed, "render.canvas" was not inserted into document.',"warn"),d},A.clear=function(){},A.setBackground=function(a,b){if(a.currentBackground!==b){var c=b;/(jpg|gif|png)$/.test(b)&&(c="url("+b+")"),a.canvas.style.background=c,a.canvas.style.backgroundSize="contain",a.currentBackground=b}},A.world=function(a){var b,d=a.render,e=a.world,f=d.canvas,g=d.context,h=d.options,i=c.allBodies(e),j=c.allConstraints(e),k=[],l=[];h.wireframes?A.setBackground(d,h.wireframeBackground):A.setBackground(d,h.background),g.globalCompositeOperation="source-in",g.fillStyle="transparent",g.fillRect(0,0,f.width,f.height),g.globalCompositeOperation="source-over";var m=d.bounds.max.x-d.bounds.min.x,n=d.bounds.max.y-d.bounds.min.y,o=m/d.options.width,p=n/d.options.height;if(h.hasBounds){for(b=0;b<i.length;b++){var q=i[b];x.overlaps(q.bounds,d.bounds)&&k.push(q)}for(b=0;b<j.length;b++){var r=j[b],s=r.bodyA,t=r.bodyB,u=r.pointA,v=r.pointB;s&&(u=y.add(s.position,r.pointA)),t&&(v=y.add(t.position,r.pointB)),u&&v&&(x.contains(d.bounds,u)||x.contains(d.bounds,v))&&l.push(r)}g.scale(1/o,1/p),g.translate(-d.bounds.min.x,-d.bounds.min.y)}else l=j,k=i;!h.wireframes||a.enableSleeping&&h.showSleeping?A.bodies(a,k,g):A.bodyWireframes(a,k,g),h.showBounds&&A.bodyBounds(a,k,g),(h.showAxes||h.showAngleIndicator)&&A.bodyAxes(a,k,g),h.showPositions&&A.bodyPositions(a,k,g),h.showVelocity&&A.bodyVelocity(a,k,g),h.showIds&&A.bodyIds(a,k,g),h.showCollisions&&A.collisions(a,a.pairs.list,g),A.constraints(l,g),h.showBroadphase&&"grid"===a.broadphase.current&&A.grid(a,a.broadphase[a.broadphase.current].instance,g),h.showDebug&&A.debug(a,g),h.hasBounds&&g.setTransform(1,0,0,1,0,0)},A.debug=function(a,b){var d=b,e=a.world,f=a.render,h=f.options,i=c.allBodies(e),j="    ";if(a.timing.timestamp-(f.debugTimestamp||0)>=500){var k="";k+="fps: "+Math.round(a.timing.fps)+j,a.metrics.extended&&(k+="delta: "+a.timing.delta.toFixed(3)+j,k+="correction: "+a.timing.correction.toFixed(3)+j,k+="bodies: "+i.length+j,a.broadphase.controller===g&&(k+="buckets: "+a.metrics.buckets+j),k+="\n",k+="collisions: "+a.metrics.collisions+j,k+="pairs: "+a.pairs.list.length+j,k+="broad: "+a.metrics.broadEff+j,k+="mid: "+a.metrics.midEff+j,k+="narrow: "+a.metrics.narrowEff+j),f.debugString=k,f.debugTimestamp=a.timing.timestamp}if(f.debugString){d.font="12px Arial",d.fillStyle=h.wireframes?"rgba(255,255,255,0.5)":"rgba(0,0,0,0.5)";for(var l=f.debugString.split("\n"),m=0;m<l.length;m++)d.fillText(l[m],50,50+18*m)}},A.constraints=function(a,b){for(var c=b,d=0;d<a.length;d++){var e=a[d];if(e.render.visible&&e.pointA&&e.pointB){var f=e.bodyA,g=e.bodyB;f?(c.beginPath(),c.moveTo(f.position.x+e.pointA.x,f.position.y+e.pointA.y)):(c.beginPath(),c.moveTo(e.pointA.x,e.pointA.y)),g?c.lineTo(g.position.x+e.pointB.x,g.position.y+e.pointB.y):c.lineTo(e.pointB.x,e.pointB.y),c.lineWidth=e.render.lineWidth,c.strokeStyle=e.render.strokeStyle,c.stroke()}}},A.bodyShadows=function(a,b,c){for(var d=c,e=a.render,f=(e.options,0);f<b.length;f++){var g=b[f];if(g.render.visible){if(g.circleRadius)d.beginPath(),d.arc(g.position.x,g.position.y,g.circleRadius,0,2*Math.PI),d.closePath();else{d.beginPath(),d.moveTo(g.vertices[0].x,g.vertices[0].y);for(var h=1;h<g.vertices.length;h++)d.lineTo(g.vertices[h].x,g.vertices[h].y);d.closePath()}var i=g.position.x-.5*e.options.width,j=g.position.y-.2*e.options.height,k=Math.abs(i)+Math.abs(j);d.shadowColor="rgba(0,0,0,0.15)",d.shadowOffsetX=.05*i,d.shadowOffsetY=.05*j,d.shadowBlur=1+12*Math.min(1,k/1e3),d.fill(),d.shadowColor=null,d.shadowOffsetX=null,d.shadowOffsetY=null,d.shadowBlur=null}}},A.bodies=function(a,c,d){var e,f=d,g=a.render,h=g.options;for(e=0;e<c.length;e++){var i=c[e];if(i.render.visible)if(i.render.sprite&&i.render.sprite.texture&&!h.wireframes){var j=i.render.sprite,k=b(g,j.texture);h.showSleeping&&i.isSleeping&&(f.globalAlpha=.5),f.translate(i.position.x,i.position.y),f.rotate(i.angle),f.drawImage(k,k.width*-.5*j.xScale,k.height*-.5*j.yScale,k.width*j.xScale,k.height*j.yScale),f.rotate(-i.angle),f.translate(-i.position.x,-i.position.y),h.showSleeping&&i.isSleeping&&(f.globalAlpha=1)}else{if(i.circleRadius)f.beginPath(),f.arc(i.position.x,i.position.y,i.circleRadius,0,2*Math.PI);else{f.beginPath(),f.moveTo(i.vertices[0].x,i.vertices[0].y);for(var l=1;l<i.vertices.length;l++)f.lineTo(i.vertices[l].x,i.vertices[l].y);f.closePath()}h.wireframes?(f.lineWidth=1,f.strokeStyle="#bbb",h.showSleeping&&i.isSleeping&&(f.strokeStyle="rgba(255,255,255,0.2)"),f.stroke()):(f.fillStyle=h.showSleeping&&i.isSleeping?o.shadeColor(i.render.fillStyle,50):i.render.fillStyle,f.lineWidth=i.render.lineWidth,f.strokeStyle=i.render.strokeStyle,f.fill(),f.stroke())}}},A.bodyWireframes=function(a,b,c){var d,e,f=c;for(f.beginPath(),d=0;d<b.length;d++){var g=b[d];if(g.render.visible){for(f.moveTo(g.vertices[0].x,g.vertices[0].y),e=1;e<g.vertices.length;e++)f.lineTo(g.vertices[e].x,g.vertices[e].y);f.lineTo(g.vertices[0].x,g.vertices[0].y)}}f.lineWidth=1,f.strokeStyle="#bbb",f.stroke()},A.bodyBounds=function(a,b,c){var d=c,e=a.render,f=e.options;d.beginPath();for(var g=0;g<b.length;g++){var h=b[g];h.render.visible&&d.rect(h.bounds.min.x,h.bounds.min.y,h.bounds.max.x-h.bounds.min.x,h.bounds.max.y-h.bounds.min.y)}d.strokeStyle=f.wireframes?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.1)",d.lineWidth=1,d.stroke()},A.bodyAxes=function(a,b,c){var d,e,f=c,g=a.render,h=g.options;for(f.beginPath(),d=0;d<b.length;d++){var i=b[d];if(i.render.visible)if(h.showAxes)for(e=0;e<i.axes.length;e++){var j=i.axes[e];f.moveTo(i.position.x,i.position.y),f.lineTo(i.position.x+20*j.x,i.position.y+20*j.y)}else f.moveTo(i.position.x,i.position.y),f.lineTo((i.vertices[0].x+i.vertices[i.vertices.length-1].x)/2,(i.vertices[0].y+i.vertices[i.vertices.length-1].y)/2)}f.strokeStyle=h.wireframes?"indianred":"rgba(0,0,0,0.3)",f.lineWidth=1,f.stroke()},A.bodyPositions=function(a,b,c){var d,e,f=c,g=a.render,h=g.options;for(f.beginPath(),e=0;e<b.length;e++)d=b[e],d.render.visible&&(f.arc(d.position.x,d.position.y,3,0,2*Math.PI,!1),f.closePath());for(f.fillStyle=h.wireframes?"indianred":"rgba(0,0,0,0.5)",f.fill(),f.beginPath(),e=0;e<b.length;e++)d=b[e],d.render.visible&&(f.arc(d.positionPrev.x,d.positionPrev.y,2,0,2*Math.PI,!1),f.closePath());f.fillStyle="rgba(255,165,0,0.8)",f.fill()},A.bodyVelocity=function(a,b,c){{var d=c,e=a.render;e.options}d.beginPath();for(var f=0;f<b.length;f++){var g=b[f];g.render.visible&&(d.moveTo(g.position.x,g.position.y),d.lineTo(g.position.x+2*(g.position.x-g.positionPrev.x),g.position.y+2*(g.position.y-g.positionPrev.y)))}d.lineWidth=3,d.strokeStyle="cornflowerblue",d.stroke()},A.bodyIds=function(a,b,c){for(var d=c,e=0;e<b.length;e++){var f=b[e];f.render.visible&&(d.font="12px Arial",d.fillStyle="rgba(255,255,255,0.5)",d.fillText(f.id,f.position.x+10,f.position.y-10))}},A.collisions=function(a,b,c){var d,e,f,g,h=c,i=a.render.options;for(h.beginPath(),f=0;f<b.length;f++)for(d=b[f],e=d.collision,g=0;g<d.activeContacts.length;g++){var j=d.activeContacts[g],k=j.vertex;h.rect(k.x-1.5,k.y-1.5,3.5,3.5)}for(h.fillStyle=i.wireframes?"rgba(255,255,255,0.7)":"orange",h.fill(),h.beginPath(),f=0;f<b.length;f++)if(d=b[f],e=d.collision,d.activeContacts.length>0){var l=d.activeContacts[0].vertex.x,m=d.activeContacts[0].vertex.y;2===d.activeContacts.length&&(l=(d.activeContacts[0].vertex.x+d.activeContacts[1].vertex.x)/2,m=(d.activeContacts[0].vertex.y+d.activeContacts[1].vertex.y)/2),h.moveTo(l-8*e.normal.x,m-8*e.normal.y),h.lineTo(l,m)}h.strokeStyle=i.wireframes?"rgba(255,165,0,0.7)":"orange",h.lineWidth=1,h.stroke()},A.grid=function(a,b,c){var d=c,e=a.render.options;d.strokeStyle=e.wireframes?"rgba(255,180,0,0.1)":"rgba(255,180,0,0.5)",d.beginPath();for(var f=o.keys(b.buckets),g=0;g<f.length;g++){var h=f[g];if(!(b.buckets[h].length<2)){var i=h.split(",");d.rect(.5+parseInt(i[0],10)*b.bucketWidth,.5+parseInt(i[1],10)*b.bucketHeight,b.bucketWidth,b.bucketHeight)}}d.lineWidth=1,d.stroke()},A.inspector=function(a,b){var c,d=a.engine,e=(d.input.mouse,a.selected),f=d.render,g=f.options;if(g.hasBounds){var h=f.bounds.max.x-f.bounds.min.x,i=f.bounds.max.y-f.bounds.min.y,j=h/f.options.width,k=i/f.options.height;b.scale(1/j,1/k),b.translate(-f.bounds.min.x,-f.bounds.min.y)}for(var l=0;l<e.length;l++){var m=e[l].data;switch(b.translate(.5,.5),b.lineWidth=1,b.strokeStyle="rgba(255,165,0,0.9)",b.setLineDash([1,2]),m.type){case"body":c=m.bounds,b.beginPath(),b.rect(Math.floor(c.min.x-3),Math.floor(c.min.y-3),Math.floor(c.max.x-c.min.x+6),Math.floor(c.max.y-c.min.y+6)),b.closePath(),b.stroke();break;case"constraint":var n=m.pointA;m.bodyA&&(n=m.pointB),b.beginPath(),b.arc(n.x,n.y,10,0,2*Math.PI),b.closePath(),b.stroke()}b.setLineDash([0]),b.translate(-.5,-.5)}null!==a.selectStart&&(b.translate(.5,.5),b.lineWidth=1,b.strokeStyle="rgba(255,165,0,0.6)",b.fillStyle="rgba(255,165,0,0.1)",c=a.selectBounds,b.beginPath(),b.rect(Math.floor(c.min.x),Math.floor(c.min.y),Math.floor(c.max.x-c.min.x),Math.floor(c.max.y-c.min.y)),b.closePath(),b.stroke(),b.fill(),b.translate(-.5,-.5)),g.hasBounds&&b.setTransform(1,0,0,1,0,0)};var a=function(a,b){var c=document.createElement("canvas");return c.width=a,c.height=b,c.oncontextmenu=function(){return!1},c.onselectstart=function(){return!1},c},b=function(a,b){var c=a.textures[b];return c?c:(c=a.textures[b]=new Image,c.src=b,c)}}();var B={};!function(){B.create=function(a){var b={controller:B,element:null,canvas:null,options:{width:800,height:600,background:"#fafafa",wireframeBackground:"#222",enabled:!0,wireframes:!0,showSleeping:!0,showDebug:!1,showBroadphase:!1,showBounds:!1,showVelocity:!1,showCollisions:!1,showAxes:!1,showPositions:!1,showAngleIndicator:!1,showIds:!1,showShadows:!1}},c=o.extend(b,a);return c.context=new PIXI.WebGLRenderer(800,600,c.canvas,!1,!0),c.canvas=c.context.view,c.stage=new PIXI.Stage,c.textures={},c.sprites={},c.primitives={},c.spriteBatch=new PIXI.SpriteBatch,c.stage.addChild(c.spriteBatch),o.isElement(c.element)?c.element.appendChild(c.canvas):o.log('No "render.element" passed, "render.canvas" was not inserted into document.',"warn"),c.canvas.oncontextmenu=function(){return!1},c.canvas.onselectstart=function(){return!1},c},B.clear=function(a){for(var b=a.stage,c=a.spriteBatch;b.children[0];)b.removeChild(b.children[0]);for(;c.children[0];)c.removeChild(c.children[0]);var d=a.sprites["bg-0"];a.textures={},a.sprites={},a.primitives={},a.sprites["bg-0"]=d,d&&c.addChildAt(d,0),a.stage.addChild(a.spriteBatch),a.currentBackground=null},B.setBackground=function(a,b){if(a.currentBackground!==b){var c=b.indexOf&&-1!==b.indexOf("#"),e=a.sprites["bg-0"];if(c){var f=o.colorToNumber(b);a.stage.setBackgroundColor(f),e&&a.spriteBatch.removeChild(e)}else if(!e){var g=d(a,b);e=a.sprites["bg-0"]=new PIXI.Sprite(g),e.position.x=0,e.position.y=0,a.spriteBatch.addChildAt(e,0)}a.currentBackground=b}},B.world=function(a){var b,d=a.render,e=a.world,f=d.context,g=d.stage,h=d.options,i=c.allBodies(e),j=c.allConstraints(e);for(h.wireframes?B.setBackground(d,h.wireframeBackground):B.setBackground(d,h.background),b=0;b<i.length;b++)B.body(a,i[b]);for(b=0;b<j.length;b++)B.constraint(a,j[b]);f.render(g)},B.constraint=function(a,b){var c=a.render,d=b.bodyA,e=b.bodyB,f=b.pointA,g=b.pointB,h=c.stage,i=b.render,j="c-"+b.id,k=c.primitives[j];return k||(k=c.primitives[j]=new PIXI.Graphics),i.visible&&b.pointA&&b.pointB?(-1===h.children.indexOf(k)&&h.addChild(k),k.clear(),k.beginFill(0,0),k.lineStyle(i.lineWidth,o.colorToNumber(i.strokeStyle),1),d?k.moveTo(d.position.x+f.x,d.position.y+f.y):k.moveTo(f.x,f.y),e?k.lineTo(e.position.x+g.x,e.position.y+g.y):k.lineTo(g.x,g.y),void k.endFill()):void k.clear()},B.body=function(c,d){var e=c.render,f=d.render;if(f.visible)if(f.sprite&&f.sprite.texture){var g="b-"+d.id,h=e.sprites[g],i=e.spriteBatch;h||(h=e.sprites[g]=a(e,d)),-1===i.children.indexOf(h)&&i.addChild(h),h.position.x=d.position.x,h.position.y=d.position.y,h.rotation=d.angle}else{var j="b-"+d.id,k=e.primitives[j],l=e.stage;k||(k=e.primitives[j]=b(e,d),k.initialAngle=d.angle),-1===l.children.indexOf(k)&&l.addChild(k),k.position.x=d.position.x,k.position.y=d.position.y,k.rotation=d.angle-k.initialAngle}};var a=function(a,b){var c=b.render,e=c.sprite.texture,f=d(a,e),g=new PIXI.Sprite(f);return g.anchor.x=.5,g.anchor.y=.5,g},b=function(a,b){var c=b.render,d=a.options,e=new PIXI.Graphics;e.clear(),d.wireframes?(e.beginFill(0,0),e.lineStyle(1,o.colorToNumber("#bbb"),1)):(e.beginFill(o.colorToNumber(c.fillStyle),1),e.lineStyle(b.render.lineWidth,o.colorToNumber(c.strokeStyle),1)),e.moveTo(b.vertices[0].x-b.position.x,b.vertices[0].y-b.position.y);for(var f=1;f<b.vertices.length;f++)e.lineTo(b.vertices[f].x-b.position.x,b.vertices[f].y-b.position.y);return e.lineTo(b.vertices[0].x-b.position.x,b.vertices[0].y-b.position.y),e.endFill(),(d.showAngleIndicator||d.showAxes)&&(e.beginFill(0,0),d.wireframes?e.lineStyle(1,o.colorToNumber("#CD5C5C"),1):e.lineStyle(1,o.colorToNumber(b.render.strokeStyle)),e.moveTo(0,0),e.lineTo((b.vertices[0].x+b.vertices[b.vertices.length-1].x)/2-b.position.x,(b.vertices[0].y+b.vertices[b.vertices.length-1].y)/2-b.position.y),e.endFill()),e},d=function(a,b){var c=a.textures[b];return c||(c=a.textures[b]=PIXI.Texture.fromImage(b)),c}}(),d.add=c.add,d.remove=c.remove,d.addComposite=c.addComposite,d.addBody=c.addBody,d.addConstraint=c.addConstraint,d.clear=c.clear,a.Body=b,a.Composite=c,a.World=d,a.Contact=e,a.Detector=f,a.Grid=g,a.Pairs=i,a.Pair=h,a.Resolver=k,a.SAT=l,a.Constraint=m,a.MouseConstraint=n,a.Common=o,a.Engine=p,a.Metrics=r,a.Mouse=s,a.Sleeping=t,a.Bodies=u,a.Composites=v,a.Axes=w,a.Bounds=x,a.Vector=y,a.Vertices=z,a.Render=A,a.RenderPixi=B,a.Events=q,a.Query=j,"undefined"!=typeof exports&&("undefined"!=typeof module&&module.exports&&(exports=module.exports=a),exports.Matter=a),"function"==typeof define&&define.amd&&define("Matter",[],function(){return a}),"object"==typeof window&&"object"==typeof window.document&&(window.Matter=a)}();
},{}],3:[function(require,module,exports){
module.exports = function preloadImg (url) {
  var img = new window.Image()
  img.src = url
}

},{}],4:[function(require,module,exports){
var ua = typeof window !== 'undefined' ? window.navigator.userAgent : ''
  , isOSX = /OS X/.test(ua)
  , isOpera = /Opera/.test(ua)
  , maybeFirefox = !/like Gecko/.test(ua) && !isOpera

var i, output = module.exports = {
  0:  isOSX ? '<menu>' : '<UNK>'
, 1:  '<mouse 1>'
, 2:  '<mouse 2>'
, 3:  '<break>'
, 4:  '<mouse 3>'
, 5:  '<mouse 4>'
, 6:  '<mouse 5>'
, 8:  '<backspace>'
, 9:  '<tab>'
, 12: '<clear>'
, 13: '<enter>'
, 16: '<shift>'
, 17: '<control>'
, 18: '<alt>'
, 19: '<pause>'
, 20: '<caps-lock>'
, 21: '<ime-hangul>'
, 23: '<ime-junja>'
, 24: '<ime-final>'
, 25: '<ime-kanji>'
, 27: '<escape>'
, 28: '<ime-convert>'
, 29: '<ime-nonconvert>'
, 30: '<ime-accept>'
, 31: '<ime-mode-change>'
, 27: '<escape>'
, 32: '<space>'
, 33: '<page-up>'
, 34: '<page-down>'
, 35: '<end>'
, 36: '<home>'
, 37: '<left>'
, 38: '<up>'
, 39: '<right>'
, 40: '<down>'
, 41: '<select>'
, 42: '<print>'
, 43: '<execute>'
, 44: '<snapshot>'
, 45: '<insert>'
, 46: '<delete>'
, 47: '<help>'
, 91: '<meta>'  // meta-left -- no one handles left and right properly, so we coerce into one.
, 92: '<meta>'  // meta-right
, 93: isOSX ? '<meta>' : '<menu>'      // chrome,opera,safari all report this for meta-right (osx mbp).
, 95: '<sleep>'
, 106: '<num-*>'
, 107: '<num-+>'
, 108: '<num-enter>'
, 109: '<num-->'
, 110: '<num-.>'
, 111: '<num-/>'
, 144: '<num-lock>'
, 145: '<scroll-lock>'
, 160: '<shift-left>'
, 161: '<shift-right>'
, 162: '<control-left>'
, 163: '<control-right>'
, 164: '<alt-left>'
, 165: '<alt-right>'
, 166: '<browser-back>'
, 167: '<browser-forward>'
, 168: '<browser-refresh>'
, 169: '<browser-stop>'
, 170: '<browser-search>'
, 171: '<browser-favorites>'
, 172: '<browser-home>'

  // ff/osx reports '<volume-mute>' for '-'
, 173: isOSX && maybeFirefox ? '-' : '<volume-mute>'
, 174: '<volume-down>'
, 175: '<volume-up>'
, 176: '<next-track>'
, 177: '<prev-track>'
, 178: '<stop>'
, 179: '<play-pause>'
, 180: '<launch-mail>'
, 181: '<launch-media-select>'
, 182: '<launch-app 1>'
, 183: '<launch-app 2>'
, 186: ';'
, 187: '='
, 188: ','
, 189: '-'
, 190: '.'
, 191: '/'
, 192: '`'
, 219: '['
, 220: '\\'
, 221: ']'
, 222: "'"
, 223: '<meta>'
, 224: '<meta>'       // firefox reports meta here.
, 226: '<alt-gr>'
, 229: '<ime-process>'
, 231: isOpera ? '`' : '<unicode>'
, 246: '<attention>'
, 247: '<crsel>'
, 248: '<exsel>'
, 249: '<erase-eof>'
, 250: '<play>'
, 251: '<zoom>'
, 252: '<no-name>'
, 253: '<pa-1>'
, 254: '<clear>'
}

for(i = 58; i < 65; ++i) {
  output[i] = String.fromCharCode(i)
}

// 0-9
for(i = 48; i < 58; ++i) {
  output[i] = (i - 48)+''
}

// A-Z
for(i = 65; i < 91; ++i) {
  output[i] = String.fromCharCode(i)
}

// num0-9
for(i = 96; i < 106; ++i) {
  output[i] = '<num-'+(i - 96)+'>'
}

// F1-F24
for(i = 112; i < 136; ++i) {
  output[i] = 'F'+(i-111)
}

},{}]},{},[1])