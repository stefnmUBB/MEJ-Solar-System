function min(x,y) { return x<y?x:y;}
function max(x,y) { return x>y?x:y;}
function rgba(r,g,b,a=1) { return "rgba("+r+","+g+","+b+","+a+")"; }

function Vector2(x=0,y=0) {
	this.x=x;
	this.y=y;
}

Vector2.prototype.add=function(v){
	return new Vector2(this.x+v.x,this.y+v.y);
}

Vector2.prototype.sub=function(v){
	return new Vector2(this.x-v.x,this.y-v.y);
}

Vector2.prototype.mul=function(m) {
	return new Vector2(this.x*m,this.y*m);
}

Vector2.prototype.abs=function(){
	return Math.sqrt(this.x**2+this.y**2);
}

function Vector3(x=0,y=0,z=0){
	this.x=x;
	this.y=y;
	this.z=z;
}

Vector3.prototype.add=function(v){
	return new Vector3(this.x+v.x,this.y+v.y,this.z+v.z);
}

Vector3.prototype.sub=function(v){
	return new Vector3(this.x-v.x,this.y-v.y,this.z-v.z);
}

Vector3.prototype.mul=function(m) {
	return new Vector3(this.x*m,this.y*m,this.z*m);
}

Vector3.prototype.abs=function(){
	return Math.sqrt(this.x**2+this.y**2+this.z**2);
}

function Scene(control){
	this.control=control;
	this.camera=new Vector3(1,1,1);
	this.points=[];
	
	this.clear();
	
	this.scale=new Vector2(1e9,1e9);
	this.viewpoint=new Vector2(0,0);
}

Scene.prototype.attachControl=function(canvas) {
	this.control=canvas;
}

Scene.prototype.clearScene=function(){
	this.points=[];
}

Scene.prototype.clear=function(cl="black"){
	var ctx=this.control.getContext("2d");
	ctx.beginPath();
	ctx.rect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle=cl;
	ctx.fill();
}

Scene.prototype.drawPoint=function(vec){
	this.points.push(vec);
}

Scene.prototype.convertX=function(X){
	return this.control.width*.5+(1/this.scale.x*X-this.viewpoint.x);
}

Scene.prototype.convertY=function(Y){
	return this.control.height*.5+(1/this.scale.y*Y-this.viewpoint.y);
}

Scene.prototype.line=function(v1,v2){
	ctx=this.control.getContext('2d');
	var x1=this.convertX(v1.x), y1=this.convertY(v1.y);
	var x2=this.convertX(v2.x), y2=this.convertY(v2.y);
	var grad= ctx.createLinearGradient(x1,y1,x2,y2);
	grad.addColorStop(0, v1.cl);
	grad.addColorStop(1, v2.cl);
	ctx.beginPath();
	ctx.strokeStyle=grad;
	ctx.moveTo(x1,y1);
	ctx.lineTo(x2,y2);
	ctx.stroke();
}

Scene.prototype.render=function(){
	ctx=this.control.getContext('2d');
	for(i=0;i<this.points.length;i++) {
		var S=new Vector2(this.points[i].x,this.points[i].y);
		ctx.beginPath();
		ctx.fillStyle=this.points[i].cl;
		if(this.points[i].trajectory) {
			ctx.arc(this.convertX(S.x),this.convertY(S.y),1,0,2*Math.PI);
		}else{
			ctx.arc(this.convertX(S.x),this.convertY(S.y),max(5,this.points[i].radius/this.scale.x),0,2*Math.PI);
		}
		
		ctx.fill();
	}
}

function Body(name="",r=new Vector3(),v=new Vector3(0.1,0,0),m=0,density=1000,color="white"){
	this.watch('mass',function(id,old,cur){
		this.invmass=1/m;
		return cur;
	});
	this.name=name;
	this.mass=m;
	this.r=r;
	this.v=v;
	this.color=color;
	this.density=density;
	this.active=true;
	this.path=[];
	this.pathDelay=0;
	
	this.backup=[];
	this.backup['mass']=m;
	this.backup['density']=density;
	
}

Body.prototype.update=function(f=new Vector3(),dt=10){
	if(!this.active) {
		if(this.path.length>0) this.path.shift();
		return;
	}
	this.r=this.r.add(this.v.mul(dt));
	var a=new Vector3(f.x*this.invmass,f.y*this.invmass,f.z*this.invmass);
	this.v=this.v.add(a.mul(dt));
	this.pathDelay++;
	if(this.pathDelay>=100) {
		this.path.push(this.r);
		if(this.path.length>300) this.path.shift();
		this.pathDelay=0;
	}
}

function System(control){
	this.K=6.67408e-11;
	this.scene=new Scene(control);
	this.bodies=[];
	this.pause=false;
	this.focus=-1;
	this.dt=10;
}

System.prototype.addBody=function(b){
	this.bodies.push(b); 
}

System.prototype.update=function(){
	if(this.pause) return;
	for(i=0;i<this.bodies.length;i++){
		var f=new Vector3();
		for(j=0;j<this.bodies.length;j++) {
			if(j!=i && this.bodies[j].active){
				var r=this.bodies[j].r.sub(this.bodies[i].r);
				f=f.add(r.mul(this.K*this.bodies[i].mass*this.bodies[j].mass/(r.abs()**3)));			
			}
		}
		this.bodies[i].f=f;
		this.bodies[i].update(f,this.dt);
	}
}

System.prototype.render=function(){
	if(this.focus>=0) {
		this.scene.viewpoint.x=this.bodies[this.focus].r.x/this.scene.scale.x;
		this.scene.viewpoint.y=this.bodies[this.focus].r.y/this.scene.scale.y;
	}
	this.scene.clearScene();
	this.scene.clear();
	for(i=0;i<this.bodies.length;i++) {
		if(this.bodies[i].path.length>1){
			for(q=0;q<this.bodies[i].path.length-1;q++) {
				var w= jQuery.extend(true, {}, this.bodies[i].path[q]);
				w.cl=rgba(255,255,255,q/this.bodies[i].path.length);
				w.trajectory=true;
				var v= jQuery.extend(true, {}, this.bodies[i].path[q+1]);
				v.cl=rgba(255,255,255,q/this.bodies[i].path.length);
				v.trajectory=true;
				this.scene.line(w,v);
			}
		}
		if(!this.bodies[i].active) continue;
		var w=this.bodies[i].r;
		w.cl=this.bodies[i].color;
		var v=this.bodies[i].mass/this.bodies[i].density;
		w.radius=Math.pow(3*v/(4*Math.PI),0.333333333);
		this.scene.drawPoint(w);
	}
	this.scene.render();
}

